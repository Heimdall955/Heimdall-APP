import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import axios from 'axios';
import { Spacing, BorderRadius, FontSizes, Shadows } from '../constants/theme';
import { useTheme } from '../contexts/ThemeContext';
import { Card } from '../components/ui';
import { useLanguage } from '../contexts/LanguageContext';
import { SecureStore } from '../utils/secureStore';

const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL || '';

interface Paso {
  numero: number;
  titulo: string;
  instrucciones: string;
}

interface Juego {
  id: string;
  titulo: string;
  descripcion: string;
  dificultad: string;
  duracion: string;
  beneficios: string[];
  materialesNecesarios: string[];
  pasos: Paso[];
  consejos: string[];
  xp: number;
  imagen: string;
}

const JUEGOS_DB: Record<string, Juego> = {
  'puzzle-mental': {
    id: 'puzzle-mental',
    titulo: 'Puzzle Mental',
    descripcion: 'Estimula la mente de tu perro con juegos de búsqueda de premios escondidos. Ideal para cansar mentalmente a perros activos.',
    dificultad: 'Media',
    duracion: '15-20 min',
    beneficios: [
      'Estimulación mental intensa',
      'Reduce el aburrimiento',
      'Mejora la concentración',
      'Cansa sin ejercicio físico intenso',
    ],
    materialesNecesarios: [
      'Premios pequeños o croquetas',
      'Toalla o manta',
      'Vasos de plástico o cajas pequeñas',
      'Opcional: juguete puzzle comercial',
    ],
    pasos: [
      { numero: 1, titulo: 'Preparación', instrucciones: 'Reúne los materiales y elige un espacio tranquilo. Asegúrate de que tu perro tenga hambre moderada para mayor motivación.' },
      { numero: 2, titulo: 'Nivel Fácil', instrucciones: 'Coloca premios bajo una toalla con las esquinas levantadas. Deja que tu perro los encuentre con su nariz.' },
      { numero: 3, titulo: 'Nivel Medio', instrucciones: 'Esconde premios bajo vasos boca abajo. Tu perro debe voltearlos para encontrar la recompensa.' },
      { numero: 4, titulo: 'Nivel Difícil', instrucciones: 'Enrolla premios dentro de la toalla formando un rollo. Tu perro debe desenrollar para acceder a ellos.' },
      { numero: 5, titulo: 'Celebración', instrucciones: '¡Felicita a tu perro efusivamente cuando complete cada nivel! Esto refuerza la conducta de búsqueda.' },
    ],
    consejos: [
      'Empieza siempre por el nivel más fácil',
      'No dejes a tu perro solo con materiales que pueda tragar',
      'Aumenta la dificultad gradualmente',
      'Limita las sesiones a 15-20 minutos para evitar frustración',
    ],
    xp: 25,
    imagen: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=600',
  },
  'tira-afloja': {
    id: 'tira-afloja',
    titulo: 'Tira y Afloja',
    descripcion: 'Un juego clásico que fortalece el vínculo y permite canalizar energía. Aprende a jugarlo correctamente con reglas claras.',
    dificultad: 'Fácil',
    duracion: '10-15 min',
    beneficios: [
      'Ejercicio físico moderado',
      'Fortalece el vínculo humano-perro',
      'Enseña autocontrol (soltar a la orden)',
      'Reduce el estrés acumulado',
    ],
    materialesNecesarios: [
      'Juguete de cuerda resistente',
      'Espacio suficiente para moverse',
      'Premios para recompensar el "suelta"',
    ],
    pasos: [
      { numero: 1, titulo: 'La Invitación', instrucciones: 'Muestra el juguete y muévelo por el suelo para captar la atención. Di "¡Juega!" cuando tu perro lo muerda.' },
      { numero: 2, titulo: 'El Juego', instrucciones: 'Tira suavemente en diferentes direcciones. No levantes el juguete para evitar lesiones en el cuello de tu perro.' },
      { numero: 3, titulo: 'La Pausa', instrucciones: 'Cada 30 segundos, deja de tirar y di "Suelta". Espera a que suelte y recompensa con un premio.' },
      { numero: 4, titulo: 'Reinicio', instrucciones: 'Una vez suelte, di "¡Juega!" y continúa. Esto enseña que soltar significa que el juego continúa.' },
      { numero: 5, titulo: 'Fin del Juego', instrucciones: 'Termina siempre tú la sesión, no tu perro. Di "Suelta" y guarda el juguete.' },
    ],
    consejos: [
      'Nunca dejes que tu perro inicie el juego sin permiso',
      'Si los dientes tocan tu mano, di "¡Ay!" y detén el juego 10 segundos',
      'El juguete de tira es solo para este juego, guárdalo después',
      'No juegues si tu perro está muy excitado o agresivo',
    ],
    xp: 15,
    imagen: 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=600',
  },
};

