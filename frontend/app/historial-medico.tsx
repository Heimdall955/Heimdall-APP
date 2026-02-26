import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl, Alert, Modal, TextInput, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import axios from 'axios';
import { SecureStore } from '../utils/secureStore';
import { useAuth } from '../contexts/AuthContext';
import { Card, Button, Input } from '../components/ui';
import { Spacing, BorderRadius, FontSizes } from '../constants/theme';
import { useTheme } from '../contexts/ThemeContext';

const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL || '';

interface MedicalEvent {
  id: string;
  dog_id: string;
  type: 'vaccine' | 'checkup' | 'deworming' | 'note' | 'medication';
  title: string;
  description?: string;
  date: string;
  next_date?: string;
  created_at: string;
}


export default function HistorialMedicoScreen() {
  const router = useRouter();
  const { currentDog } = useAuth();
  const { colors, shadows } = useTheme();
  const eventTypes = [
  { type: 'vaccine', label: 'Vacuna', icon: 'medical', color: colors.success },
  { type: 'checkup', label: 'Revisión', icon: 'clipboard', color: colors.info },
  { type: 'deworming', label: 'Desparasitación', icon: 'bug', color: colors.warning },
  { type: 'medication', label: 'Medicación', icon: 'medkit', color: colors.accentEducation },
  { type: 'note', label: 'Nota', icon: 'document-text', color: colors.gray },
];

  const [events, setEvents] = useState<MedicalEvent[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedType, setSelectedType] = useState<string>('vaccine');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [nextDate, setNextDate] = useState('');
  const [filterType, setFilterType] = useState<string | null>(null);

  const loadEvents = useCallback(async () => {
    if (!currentDog) return;
    
    try {
      const token = await SecureStore.getItemAsync('session_token');
      const response = await axios.get(
        `${BACKEND_URL}/api/medical-events/${currentDog.id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setEvents(response.data);
    } catch (error) {
      console.log('Error loading events:', error);
    } finally {
      setIsLoading(false);
    }
  }, [currentDog]);

  useEffect(() => {
    loadEvents();
  }, [loadEvents]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadEvents();
    setRefreshing(false);
  };

  const handleAddEvent = async () => {
    if (!title.trim() || !date.trim() || !currentDog) {
      Alert.alert('Error', 'Por favor completa los campos obligatorios');
      return;
    }

    try {
      const token = await SecureStore.getItemAsync('session_token');
      await axios.post(
        `${BACKEND_URL}/api/medical-events`,
        {
          dog_id: currentDog.id,
          type: selectedType,
          title: title.trim(),
          description: description.trim() || undefined,
          date: date.trim(),
          next_date: nextDate.trim() || undefined,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Award bones for adding medical event
      try {
        await axios.post(
          `${BACKEND_URL}/api/gamification/add-bones`,
          { amount: 20, reason: 'Añadir evento médico' },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } catch (e) {
        // Gamification is optional
      }

      setModalVisible(false);
      resetForm();
      loadEvents();
      Alert.alert('Éxito', 'Evento médico guardado. +20 huesos 🦴');
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.detail || 'No se pudo guardar el evento');
    }
  };

  const handleDeleteEvent = async (eventId: string) => {
    Alert.alert(
      'Eliminar evento',
      '¿Estás seguro de que quieres eliminar este evento?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              const token = await SecureStore.getItemAsync('session_token');
              await axios.delete(
                `${BACKEND_URL}/api/medical-events/${eventId}`,
                { headers: { Authorization: `Bearer ${token}` } }
              );
              loadEvents();
            } catch (error) {
              Alert.alert('Error', 'No se pudo eliminar el evento');
            }
          },
        },
      ]
    );
  };

  const resetForm = () => {
    setSelectedType('vaccine');
    setTitle('');
    setDescription('');
    setDate('');
    setNextDate('');
  };

  const getEventConfig = (type: string) => {
    return eventTypes.find((e) => e.type === type) || eventTypes[4];
  };

  const filteredEvents = filterType
    ? events.filter((e) => e.type === filterType)
    : events;

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString('es-ES', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <View style={styles.headerText}>
          <Text style={styles.title}>Historial Médico</Text>
          <Text style={styles.subtitle}>{currentDog?.name}</Text>
        </View>
        <TouchableOpacity style={styles.addButton} onPress={() => setModalVisible(true)}>
          <Ionicons name="add" size={24} color={colors.white} />
        </TouchableOpacity>
      </View>

      {/* Filters */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filtersContainer}>
        <TouchableOpacity
          style={[styles.filterChip, !filterType && styles.filterChipActive]}
          onPress={() => setFilterType(null)}
        >
          <Text style={[styles.filterText, !filterType && styles.filterTextActive]}>Todos</Text>
        </TouchableOpacity>
        {eventTypes.map((type) => (
          <TouchableOpacity
            key={type.type}
            style={[styles.filterChip, filterType === type.type && styles.filterChipActive]}
            onPress={() => setFilterType(type.type)}
          >
            <Ionicons
              name={type.icon as any}
              size={16}
              color={filterType === type.type ? colors.white : type.color}
            />
            <Text style={[styles.filterText, filterType === type.type && styles.filterTextActive]}>
              {type.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Events List */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
        }
      >
        {filteredEvents.length === 0 ? (
          <Card style={styles.emptyCard}>
            <Ionicons name="medical" size={48} color={colors.gray} />
            <Text style={styles.emptyTitle}>Sin registros</Text>
            <Text style={styles.emptyText}>
              Añade el primer evento médico de {currentDog?.name}
            </Text>
            <Button
              title="Añadir Evento"
              onPress={() => setModalVisible(true)}
              style={styles.emptyButton}
            />
          </Card>
        ) : (
          filteredEvents.map((event) => {
            const config = getEventConfig(event.type);
            const styles = useMemo(() => createStyles(colors, shadows), [colors, shadows]);

  return (
              <Card key={event.id} style={styles.eventCard} variant="elevated">
                <View style={styles.eventHeader}>
                  <View style={[styles.eventIcon, { backgroundColor: config.color + '20' }]}>
                    <Ionicons name={config.icon as any} size={24} color={config.color} />
                  </View>
                  <View style={styles.eventInfo}>
                    <Text style={styles.eventTitle}>{event.title}</Text>
                    <Text style={styles.eventType}>{config.label}</Text>
                  </View>
                  <TouchableOpacity onPress={() => handleDeleteEvent(event.id)}>
                    <Ionicons name="trash-outline" size={20} color={colors.error} />
                  </TouchableOpacity>
                </View>
                {event.description && (
                  <Text style={styles.eventDescription}>{event.description}</Text>
                )}
                <View style={styles.eventDates}>
                  <View style={styles.dateRow}>
                    <Ionicons name="calendar" size={16} color={colors.textSecondary} />
                    <Text style={styles.dateText}>Fecha: {formatDate(event.date)}</Text>
                  </View>
                  {event.next_date && (
                    <View style={styles.dateRow}>
                      <Ionicons name="alarm" size={16} color={colors.primary} />
                      <Text style={[styles.dateText, { color: colors.primary }]}>
                        Próxima: {formatDate(event.next_date)}
                      </Text>
                    </View>
                  )}
                </View>
              </Card>
            );
          })
        )}
      </ScrollView>

      {/* Add Event Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setModalVisible(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setModalVisible(false)}>
              <Ionicons name="close" size={28} color={colors.text} />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Nuevo Evento</Text>
            <View style={{ width: 28 }} />
          </View>

          <ScrollView style={styles.modalContent}>
            <Text style={styles.inputLabel}>Tipo de evento *</Text>
            <View style={styles.typeGrid}>
              {eventTypes.map((type) => (
                <TouchableOpacity
                  key={type.type}
                  style={[
                    styles.typeButton,
                    selectedType === type.type && { backgroundColor: type.color, borderColor: type.color },
                  ]}
                  onPress={() => setSelectedType(type.type)}
                >
                  <Ionicons
                    name={type.icon as any}
                    size={24}
                    color={selectedType === type.type ? colors.white : type.color}
                  />
                  <Text
                    style={[
                      styles.typeButtonText,
                      selectedType === type.type && { color: colors.white },
                    ]}
                  >
                    {type.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Input
              label="Título *"
              placeholder="Ej: Vacuna antirrábica"
              value={title}
              onChangeText={setTitle}
            />

            <Input
              label="Descripción (opcional)"
              placeholder="Detalles adicionales..."
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={3}
            />

            <Input
              label="Fecha *"
              placeholder="YYYY-MM-DD"
              value={date}
              onChangeText={setDate}
            />

            <Input
              label="Próxima fecha (opcional)"
              placeholder="YYYY-MM-DD"
              value={nextDate}
              onChangeText={setNextDate}
            />

            <Button
              title="Guardar Evento"
              onPress={handleAddEvent}
              style={styles.saveButton}
            />
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const createStyles = (C: any, S: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: C.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
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
    fontSize: FontSizes.xl,
    fontWeight: '700',
    color: C.text,
  },
  subtitle: {
    fontSize: FontSizes.md,
    color: C.textSecondary,
  },
  addButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: C.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filtersContainer: {
    paddingHorizontal: Spacing.md,
    marginBottom: Spacing.md,
    maxHeight: 50,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    backgroundColor: C.white,
    borderRadius: BorderRadius.full,
    marginRight: Spacing.sm,
    borderWidth: 1,
    borderColor: C.grayLight,
  },
  filterChipActive: {
    backgroundColor: C.primary,
    borderColor: C.primary,
  },
  filterText: {
    fontSize: FontSizes.sm,
    color: C.text,
    fontWeight: '500',
  },
  filterTextActive: {
    color: C.white,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: Spacing.md,
    paddingBottom: Spacing.xxl,
  },
  emptyCard: {
    alignItems: 'center',
    padding: Spacing.xl,
  },
  emptyTitle: {
    fontSize: FontSizes.lg,
    fontWeight: '700',
    color: C.text,
    marginTop: Spacing.md,
  },
  emptyText: {
    fontSize: FontSizes.md,
    color: C.textSecondary,
    textAlign: 'center',
    marginTop: Spacing.xs,
    marginBottom: Spacing.lg,
  },
  emptyButton: {
    minWidth: 200,
  },
  eventCard: {
    marginBottom: Spacing.md,
  },
  eventHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  eventIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  eventInfo: {
    flex: 1,
    marginLeft: Spacing.md,
  },
  eventTitle: {
    fontSize: FontSizes.md,
    fontWeight: '700',
    color: C.text,
  },
  eventType: {
    fontSize: FontSizes.sm,
    color: C.textSecondary,
  },
  eventDescription: {
    fontSize: FontSizes.md,
    color: C.text,
    marginTop: Spacing.md,
    lineHeight: 22,
  },
  eventDates: {
    marginTop: Spacing.md,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: C.grayLight,
    gap: Spacing.xs,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  dateText: {
    fontSize: FontSizes.sm,
    color: C.textSecondary,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: C.background,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: C.grayLight,
  },
  modalTitle: {
    fontSize: FontSizes.lg,
    fontWeight: '700',
    color: C.text,
  },
  modalContent: {
    flex: 1,
    padding: Spacing.md,
  },
  inputLabel: {
    fontSize: FontSizes.sm,
    fontWeight: '600',
    color: C.text,
    marginBottom: Spacing.sm,
  },
  typeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  typeButton: {
    width: '31%',
    alignItems: 'center',
    padding: Spacing.md,
    backgroundColor: C.white,
    borderRadius: BorderRadius.md,
    borderWidth: 2,
    borderColor: C.grayLight,
  },
  typeButtonText: {
    fontSize: FontSizes.xs,
    fontWeight: '600',
    color: C.text,
    marginTop: Spacing.xs,
  },
  saveButton: {
    marginTop: Spacing.lg,
    marginBottom: Spacing.xxl,
  },
});
