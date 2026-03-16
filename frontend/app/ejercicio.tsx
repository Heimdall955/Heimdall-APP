import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
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

export default function EjercicioScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t } = useLanguage();
  const { colors, shadows } = useTheme();

  const EJERCICIOS_DB: Record<string, any> = {
    'senales-basicas': {
      id: 'senales-basicas', titulo: 'Senales Basicas', subtitulo: 'Sentado, Tumbado, Quieto',
      descripcion: 'Los comandos fundamentales que todo perro deberia conocer.',
      huesos: 5, color: '#4CAF50', icon: 'hand-left',
      ejercicios: [
        { nombre: 'Sentado', instrucciones: '1. Sosten un premio cerca de la nariz\n2. Mueve hacia arriba\n3. Su trasero bajara\n4. Di "Sienta" y premia', repeticiones: '10 repeticiones', tip: 'No empujes su trasero' },
        { nombre: 'Tumbado', instrucciones: '1. Desde sentado, lleva premio al suelo\n2. Arrastra formando una "L"\n3. Sus codos tocaran el suelo\n4. Di "Tumba" y premia', repeticiones: '10 repeticiones', tip: 'Si se levanta, vuelve al sentado' },
        { nombre: 'Quieto', instrucciones: '1. Pide sentado o tumbado\n2. Di "Quieto" con palma hacia el\n3. Espera 1 segundo\n4. Premia y libera con "Vale"', repeticiones: '5 repeticiones', tip: 'Empieza con 1 segundo' }
      ]
    },
    'control-impulsos': {
      id: 'control-impulsos', titulo: 'Control de Impulsos', subtitulo: 'Espera, Deja, Suelta',
      descripcion: 'Ejercicios para que tu perro aprenda a controlar sus impulsos.',
      huesos: 10, color: '#9C27B0', icon: 'hourglass',
      ejercicios: [
        { nombre: 'Espera', instrucciones: '1. Pon comida en el suelo\n2. Cubre con la mano\n3. Solo cuando deje de intentar, descubre\n4. Di "Espera" antes', repeticiones: '8 repeticiones', tip: 'Empieza con premios de bajo valor' },
        { nombre: 'Deja', instrucciones: '1. Muestra un premio en mano cerrada\n2. Espera que deje de lamer/tocar\n3. En cuanto se aparte, premia con la otra mano\n4. Anade "Deja" como senal', repeticiones: '10 repeticiones', tip: 'Premia siempre con la OTRA mano' },
        { nombre: 'Suelta', instrucciones: '1. Ofrece un juguete\n2. Cuando lo tenga, muestra un premio\n3. Cuando suelte el juguete di "Suelta"\n4. Da el premio y devuelve el juguete', repeticiones: '6 repeticiones', tip: 'El juguete vuelve = recompensa doble' }
      ]
    },
    'socializacion': {
      id: 'socializacion', titulo: 'Socializacion', subtitulo: 'Perros, Personas, Entornos',
      descripcion: 'Aprende tecnicas para socializar correctamente a tu perro.',
      huesos: 15, color: '#00BFA5', icon: 'people',
      ejercicios: [
        { nombre: 'Observar Perros', instrucciones: '1. Lleva a tu perro a un parque\n2. Manten distancia segura\n3. Premia cuando mire perros con calma\n4. Reduce distancia gradualmente', repeticiones: '3 sesiones de 10 min', tip: 'Si se estresa, aumenta la distancia' },
        { nombre: 'Conocer Personas', instrucciones: '1. Pide a un amigo que se acerque\n2. Que lance premios sin mirar al perro\n3. Deja que el perro se acerque a su ritmo\n4. Premia la interaccion tranquila', repeticiones: '2-3 personas por sesion', tip: 'Nunca fuerces el contacto' },
        { nombre: 'Nuevos Entornos', instrucciones: '1. Visita un lugar nuevo tranquilo\n2. Deja que explore con correa larga\n3. Premia cuando se muestre curioso\n4. Si hay miedo, no fuerces', repeticiones: '1-2 lugares nuevos por semana', tip: 'Lleva muchos premios de alto valor' }
      ]
    },
    'paseos': {
      id: 'paseos', titulo: 'Paseos con Correa', subtitulo: 'Caminar sin tirar',
      descripcion: 'Tu perro aprendera a caminar a tu lado sin tirar de la correa.',
      huesos: 8, color: '#2196F3', icon: 'walk',
      ejercicios: [
        { nombre: 'Junto', instrucciones: '1. Con correa corta, camina\n2. Cuando la correa se tense, para\n3. Espera que te mire\n4. Premia y continua', repeticiones: '15 min de practica', tip: 'La paciencia es la clave' },
        { nombre: 'Cambio Direccion', instrucciones: '1. Camina y gira 180 grados\n2. Di el nombre de tu perro\n3. Premia cuando te siga\n4. Varia las direcciones', repeticiones: '10 cambios', tip: 'Hazlo divertido' }
      ]
    },
    'trucos': {
      id: 'trucos', titulo: 'Trucos Divertidos', subtitulo: 'Dar la pata, Girar, Reverencia',
      descripcion: 'Trucos divertidos que fortalecen el vinculo con tu perro.',
      huesos: 12, color: '#4CAF50', icon: 'star',
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
  const styles = useMemo(() => createStyles(colors, shadows), [colors, shadows]);

  if (!ejercicio) {
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
  const progress = ejercicio.ejercicios.length > 0 ? (completados.length / ejercicio.ejercicios.length) * 100 : 0;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top', 'bottom']}>
      {/* Clean Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} data-testid="exercise-back-btn">
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle}>{ejercicio.titulo}</Text>
          <Text style={styles.headerSub}>{ejercicio.subtitulo}</Text>
        </View>
        <View style={[styles.bonesBadge, { backgroundColor: ejercicio.color + '18' }]}>
          <Ionicons name="trophy" size={16} color={ejercicio.color} />
          <Text style={[styles.bonesCount, { color: ejercicio.color }]}>{ejercicio.huesos}</Text>
        </View>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Description Card */}
        <View style={[styles.descCard, { backgroundColor: ejercicio.color + '10', borderLeftColor: ejercicio.color }]}>
          <View style={[styles.descIcon, { backgroundColor: ejercicio.color + '20' }]}>
            <Ionicons name={ejercicio.icon as any} size={24} color={ejercicio.color} />
          </View>
          <Text style={styles.descText}>{ejercicio.descripcion}</Text>
        </View>

        {/* Progress Bar */}
        <View style={styles.progressSection}>
          <View style={styles.progressLabelRow}>
            <Text style={styles.progressLabel}>{completados.length}/{ejercicio.ejercicios.length} completados</Text>
            <Text style={[styles.progressPct, { color: ejercicio.color }]}>{Math.round(progress)}%</Text>
          </View>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${progress}%`, backgroundColor: ejercicio.color }]} />
          </View>
        </View>

        {/* Exercises */}
        {ejercicio.ejercicios.map((ej: any, index: number) => {
          const isOpen = ejercicioActual === index;
          const isDone = completados.includes(index);
          return (
            <Card key={index} style={[styles.exCard, isDone && { borderLeftWidth: 3, borderLeftColor: ejercicio.color }]}>
              <TouchableOpacity
                style={styles.exHeader}
                onPress={() => setEjercicioActual(isOpen ? -1 : index)}
                data-testid={`exercise-item-${index}`}
              >
                <TouchableOpacity
                  style={[styles.checkbox, isDone && { backgroundColor: ejercicio.color, borderColor: ejercicio.color }]}
                  onPress={() => toggleCompletado(index)}
                  data-testid={`exercise-check-${index}`}
                >
                  {isDone && <Ionicons name="checkmark" size={16} color="#FFF" />}
                </TouchableOpacity>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.exName, isDone && { color: ejercicio.color }]}>{ej.nombre}</Text>
                  <Text style={styles.exReps}>{ej.repeticiones}</Text>
                </View>
                <Ionicons name={isOpen ? 'chevron-up' : 'chevron-down'} size={20} color={colors.gray} />
              </TouchableOpacity>

              {isOpen && (
                <View style={styles.exBody}>
                  <Text style={styles.exLabel}>Instrucciones</Text>
                  <Text style={styles.exInstructions}>{ej.instrucciones}</Text>
                  <View style={[styles.tipBox, { backgroundColor: ejercicio.color + '10' }]}>
                    <Ionicons name="bulb" size={18} color={ejercicio.color} />
                    <Text style={[styles.tipText, { color: ejercicio.color }]}>{ej.tip}</Text>
                  </View>
                </View>
              )}
            </Card>
          );
        })}

        {/* Reward & Complete */}
        {todosCompletados && (
          <View style={styles.completeSection}>
            {rewardData && (
              <View style={[styles.rewardCard, { backgroundColor: ejercicio.color + '12' }]} data-testid="exercise-reward-banner">
                <Ionicons name="trophy" size={28} color={ejercicio.color} />
                <Text style={[styles.rewardAmount, { color: ejercicio.color }]}>+{rewardData.bones_added} huesos</Text>
                <Text style={styles.rewardXP}>Nivel {rewardData.level} - {rewardData.xp} XP</Text>
                {rewardData.leveled_up && (
                  <Text style={[styles.levelUp, { color: ejercicio.color }]}>Subiste al nivel {rewardData.level}!</Text>
                )}
              </View>
            )}
            <TouchableOpacity
              style={[styles.completeBtn, { backgroundColor: ejercicio.color }]}
              onPress={() => router.back()}
              data-testid="exercise-complete-button"
            >
              <Ionicons name="checkmark-circle" size={22} color="#FFF" />
              <Text style={styles.completeBtnText}>Completado</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const createStyles = (C: any, S: any) => StyleSheet.create({
  container: { flex: 1 },

  header: {
    flexDirection: 'row', alignItems: 'center', paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: C.grayLight,
  },
  backBtn: { width: 40, height: 40, justifyContent: 'center' },
  headerTitle: { fontSize: FontSizes.lg, fontWeight: '700', color: C.text },
  headerSub: { fontSize: FontSizes.sm, color: C.textSecondary, marginTop: 1 },
  bonesBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 20 },
  bonesCount: { fontSize: FontSizes.md, fontWeight: '800' },

  scroll: { flex: 1 },
  scrollContent: { padding: Spacing.md, paddingBottom: Spacing.xl },

  // Description
  descCard: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, padding: Spacing.md, borderRadius: BorderRadius.lg, borderLeftWidth: 4, marginBottom: Spacing.lg },
  descIcon: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  descText: { flex: 1, fontSize: FontSizes.md, color: C.text, lineHeight: 22 },

  // Progress
  progressSection: { marginBottom: Spacing.lg },
  progressLabelRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  progressLabel: { fontSize: FontSizes.sm, color: C.textSecondary },
  progressPct: { fontSize: FontSizes.sm, fontWeight: '700' },
  progressTrack: { height: 8, backgroundColor: C.grayLight, borderRadius: 4 },
  progressFill: { height: '100%', borderRadius: 4 },

  // Exercise Card
  exCard: { marginBottom: Spacing.sm, padding: 0, overflow: 'hidden' },
  exHeader: { flexDirection: 'row', alignItems: 'center', padding: Spacing.md, gap: Spacing.md },
  checkbox: { width: 26, height: 26, borderRadius: 13, borderWidth: 2, borderColor: C.grayLight, alignItems: 'center', justifyContent: 'center' },
  exName: { fontSize: FontSizes.md, fontWeight: '700', color: C.text },
  exReps: { fontSize: FontSizes.sm, color: C.textSecondary, marginTop: 2 },
  exBody: { paddingHorizontal: Spacing.md, paddingBottom: Spacing.md, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: C.grayLight },
  exLabel: { fontSize: FontSizes.sm, fontWeight: '700', color: C.textSecondary, marginTop: Spacing.md, marginBottom: Spacing.sm },
  exInstructions: { fontSize: FontSizes.md, color: C.text, lineHeight: 24, marginBottom: Spacing.md },
  tipBox: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, padding: Spacing.md, borderRadius: BorderRadius.md },
  tipText: { flex: 1, fontSize: FontSizes.sm, fontWeight: '600', lineHeight: 20 },

  // Complete
  completeSection: { marginTop: Spacing.md },
  rewardCard: { alignItems: 'center', padding: Spacing.lg, borderRadius: BorderRadius.lg, marginBottom: Spacing.md },
  rewardAmount: { fontSize: FontSizes.xxl, fontWeight: '800', marginTop: Spacing.sm },
  rewardXP: { fontSize: FontSizes.sm, color: C.textSecondary, marginTop: 4 },
  levelUp: { fontSize: FontSizes.lg, fontWeight: '800', marginTop: Spacing.sm },
  completeBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Spacing.sm, paddingVertical: 16, borderRadius: BorderRadius.lg },
  completeBtnText: { fontSize: FontSizes.lg, fontWeight: '700', color: '#FFF' },
});