export default function JuegoScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t } = useLanguage();
  const { colors, shadows } = useTheme();
  const [pasoActual, setPasoActual] = useState(0);
  const [juegoCompletado, setJuegoCompletado] = useState(false);
  const [rewardData, setRewardData] = useState<any>(null);

  const juego = JUEGOS_DB[id || 'puzzle-mental'];

  if (!juego) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <Text>{t('error')}</Text>
      </SafeAreaView>
    );
  }

  const submitReward = async () => {
    try {
      const token = await SecureStore.getItemAsync('session_token');
      if (!token) return;
      const response = await axios.post(
        `${BACKEND_URL}/api/gamification/add-bones`,
        { amount: juego.xp, reason: `Juego: ${juego.titulo}` },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setRewardData(response.data);
    } catch (error) {
      console.log('Error submitting reward:', error);
    }
  };

  const handleSiguientePaso = () => {
    if (pasoActual < juego.pasos.length - 1) {
      setPasoActual(pasoActual + 1);
    } else {
      setJuegoCompletado(true);
      submitReward();
    }
  };

  const handleAnteriorPaso = () => {
    if (pasoActual > 0) {
      setPasoActual(pasoActual - 1);
    }
  };

  if (juegoCompletado) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
        <ScrollView contentContainerStyle={styles.completadoContainer}>
          <View style={styles.completadoIcon}>
            <Ionicons name="game-controller" size={80} color={colors.primary} />
          </View>
          <Text style={styles.completadoTitulo}>{t('exercisesCompleted')}</Text>
          <Text style={styles.completadoSubtitulo}>{juego.titulo}</Text>
          
          <View style={styles.recompensaCard}>
            <Text style={styles.recompensaTexto}>+{rewardData?.bones_added || juego.xp} 🦴</Text>
          </View>

          {rewardData && (
            <View style={styles.statsRow} data-testid="game-reward-stats">
              <Text style={styles.statsText}>{t('level')} {rewardData.level} - {rewardData.xp} XP</Text>
              {rewardData.leveled_up && (
                <Text style={styles.levelUpText}>{t('levelUp')} {rewardData.level}!</Text>
              )}
            </View>
          )}

          <TouchableOpacity style={styles.volverButton} onPress={() => router.back()}>
            <Text style={styles.volverButtonText}>{t('backToEducation')}</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    );
  }

  const styles = useMemo(() => createStyles(colors, shadows), [colors, shadows]);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      {/* Header Image */}
      <View style={styles.heroContainer}>
        <Image source={{ uri: juego.imagen }} style={styles.heroImage} />
        <View style={styles.heroOverlay} />
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={colors.white} />
        </TouchableOpacity>
        <View style={styles.heroContent}>
          <View style={styles.difficultyBadge}>
            <Text style={styles.difficultyText}>{juego.dificultad}</Text>
          </View>
          <Text style={styles.heroTitle}>{juego.titulo}</Text>
          <View style={styles.heroMeta}>
            <View style={styles.metaItem}>
              <Ionicons name="time-outline" size={16} color={colors.white} />
              <Text style={styles.metaText}>{juego.duracion}</Text>
            </View>
            <View style={styles.metaItem}>
              <Text style={styles.metaText}>🦴 +{juego.xp}</Text>
            </View>
          </View>
        </View>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Progress */}
        <View style={styles.progressSection}>
          <Text style={styles.progressText}>
            {t('step')} {pasoActual + 1} {t('of')} {juego.pasos.length}
          </Text>
          <View style={styles.progressDots}>
            {juego.pasos.map((_, index) => (
              <View 
                key={index} 
                style={[
                  styles.progressDot,
                  index <= pasoActual && styles.progressDotActive
                ]} 
              />
            ))}
          </View>
        </View>

        {/* Current Step */}
        <Card style={styles.pasoCard} variant="elevated">
          <View style={styles.pasoHeader}>
            <View style={styles.pasoNumber}>
              <Text style={styles.pasoNumberText}>{juego.pasos[pasoActual].numero}</Text>
            </View>
            <Text style={styles.pasoTitulo}>{juego.pasos[pasoActual].titulo}</Text>
          </View>
          <Text style={styles.pasoInstrucciones}>{juego.pasos[pasoActual].instrucciones}</Text>
        </Card>

        {/* Benefits (show on first step) */}
        {pasoActual === 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('benefits')}</Text>
            {juego.beneficios.map((beneficio, index) => (
              <View key={index} style={styles.beneficioItem}>
                <Ionicons name="checkmark-circle" size={20} color={colors.success} />
                <Text style={styles.beneficioText}>{beneficio}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Materials (show on first step) */}
        {pasoActual === 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('materials')}</Text>
            {juego.materialesNecesarios.map((material, index) => (
              <View key={index} style={styles.materialItem}>
                <Ionicons name="ellipse" size={8} color={colors.primary} />
                <Text style={styles.materialText}>{material}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Tips (show on last step) */}
        {pasoActual === juego.pasos.length - 1 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('proTip')}</Text>
            {juego.consejos.map((consejo, index) => (
              <View key={index} style={styles.consejoItem}>
                <Ionicons name="bulb" size={20} color={colors.accent} />
                <Text style={styles.consejoText}>{consejo}</Text>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Navigation */}
      <View style={styles.navigationContainer}>
        {pasoActual > 0 ? (
          <TouchableOpacity style={styles.anteriorButton} onPress={handleAnteriorPaso}>
            <Ionicons name="arrow-back" size={20} color={colors.primary} />
            <Text style={styles.anteriorButtonText}>{t('previous')}</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.placeholder} />
        )}
        
        <TouchableOpacity style={styles.siguienteButton} onPress={handleSiguientePaso}>
          <Text style={styles.siguienteButtonText}>
            {pasoActual === juego.pasos.length - 1 ? t('complete') : t('next')}
          </Text>
          <Ionicons 
            name={pasoActual === juego.pasos.length - 1 ? 'checkmark' : 'arrow-forward'} 
            size={20} 
            color={colors.white} 
          />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const createStyles = (C: any, S: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: C.background,
  },
  heroContainer: {
    height: 220,
    position: 'relative',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  backButton: {
    position: 'absolute',
    top: Spacing.md,
    left: Spacing.md,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroContent: {
    position: 'absolute',
    bottom: Spacing.lg,
    left: Spacing.md,
    right: Spacing.md,
  },
  difficultyBadge: {
    alignSelf: 'flex-start',
    backgroundColor: C.accent,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.sm,
    marginBottom: Spacing.xs,
  },
  difficultyText: {
    color: C.white,
    fontSize: FontSizes.xs,
    fontWeight: '600',
  },
  heroTitle: {
    fontSize: FontSizes.xxl,
    fontWeight: 'bold',
    color: C.white,
    marginBottom: Spacing.xs,
  },
  heroMeta: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    color: C.white,
    fontSize: FontSizes.sm,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: Spacing.md,
    paddingBottom: 100,
  },
  progressSection: {
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  progressText: {
    fontSize: FontSizes.sm,
    color: C.gray,
    marginBottom: Spacing.xs,
  },
  progressDots: {
    flexDirection: 'row',
    gap: Spacing.xs,
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: C.lightGray,
  },
  progressDotActive: {
    backgroundColor: C.primary,
  },
  pasoCard: {
    padding: Spacing.lg,
    marginBottom: Spacing.md,
  },
  pasoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  pasoNumber: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: C.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pasoNumberText: {
    fontSize: FontSizes.lg,
    fontWeight: 'bold',
    color: C.white,
  },
  pasoTitulo: {
    fontSize: FontSizes.lg,
    fontWeight: '600',
    color: C.text,
    flex: 1,
  },
  pasoInstrucciones: {
    fontSize: FontSizes.md,
    color: C.darkGray,
    lineHeight: 24,
  },
  section: {
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    fontSize: FontSizes.md,
    fontWeight: '600',
    color: C.text,
    marginBottom: Spacing.sm,
  },
  beneficioItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
    marginBottom: Spacing.xs,
  },
  beneficioText: {
    flex: 1,
    fontSize: FontSizes.sm,
    color: C.text,
  },
  materialItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.xs,
  },
  materialText: {
    flex: 1,
    fontSize: FontSizes.sm,
    color: C.text,
  },
  consejoItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  consejoText: {
    flex: 1,
    fontSize: FontSizes.sm,
    color: C.text,
  },
  navigationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.md,
    backgroundColor: C.white,
    borderTopWidth: 1,
    borderTopColor: C.lightGray,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  placeholder: {
    width: 100,
  },
  anteriorButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    padding: Spacing.sm,
  },
  anteriorButtonText: {
    fontSize: FontSizes.md,
    color: C.primary,
    fontWeight: '500',
  },
  siguienteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    backgroundColor: C.primary,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.full,
  },
  siguienteButtonText: {
    fontSize: FontSizes.md,
    color: C.white,
    fontWeight: '600',
  },
  completadoContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
  },
  completadoIcon: {
    marginBottom: Spacing.lg,
  },
  completadoTitulo: {
    fontSize: FontSizes.xxl,
    fontWeight: 'bold',
    color: C.text,
    marginBottom: Spacing.xs,
  },
  completadoSubtitulo: {
    fontSize: FontSizes.lg,
    color: C.gray,
    marginBottom: Spacing.xl,
  },
  recompensaCard: {
    backgroundColor: C.accent + '20',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xl,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.xl,
  },
  recompensaTexto: {
    fontSize: FontSizes.xl,
    fontWeight: 'bold',
    color: C.accent,
  },
  volverButton: {
    backgroundColor: C.primary,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xl,
    borderRadius: BorderRadius.full,
  },
  volverButtonText: {
    fontSize: FontSizes.md,
    color: C.white,
    fontWeight: '600',
  },
  statsRow: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  statsText: {
    fontSize: FontSizes.md,
    color: C.textSecondary,
  },
  levelUpText: {
    fontSize: FontSizes.lg,
    fontWeight: '800',
    color: C.primary,
    marginTop: Spacing.xs,
  },
});
