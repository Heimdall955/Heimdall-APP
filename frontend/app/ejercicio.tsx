import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import axios from 'axios';
import { Colors, Spacing, BorderRadius, FontSizes, Shadows } from '../constants/theme';
import { Card } from '../components/ui';
import { useLanguage } from '../contexts/LanguageContext';
import { SecureStore } from '../utils/secureStore';

const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL || '';

// Base de datos de ejercicios
const EJERCICIOS_DB: Record<string, Ejercicio> = {
  'senales-basicas': {
    id: 'senales-basicas',
    titulo: 'Señales Básicas',
    subtitulo: 'Sentado, Tumbado, Quieto',
    descripcion: 'Los comandos fundamentales que todo perro debería conocer. Estos forman la base de toda la educación canina.',
    huesos: 5,
    imagen: 'https://images.unsplash.com/photo-1552053831-71594a27632d?w=800',
    color: Colors.primary,
    ejercicios: [
      {
        nombre: 'Sentado',
        instrucciones: '1. Sostén un premio cerca de la nariz de tu perro\n2. Mueve el premio hacia arriba y atrás sobre su cabeza\n3. Su trasero bajará naturalmente\n4. Di "Sienta" y da el premio',
        repeticiones: '10 repeticiones',
        tip: 'No empujes su trasero hacia abajo, deja que lo haga solo'
      },
      {
        nombre: 'Tumbado',
        instrucciones: '1. Desde sentado, lleva un premio hacia el suelo\n2. Arrastra el premio hacia ti formando una "L"\n3. Sus codos tocarán el suelo\n4. Di "Tumba" y premia',
        repeticiones: '10 repeticiones',
        tip: 'Si se levanta, no te frustres. Vuelve al sentado y empieza de nuevo'
      },
      {
        nombre: 'Quieto',
        instrucciones: '1. Pide sentado o tumbado\n2. Di "Quieto" con la palma hacia él\n3. Espera 1 segundo\n4. Premia y libera con "Vale"',
        repeticiones: '5 repeticiones, aumenta tiempo gradualmente',
        tip: 'Empieza con 1 segundo y sube poco a poco'
      }
    ]
  },
  'control-impulsos': {
    id: 'control-impulsos',
    titulo: 'Control de Impulsos',
    subtitulo: 'Espera, Deja, Suelta',
    descripcion: 'Ejercicios para que tu perro aprenda a controlar sus impulsos y pensar antes de actuar.',
    huesos: 10,
    imagen: 'https://images.unsplash.com/photo-1544568100-847a948585b9?w=800',
    color: Colors.accentPurple,
    ejercicios: [
      {
        nombre: 'Espera la Comida',
        instrucciones: '1. Pon comida en tu mano cerrada\n2. Tu perro intentará cogerla\n3. Espera a que se aleje o te mire\n4. Di "Sí" y abre la mano',
        repeticiones: '5 repeticiones antes de cada comida',
        tip: 'La clave es esperar el contacto visual'
      },
      {
        nombre: 'Deja',
        instrucciones: '1. Muestra un premio y di "Deja"\n2. Cubre el premio con la mano\n3. Cuando se aleje, premia con OTRO premio\n4. Nunca le des el que pediste que dejara',
        repeticiones: '10 repeticiones',
        tip: 'El premio por dejar viene de tu otra mano'
      },
      {
        nombre: 'Suelta',
        instrucciones: '1. Juega con un juguete\n2. Ofrece un premio delicioso cerca de su nariz\n3. Cuando suelte, di "Suelta" y dale el premio\n4. Devuélvele el juguete para seguir jugando',
        repeticiones: '5 repeticiones durante el juego',
        tip: 'Devolver el juguete enseña que soltar es ganar'
      }
    ]
  },
  'socializacion': {
    id: 'socializacion',
    titulo: 'Socialización',
    subtitulo: 'Perros, Personas, Entornos',
    descripcion: 'Ejercicios para crear experiencias positivas con el mundo exterior y prevenir miedos.',
    huesos: 15,
    imagen: 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=800',
    color: Colors.accentMint,
    ejercicios: [
      {
        nombre: 'Observar el Mundo',
        instrucciones: '1. Siéntate con tu perro a distancia de una zona concurrida\n2. Cada vez que mire algo nuevo con calma, di "Sí" y premia\n3. No te acerques a nada que le ponga nervioso\n4. Sesiones cortas de 5-10 minutos',
        repeticiones: '1 sesión diaria',
        tip: 'La distancia es tu amiga. Mantén distancia hasta que esté cómodo'
      },
      {
        nombre: 'Personas Nuevas',
        instrucciones: '1. Pide a la persona que ignore a tu perro\n2. Deja que tu perro se acerque cuando quiera\n3. La persona puede ofrecer un premio sin mirar ni hablar\n4. Premia a tu perro por mantener la calma',
        repeticiones: '2-3 personas nuevas por semana',
        tip: 'No dejes que extraños le toquen la cabeza desde arriba'
      },
      {
        nombre: 'Perros a Distancia',
        instrucciones: '1. Ve a otro perro a distancia\n2. Premia a tu perro por mirar y volver a mirarte a ti\n3. Camina en paralelo, no de frente\n4. Aumenta la proximidad gradualmente',
        repeticiones: 'Cada paseo',
        tip: 'No fuerces encuentros cara a cara. El paralelo es más natural'
      }
    ]
  },
  'paseo-correa': {
    id: 'paseo-correa',
    titulo: 'Paseo con Correa',
    subtitulo: 'Sin tirones ni estrés',
    descripcion: 'Aprende a pasear con tu perro de forma relajada, sin que tire de la correa.',
    huesos: 12,
    imagen: 'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=800',
    color: Colors.info,
    ejercicios: [
      {
        nombre: 'Correa Floja = Premio',
        instrucciones: '1. Cada vez que la correa esté floja, di "Sí" y premia\n2. Cuando tire, para completamente\n3. Espera a que te mire o la correa se afloje\n4. Continúa solo cuando la correa esté suelta',
        repeticiones: 'Todo el paseo',
        tip: 'Sé un árbol cuando tire. No avances ni un paso'
      },
      {
        nombre: 'Cambios de Dirección',
        instrucciones: '1. Cuando empiece a tirar, gira 180° y camina en dirección contraria\n2. Di "Vamos" de forma alegre\n3. Premia cuando te siga\n4. Repite cada vez que tire',
        repeticiones: 'Según necesidad',
        tip: 'No tires de la correa, simplemente cambia de dirección'
      },
      {
        nombre: 'El Juego del Nombre',
        instrucciones: '1. Di el nombre de tu perro\n2. Cuando te mire, di "Sí" y premia\n3. Practica en casa primero, luego en la calle\n4. Usa su nombre para recuperar su atención',
        repeticiones: '20 veces al día',
        tip: 'Su nombre = cosas buenas. Nunca lo uses para regañar'
      }
    ]
  },
  'calma-casa': {
    id: 'calma-casa',
    titulo: 'Calma en Casa',
    subtitulo: 'Relajación y autocontrol',
    descripcion: 'Ejercicios para que tu perro aprenda a estar tranquilo en casa y gestionar la excitación.',
    huesos: 8,
    imagen: 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=800',
    color: Colors.success,
    ejercicios: [
      {
        nombre: 'Captura la Calma',
        instrucciones: '1. Observa a tu perro durante el día\n2. Cuando esté tumbado tranquilo SIN que lo pidieras\n3. Acércate suavemente y dale un premio\n4. No digas nada, solo premia la calma',
        repeticiones: '5-10 veces al día',
        tip: 'No le llames para premiar. Ve tú donde está él'
      },
      {
        nombre: 'Manta de Relax',
        instrucciones: '1. Pon una manta especial en el suelo\n2. Guía a tu perro a la manta con premios\n3. Premia cada vez que esté en la manta\n4. La manta = zona de calma',
        repeticiones: '10 minutos, 2 veces al día',
        tip: 'Esta manta puedes llevarla a cualquier sitio'
      },
      {
        nombre: 'Ignorar la Excitación',
        instrucciones: '1. Cuando llegues a casa, ignora completamente a tu perro\n2. No le mires, hables ni toques\n3. Espera a que esté calmado (4 patas en el suelo)\n4. Solo entonces salúdale tranquilamente',
        repeticiones: 'Cada vez que llegues a casa',
        tip: 'Sé aburrido. La excitación no consigue tu atención'
      }
    ]
  }
};

