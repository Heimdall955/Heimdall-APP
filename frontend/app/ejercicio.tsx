import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import axios from 'axios';
import { Spacing, BorderRadius, FontSizes } from '../constants/theme';
import { useTheme } from '../contexts/ThemeContext';
import { Card } from '../components/ui';
import { useLanguage } from '../contexts/LanguageContext';
import { SecureStore } from '../utils/secureStore';

const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL || '';

// Base de datos de ejercicios

export default function EjercicioScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t } = useLanguage();
  const { colors, shadows } = useTheme();

  const EJERCICIOS_DB: Record<string, any> = {
    'senales-basicas': {
      id: 'senales-basicas', titulo: 'Senales Basicas', subtitulo: 'Sentado, Tumbado, Quieto',
      descripcion: 'Los comandos fundamentales que todo perro deberia conocer.',
      huesos: 5, imagen: 'https://images.unsplash.com/photo-1552053831-71594a27632d?w=800', color: colors.primary,
      ejercicios: [
        { nombre: 'Sentado', instrucciones: '1. Sosten un premio cerca de la nariz\n2. Mueve hacia arriba\n3. Su trasero bajara\n4. Di "Sienta" y premia', repeticiones: '10 repeticiones', tip: 'No empujes su trasero' },
        { nombre: 'Tumbado', instrucciones: '1. Desde sentado, lleva premio al suelo\n2. Arrastra formando una "L"\n3. Sus codos tocaran el suelo\n4. Di "Tumba" y premia', repeticiones: '10 repeticiones', tip: 'Si se levanta, vuelve al sentado' },
        { nombre: 'Quieto', instrucciones: '1. Pide sentado o tumbado\n2. Di "Quieto" con palma hacia el\n3. Espera 1 segundo\n4. Premia y libera con "Vale"', repeticiones: '5 repeticiones', tip: 'Empieza con 1 segundo' }
      ]
    },
    'control-impulsos': {
      id: 'control-impulsos', titulo: 'Control de Impulsos', subtitulo: 'Espera, Deja, Suelta',
      descripcion: 'Ejercicios para que tu perro aprenda a controlar sus impulsos.',
      huesos: 10, imagen: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=800', color: colors.accentPurple,
      ejercicios: [
        { nombre: 'Espera', instrucciones: '1. Pon comida en el suelo\n2. Cubre con la mano\n3. Solo cuando deje de intentar, descubre\n4. Di "Espera" antes', repeticiones: '8 repeticiones', tip: 'Empieza con premios de bajo valor' },
        { nombre: 'Deja', instrucciones: '1. Muestra un premio en mano cerrada\n2. Espera que deje de lamer/tocar\n3. En cuanto se aparte, premia con la otra mano\n4. Anade "Deja" como senal', repeticiones: '10 repeticiones', tip: 'Premia siempre con la OTRA mano' },
        { nombre: 'Suelta', instrucciones: '1. Ofrece un juguete\n2. Cuando lo tenga, muestra un premio\n3. Cuando suelte el juguete di "Suelta"\n4. Da el premio y devuelve el juguete', repeticiones: '6 repeticiones', tip: 'El juguete vuelve = recompensa doble' }
      ]
    },
    'socializacion': {
      id: 'socializacion', titulo: 'Socializacion', subtitulo: 'Perros, Personas, Entornos',
      descripcion: 'Aprende tecnicas para socializar correctamente a tu perro.',
      huesos: 15, imagen: 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=800', color: colors.accentMint,
      ejercicios: [
        { nombre: 'Observar Perros', instrucciones: '1. Lleva a tu perro a un parque\n2. Manten distancia segura\n3. Premia cuando mire perros con calma\n4. Reduce distancia gradualmente', repeticiones: '3 sesiones de 10 min', tip: 'Si se estresa, aumenta la distancia' },
        { nombre: 'Conocer Personas', instrucciones: '1. Pide a un amigo que se acerque\n2. Que lance premios sin mirar al perro\n3. Deja que el perro se acerque a su ritmo\n4. Premia la interaccion tranquila', repeticiones: '2-3 personas por sesion', tip: 'Nunca fuerces el contacto' },
        { nombre: 'Nuevos Entornos', instrucciones: '1. Visita un lugar nuevo tranquilo\n2. Deja que explore con correa larga\n3. Premia cuando se muestre curioso\n4. Si hay miedo, no fuerces', repeticiones: '1-2 lugares nuevos por semana', tip: 'Lleva muchos premios de alto valor' }
      ]
    },
    'paseos': {
      id: 'paseos', titulo: 'Paseos con Correa', subtitulo: 'Caminar sin tirar',
      descripcion: 'Tu perro aprendera a caminar a tu lado sin tirar de la correa.',
      huesos: 8, imagen: 'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=800', color: colors.info,
      ejercicios: [
        { nombre: 'Junto', instrucciones: '1. Con correa corta, camina\n2. Cuando la correa se tense, para\n3. Espera que te mire\n4. Premia y continua', repeticiones: '15 min de practica', tip: 'La paciencia es la clave' },
        { nombre: 'Cambio Direccion', instrucciones: '1. Camina y gira 180 grados\n2. Di el nombre de tu perro\n3. Premia cuando te siga\n4. Varia las direcciones', repeticiones: '10 cambios', tip: 'Hazlo divertido' }
      ]
    },
    'trucos': {
      id: 'trucos', titulo: 'Trucos Divertidos', subtitulo: 'Dar la pata, Girar, Reverencia',
      descripcion: 'Trucos divertidos que fortalecen el vinculo con tu perro.',
      huesos: 12, imagen: 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=800', color: colors.success,
      ejercicios: [
        { nombre: 'Dar la Pata', instrucciones: '1. Con tu perro sentado, toca su pata\n2. Cuando la levante, premia\n3. Anade senal "Pata"\n4. Practica con ambas patas', repeticiones: '10 repeticiones', tip: 'Toca suavemente' },
        { nombre: 'Girar', instrucciones: '1. Con un premio, guia su nariz en circulo\n2. Sigue hasta que complete la vuelta\n3. Premia al finalizar\n4. Anade "Gira"', repeticiones: '5 giros por lado', tip: 'Hazlo lentamente al principio' }
      ]
    }
  };

  const [ejercicioActual, setEjercicioActual] = useState(0);
  const [completados, setCompletados] = useState<number[]>([]);

  const [rewardData, setRewardData] = useState<any>(null);
  const [submittingReward, setSubmittingReward] = useState(false);

  const ejercicio = EJERCICIOS_DB[id || 'senales-basicas'];

  if (!ejercicio) {
  const styles = useMemo(() => createStyles(colors, shadows), [colors, shadows]);

    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <Text>{t('error')}</Text>
      </SafeAreaView>
    );
  }

  const toggleCompletado = (index: number) => {
    if (completados.includes(index)) {
      setCompletados(completados.filter(i => i !== index));
    } else {
      const newCompletados = [...completados, index];
      setCompletados(newCompletados);
      // Auto-submit reward when all exercises completed
      if (newCompletados.length === ejercicio.ejercicios.length && !submittingReward) {
        submitReward();
      }
    }
  };

  const submitReward = async () => {
    setSubmittingReward(true);
    try {
      const token = await SecureStore.getItemAsync('session_token');
      if (!token) return;
      const response = await axios.post(
        `${BACKEND_URL}/api/gamification/add-bones`,
        { amount: ejercicio.huesos, reason: `Ejercicio: ${ejercicio.titulo}` },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setRewardData(response.data);
    } catch (error) {
      console.log('Error submitting reward:', error);
    } finally {
      setSubmittingReward(false);
    }
  };

  const todosCompletados = completados.length === ejercicio.ejercicios.length;


  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{ejercicio.titulo}</Text>
        <View style={styles.huesosContainer}>
          <Text style={styles.huesosText}>{ejercicio.huesos}</Text>
          <Text style={styles.boneEmoji}>🦴</Text>
        </View>
      </View>

      {/* Hero Image */}
      <Image source={{ uri: ejercicio.imagen }} style={styles.heroImage} />
      <View style={[styles.heroOverlay, { backgroundColor: ejercicio.color + '90' }]}>
        <Text style={styles.heroSubtitle}>{ejercicio.subtitulo}</Text>
        <Text style={styles.heroDescription}>{ejercicio.descripcion}</Text>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Progress */}
        <View style={styles.progressSection}>
          <Text style={styles.progressText}>
            {completados.length} {t('of')} {ejercicio.ejercicios.length} {t('completed')}
          </Text>
          <View style={styles.progressDots}>
            {ejercicio.ejercicios.map((_, index) => (
              <View 
                key={index} 
                style={[
                  styles.progressDot,
                  completados.includes(index) && styles.progressDotComplete
                ]} 
              />
            ))}
          </View>
        </View>

        {/* Ejercicios */}
        {ejercicio.ejercicios.map((ej, index) => (
          <Card key={index} style={styles.ejercicioCard}>
            <TouchableOpacity 
              style={styles.ejercicioHeader}
              onPress={() => setEjercicioActual(ejercicioActual === index ? -1 : index)}
            >
              <View style={styles.ejercicioTitleRow}>
                <TouchableOpacity 
                  style={[
                    styles.checkbox,
                    completados.includes(index) && styles.checkboxComplete
                  ]}
                  onPress={() => toggleCompletado(index)}
                >
                  {completados.includes(index) && (
                    <Ionicons name="checkmark" size={18} color={colors.white} />
                  )}
                </TouchableOpacity>
                <Text style={[
                  styles.ejercicioNombre,
                  completados.includes(index) && styles.ejercicioNombreComplete
                ]}>
                  {ej.nombre}
                </Text>
              </View>
              <Ionicons 
                name={ejercicioActual === index ? 'chevron-up' : 'chevron-down'} 
                size={24} 
                color={colors.gray} 
              />
            </TouchableOpacity>

            {ejercicioActual === index && (
              <View style={styles.ejercicioContent}>
                <Text style={styles.instruccionesLabel}>{t('instructions')}</Text>
                <Text style={styles.instruccionesText}>{ej.instrucciones}</Text>
                
                <View style={styles.repeticionesRow}>
                  <Ionicons name="repeat" size={20} color={colors.primary} />
                  <Text style={styles.repeticionesText}>{ej.repeticiones}</Text>
                </View>

                <View style={styles.tipContainer}>
                  <Ionicons name="bulb" size={20} color={colors.accent} />
                  <Text style={styles.tipText}>{ej.tip}</Text>
                </View>
              </View>
            )}
          </Card>
        ))}

        {/* Completion Button */}
        {todosCompletados && (
          <View>
            {rewardData && (
              <View style={styles.rewardBanner} data-testid="exercise-reward-banner">
                <Text style={styles.rewardText}>+{rewardData.bones_added} 🦴</Text>
                <Text style={styles.rewardSubtext}>{t('level')} {rewardData.level} - {rewardData.xp} XP</Text>
                {rewardData.leveled_up && (
                  <Text style={styles.levelUpText}>{t('levelUp')} {rewardData.level}!</Text>
                )}
              </View>
            )}
            <TouchableOpacity 
              style={styles.completarButton}
              onPress={() => router.back()}
              data-testid="exercise-complete-button"
            >
              <Ionicons name="checkmark-circle" size={24} color={colors.white} />
              <Text style={styles.completarButtonText}>
                {rewardData ? t('backToEducation') : `${t('exercisesCompleted')} +${ejercicio.huesos} 🦴`}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>
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
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    backgroundColor: C.primary,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: FontSizes.lg,
    fontWeight: '700',
    color: C.white,
  },
  huesosContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingVertical: 4,
    paddingHorizontal: Spacing.sm,
    borderRadius: BorderRadius.full,
  },
  huesosText: {
    fontSize: FontSizes.md,
    fontWeight: '700',
    color: C.white,
    marginRight: 4,
  },
  boneEmoji: {
    fontSize: 16,
  },
  heroImage: {
    width: '100%',
    height: 180,
  },
  heroOverlay: {
    position: 'absolute',
    top: 56,
    left: 0,
    right: 0,
    height: 180,
    padding: Spacing.lg,
    justifyContent: 'flex-end',
  },
  heroSubtitle: {
    fontSize: FontSizes.xl,
    fontWeight: '800',
    color: C.white,
    marginBottom: 4,
  },
  heroDescription: {
    fontSize: FontSizes.md,
    color: 'rgba(255,255,255,0.9)',
    lineHeight: 22,
  },
  scrollView: {
    flex: 1,
    marginTop: 130,
  },
  scrollContent: {
    padding: Spacing.md,
  },
  progressSection: {
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  progressText: {
    fontSize: FontSizes.md,
    color: C.textSecondary,
    marginBottom: Spacing.sm,
  },
  progressDots: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  progressDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: C.grayLight,
  },
  progressDotComplete: {
    backgroundColor: C.primary,
  },
  ejercicioCard: {
    marginBottom: Spacing.md,
    padding: 0,
    overflow: 'hidden',
  },
  ejercicioHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.md,
  },
  ejercicioTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  checkbox: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: C.grayLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxComplete: {
    backgroundColor: C.primary,
    borderColor: C.primary,
  },
  ejercicioNombre: {
    fontSize: FontSizes.lg,
    fontWeight: '700',
    color: C.text,
  },
  ejercicioNombreComplete: {
    color: C.primary,
  },
  ejercicioContent: {
    padding: Spacing.md,
    paddingTop: 0,
    borderTopWidth: 1,
    borderTopColor: C.grayLight,
  },
  instruccionesLabel: {
    fontSize: FontSizes.sm,
    fontWeight: '700',
    color: C.textSecondary,
    marginBottom: Spacing.sm,
    marginTop: Spacing.md,
  },
  instruccionesText: {
    fontSize: FontSizes.md,
    color: C.text,
    lineHeight: 24,
    marginBottom: Spacing.md,
  },
  repeticionesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  repeticionesText: {
    fontSize: FontSizes.md,
    color: C.primary,
    fontWeight: '600',
  },
  tipContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
    backgroundColor: C.accentLight,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
  },
  tipText: {
    flex: 1,
    fontSize: FontSizes.sm,
    color: C.text,
    lineHeight: 20,
  },
  completarButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    backgroundColor: C.primary,
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    marginTop: Spacing.md,
  },
  completarButtonText: {
    fontSize: FontSizes.lg,
    fontWeight: '700',
    color: C.white,
  },
  rewardBanner: {
    backgroundColor: C.accentLight,
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.md,
    alignItems: 'center',
  },
  rewardText: {
    fontSize: FontSizes.xl,
    fontWeight: '800',
    color: C.accent,
  },
  rewardSubtext: {
    fontSize: FontSizes.sm,
    color: C.textSecondary,
    marginTop: 4,
  },
  levelUpText: {
    fontSize: FontSizes.lg,
    fontWeight: '800',
    color: C.primary,
    marginTop: Spacing.xs,
  },
});
