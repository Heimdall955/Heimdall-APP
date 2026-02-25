import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Dimensions, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as Location from 'expo-location';
import axios from 'axios';
import { SecureStore } from '../utils/secureStore';
import { useAuth } from '../contexts/AuthContext';
import { Card, Button } from '../components/ui';
import { Colors, Spacing, BorderRadius, FontSizes, Shadows } from '../constants/theme';
import { useTheme } from '../contexts/ThemeContext';

const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL || '';
const { width } = Dimensions.get('window');

interface Route {
  id: string;
  name: string;
  distance: number;
  duration: number;
  date: string;
  points: { lat: number; lng: number }[];
}

export default function RutasScreen() {
  const router = useRouter();
  const { currentDog } = useAuth();
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [isTracking, setIsTracking] = useState(false);
  const [routes, setRoutes] = useState<Route[]>([]);
  const [currentRoute, setCurrentRoute] = useState<{ lat: number; lng: number }[]>([]);
  const [trackingStats, setTrackingStats] = useState({ distance: 0, duration: 0 });
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const watchId = useRef<Location.LocationSubscription | null>(null);
  const startTime = useRef<Date | null>(null);
  const timerInterval = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    loadRoutes();
    requestLocationPermission();
    
    return () => {
      stopTracking();
    };
  }, []);

  const requestLocationPermission = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      setErrorMsg('Se requiere permiso de ubicación para usar esta función');
      return;
    }

    const currentLocation = await Location.getCurrentPositionAsync({});
    setLocation(currentLocation);
  };

  const loadRoutes = async () => {
    try {
      const token = await SecureStore.getItemAsync('session_token');
      if (!token || !currentDog) return;
      
      const response = await axios.get(
        `${BACKEND_URL}/api/routes/${currentDog.id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setRoutes(response.data);
    } catch (error) {
      // Routes might not exist yet
      setRoutes([]);
    }
  };

  const startTracking = async () => {
    if (errorMsg) {
      Alert.alert('Error', errorMsg);
      return;
    }

    setIsTracking(true);
    setCurrentRoute([]);
    setTrackingStats({ distance: 0, duration: 0 });
    startTime.current = new Date();

    // Update timer every second
    timerInterval.current = setInterval(() => {
      if (startTime.current) {
        const elapsed = Math.floor((Date.now() - startTime.current.getTime()) / 1000);
        setTrackingStats(prev => ({ ...prev, duration: elapsed }));
      }
    }, 1000);

    // Track location
    watchId.current = await Location.watchPositionAsync(
      {
        accuracy: Location.Accuracy.High,
        timeInterval: 2000,
        distanceInterval: 5,
      },
      (newLocation) => {
        const newPoint = {
          lat: newLocation.coords.latitude,
          lng: newLocation.coords.longitude,
        };
        
        setCurrentRoute(prev => {
          const newRoute = [...prev, newPoint];
          
          // Calculate distance
          if (newRoute.length > 1) {
            const lastPoint = newRoute[newRoute.length - 2];
            const dist = calculateDistance(lastPoint.lat, lastPoint.lng, newPoint.lat, newPoint.lng);
            setTrackingStats(s => ({ ...s, distance: s.distance + dist }));
          }
          
          return newRoute;
        });
      }
    );
  };

  const stopTracking = async () => {
    if (watchId.current) {
      watchId.current.remove();
      watchId.current = null;
    }
    if (timerInterval.current) {
      clearInterval(timerInterval.current);
      timerInterval.current = null;
    }
    
    if (isTracking && currentRoute.length > 0) {
      await saveRoute();
    }
    
    setIsTracking(false);
  };

  const saveRoute = async () => {
    try {
      const token = await SecureStore.getItemAsync('session_token');
      if (!token || !currentDog) return;

      await axios.post(
        `${BACKEND_URL}/api/routes`,
        {
          dog_id: currentDog.id,
          name: `Paseo ${new Date().toLocaleDateString('es-ES')}`,
          distance: trackingStats.distance,
          duration: trackingStats.duration,
          points: currentRoute,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Award bones for completing a walk
      try {
        await axios.post(
          `${BACKEND_URL}/api/gamification/add-bones`,
          { amount: Math.floor(trackingStats.distance / 100) + 10, reason: 'Paseo completado' },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } catch (e) {}

      Alert.alert('¡Ruta guardada!', `Has ganado ${Math.floor(trackingStats.distance / 100) + 10} huesos 🦴`);
      loadRoutes();
    } catch (error) {
      Alert.alert('Error', 'No se pudo guardar la ruta');
    }
  };

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371e3; // Earth radius in meters
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
              Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // Distance in meters
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatDistance = (meters: number) => {
    if (meters >= 1000) {
      return `${(meters / 1000).toFixed(2)} km`;
    }
    return `${Math.round(meters)} m`;
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={Colors.text} />
          </TouchableOpacity>
          <View style={styles.headerText}>
            <Text style={styles.title}>Rutas GPS</Text>
            <Text style={styles.subtitle}>Paseos de {currentDog?.name}</Text>
          </View>
        </View>

        {/* Current Location */}
        {location && (
          <Card style={styles.locationCard} variant="elevated">
            <View style={styles.locationHeader}>
              <Ionicons name="location" size={24} color={Colors.primary} />
              <View style={styles.locationInfo}>
                <Text style={styles.locationTitle}>Ubicación actual</Text>
                <Text style={styles.locationCoords}>
                  {location.coords.latitude.toFixed(6)}, {location.coords.longitude.toFixed(6)}
                </Text>
              </View>
            </View>
          </Card>
        )}

        {/* Tracking Card */}
        <Card style={[styles.trackingCard, isTracking && styles.trackingCardActive]} variant="elevated">
          {isTracking ? (
            <>
              <View style={styles.trackingHeader}>
                <View style={styles.pulseIndicator} />
                <Text style={styles.trackingTitle}>Grabando ruta...</Text>
              </View>
              
              <View style={styles.statsGrid}>
                <View style={styles.statBox}>
                  <Text style={styles.statValue}>{formatDistance(trackingStats.distance)}</Text>
                  <Text style={styles.statLabel}>Distancia</Text>
                </View>
                <View style={styles.statBox}>
                  <Text style={styles.statValue}>{formatDuration(trackingStats.duration)}</Text>
                  <Text style={styles.statLabel}>Tiempo</Text>
                </View>
                <View style={styles.statBox}>
                  <Text style={styles.statValue}>{currentRoute.length}</Text>
                  <Text style={styles.statLabel}>Puntos</Text>
                </View>
              </View>

              <Button
                title="Detener y Guardar"
                onPress={stopTracking}
                variant="secondary"
                icon={<Ionicons name="stop" size={20} color={Colors.white} />}
              />
            </>
          ) : (
            <>
              <View style={styles.startContainer}>
                <View style={styles.startIcon}>
                  <Ionicons name="walk" size={48} color={Colors.white} />
                </View>
                <Text style={styles.startTitle}>¡Vamos a pasear!</Text>
                <Text style={styles.startSubtitle}>Graba la ruta de tu paseo con {currentDog?.name}</Text>
              </View>
              
              <Button
                title="Iniciar Paseo"
                onPress={startTracking}
                icon={<Ionicons name="play" size={20} color={Colors.white} />}
              />
            </>
          )}
        </Card>

        {/* Saved Routes */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Rutas Guardadas</Text>
          
          {routes.length === 0 ? (
            <Card style={styles.emptyCard}>
              <Ionicons name="map-outline" size={48} color={Colors.gray} />
              <Text style={styles.emptyText}>Aún no tienes rutas guardadas</Text>
              <Text style={styles.emptyHint}>Inicia un paseo para guardar tu primera ruta</Text>
            </Card>
          ) : (
            routes.map((route) => (
              <Card key={route.id} style={styles.routeCard} variant="elevated">
                <View style={styles.routeHeader}>
                  <View style={styles.routeIcon}>
                    <Ionicons name="navigate" size={24} color={Colors.primary} />
                  </View>
                  <View style={styles.routeInfo}>
                    <Text style={styles.routeName}>{route.name}</Text>
                    <Text style={styles.routeDate}>{new Date(route.date).toLocaleDateString('es-ES')}</Text>
                  </View>
                </View>
                <View style={styles.routeStats}>
                  <View style={styles.routeStat}>
                    <Ionicons name="resize" size={16} color={Colors.textSecondary} />
                    <Text style={styles.routeStatText}>{formatDistance(route.distance)}</Text>
                  </View>
                  <View style={styles.routeStat}>
                    <Ionicons name="time" size={16} color={Colors.textSecondary} />
                    <Text style={styles.routeStatText}>{formatDuration(route.duration)}</Text>
                  </View>
                </View>
              </Card>
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: Spacing.md,
    paddingBottom: Spacing.xxl,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  backButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
  },
  headerText: {
    flex: 1,
  },
  title: {
    fontSize: FontSizes.xxl,
    fontWeight: '700',
    color: Colors.text,
  },
  subtitle: {
    fontSize: FontSizes.md,
    color: Colors.textSecondary,
  },
  locationCard: {
    marginBottom: Spacing.md,
  },
  locationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  locationInfo: {
    flex: 1,
  },
  locationTitle: {
    fontSize: FontSizes.md,
    fontWeight: '600',
    color: Colors.text,
  },
  locationCoords: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
  },
  trackingCard: {
    marginBottom: Spacing.lg,
  },
  trackingCardActive: {
    borderWidth: 2,
    borderColor: Colors.primary,
  },
  trackingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  pulseIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: Colors.error,
  },
  trackingTitle: {
    fontSize: FontSizes.lg,
    fontWeight: '700',
    color: Colors.text,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: Spacing.lg,
    paddingVertical: Spacing.md,
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.md,
  },
  statBox: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: FontSizes.xxl,
    fontWeight: '700',
    color: Colors.primary,
  },
  statLabel: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
  },
  startContainer: {
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  startIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  startTitle: {
    fontSize: FontSizes.xl,
    fontWeight: '700',
    color: Colors.text,
  },
  startSubtitle: {
    fontSize: FontSizes.md,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  section: {
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    fontSize: FontSizes.lg,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: Spacing.md,
  },
  emptyCard: {
    alignItems: 'center',
    padding: Spacing.xl,
  },
  emptyText: {
    fontSize: FontSizes.md,
    fontWeight: '600',
    color: Colors.text,
    marginTop: Spacing.md,
  },
  emptyHint: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  routeCard: {
    marginBottom: Spacing.sm,
  },
  routeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  routeIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.primary + '20',
    alignItems: 'center',
    justifyContent: 'center',
  },
  routeInfo: {
    flex: 1,
    marginLeft: Spacing.md,
  },
  routeName: {
    fontSize: FontSizes.md,
    fontWeight: '600',
    color: Colors.text,
  },
  routeDate: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
  },
  routeStats: {
    flexDirection: 'row',
    gap: Spacing.lg,
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.grayLight,
  },
  routeStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  routeStatText: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
  },
});