interface EjercicioItem {
  nombre: string;
  instrucciones: string;
  repeticiones: string;
  tip: string;
}

interface Ejercicio {
  id: string;
  titulo: string;
  subtitulo: string;
  descripcion: string;
  huesos: number;
  imagen: string;
  color: string;
  ejercicios: EjercicioItem[];
}

export default function EjercicioScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t } = useLanguage();
  const [ejercicioActual, setEjercicioActual] = useState(0);
  const [completados, setCompletados] = useState<number[]>([]);

  const [rewardData, setRewardData] = useState<any>(null);
  const [submittingReward, setSubmittingReward] = useState(false);

  const ejercicio = EJERCICIOS_DB[id || 'senales-basicas'];

  if (!ejercicio) {
    return (
      <SafeAreaView style={styles.container}>
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
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={Colors.white} />
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
                    <Ionicons name="checkmark" size={18} color={Colors.white} />
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
                color={Colors.gray} 
              />
            </TouchableOpacity>

            {ejercicioActual === index && (
              <View style={styles.ejercicioContent}>
                <Text style={styles.instruccionesLabel}>{t('instructions')}</Text>
                <Text style={styles.instruccionesText}>{ej.instrucciones}</Text>
                
                <View style={styles.repeticionesRow}>
                  <Ionicons name="repeat" size={20} color={Colors.primary} />
                  <Text style={styles.repeticionesText}>{ej.repeticiones}</Text>
                </View>

                <View style={styles.tipContainer}>
                  <Ionicons name="bulb" size={20} color={Colors.accent} />
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
              <Ionicons name="checkmark-circle" size={24} color={Colors.white} />
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.primary,
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
    color: Colors.white,
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
    color: Colors.white,
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
    color: Colors.white,
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
    color: Colors.textSecondary,
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
    backgroundColor: Colors.grayLight,
  },
  progressDotComplete: {
    backgroundColor: Colors.primary,
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
    borderColor: Colors.grayLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxComplete: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  ejercicioNombre: {
    fontSize: FontSizes.lg,
    fontWeight: '700',
    color: Colors.text,
  },
  ejercicioNombreComplete: {
    color: Colors.primary,
  },
  ejercicioContent: {
    padding: Spacing.md,
    paddingTop: 0,
    borderTopWidth: 1,
    borderTopColor: Colors.grayLight,
  },
  instruccionesLabel: {
    fontSize: FontSizes.sm,
    fontWeight: '700',
    color: Colors.textSecondary,
    marginBottom: Spacing.sm,
    marginTop: Spacing.md,
  },
  instruccionesText: {
    fontSize: FontSizes.md,
    color: Colors.text,
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
    color: Colors.primary,
    fontWeight: '600',
  },
  tipContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
    backgroundColor: Colors.accentLight,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
  },
  tipText: {
    flex: 1,
    fontSize: FontSizes.sm,
    color: Colors.text,
    lineHeight: 20,
  },
  completarButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.primary,
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    marginTop: Spacing.md,
  },
  completarButtonText: {
    fontSize: FontSizes.lg,
    fontWeight: '700',
    color: Colors.white,
  },
});
