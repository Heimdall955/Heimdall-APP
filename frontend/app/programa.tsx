import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Colors, Spacing, BorderRadius, FontSizes, Shadows } from '../constants/theme';
import { useTheme } from '../contexts/ThemeContext';
import { Card } from '../components/ui';
import { useLanguage } from '../contexts/LanguageContext';

interface Leccion {
  id: string;
  titulo: string;
  descripcion: string;
  duracion: string;
  xp: number;
  completada: boolean;
}

interface Programa {
  id: string;
  titulo: string;
  subtitulo: string;
  descripcion: string;
  categoria: string;
  categoriaColor: string;
  imagen: string;
  duracionTotal: string;
  lecciones: Leccion[];
  objetivos: string[];
}

const PROGRAMAS_DB: Record<string, Programa> = {
  'educacion-basica': {
    id: 'educacion-basica',
    titulo: 'Educación Básica',
    subtitulo: 'Fundamentos sólidos para tu perro',
    descripcion: 'Aprende las bases del adiestramiento canino con técnicas de refuerzo positivo. Este programa te guiará paso a paso para establecer una comunicación efectiva con tu perro.',
    categoria: 'Básico',
    categoriaColor: '#4CAF50',
    imagen: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=600',
    duracionTotal: '4 semanas',
    lecciones: [
      { id: 'refuerzo-positivo', titulo: 'Introducción al Refuerzo Positivo', descripcion: 'Fundamentos del entrenamiento', duracion: '15 min', xp: 20, completada: false },
      { id: 'sentado-basico', titulo: 'El Comando "Sienta"', descripcion: 'Primera señal básica', duracion: '20 min', xp: 25, completada: false },
      { id: 'quieto', titulo: 'El Comando "Quieto"', descripcion: 'Control y paciencia', duracion: '25 min', xp: 30, completada: false },
      { id: 'llamada-perfecta', titulo: 'El Comando "Ven"', descripcion: 'La llamada perfecta', duracion: '20 min', xp: 25, completada: false },
      { id: 'tumbado', titulo: 'El Comando "Tumba"', descripcion: 'Posición de relajación', duracion: '20 min', xp: 25, completada: false },
      { id: 'paseo-correa', titulo: 'Paseo con Correa', descripcion: 'Caminar sin tirones', duracion: '30 min', xp: 35, completada: false },
    ],
    objetivos: [
      'Establecer comunicación clara con tu perro',
      'Dominar los 5 comandos básicos',
      'Crear rutinas de entrenamiento diarias',
      'Pasear sin tirones de correa',
    ],
  },
  'calma-control': {
    id: 'calma-control',
    titulo: 'Calma y Control',
    subtitulo: 'Gestión del estrés canino',
    descripcion: 'Técnicas especializadas para ayudar a tu perro a manejar la ansiedad y el estrés. Ideal para perros reactivos o que se sobreexcitan fácilmente.',
    categoria: 'Emocional',
    categoriaColor: '#FF9800',
    imagen: 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=600',
    duracionTotal: '3 semanas',
    lecciones: [
      { id: 'estres-canino', titulo: 'Entender el Estrés Canino', descripcion: 'Señales y causas', duracion: '15 min', xp: 20, completada: false },
      { id: 'relajacion', titulo: 'Técnicas de Relajación', descripcion: 'Ejercicios calmantes', duracion: '25 min', xp: 30, completada: false },
      { id: 'lugar-seguro', titulo: 'El Lugar Seguro', descripcion: 'Crear un refugio', duracion: '20 min', xp: 25, completada: false },
      { id: 'desensibilizacion', titulo: 'Desensibilización', descripcion: 'Reducir la reactividad', duracion: '30 min', xp: 35, completada: false },
      { id: 'rutinas-calmantes', titulo: 'Rutinas Calmantes', descripcion: 'Establecer paz diaria', duracion: '20 min', xp: 25, completada: false },
    ],
    objetivos: [
      'Identificar señales de estrés en tu perro',
      'Aplicar técnicas de relajación efectivas',
      'Crear un ambiente tranquilo en casa',
      'Manejar situaciones de alta excitación',
    ],
  },
  'socializacion': {
    id: 'socializacion',
    titulo: 'Socialización',
    subtitulo: 'Amigos caninos y humanos',
    descripcion: 'Programa completo para mejorar las habilidades sociales de tu perro. Aprenderás a presentar nuevos perros, personas y situaciones de forma segura.',
    categoria: 'Social',
    categoriaColor: '#2196F3',
    imagen: 'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=600',
    duracionTotal: '5 semanas',
    lecciones: [
      { id: 'ventana-socializacion', titulo: 'La Ventana de Socialización', descripcion: 'Períodos críticos', duracion: '15 min', xp: 20, completada: false },
      { id: 'presentaciones-perros', titulo: 'Presentaciones Seguras', descripcion: 'Conocer otros perros', duracion: '25 min', xp: 30, completada: false },
      { id: 'interaccion-humanos', titulo: 'Interacción con Humanos', descripcion: 'Saludos apropiados', duracion: '20 min', xp: 25, completada: false },
      { id: 'nuevos-entornos', titulo: 'Nuevos Entornos', descripcion: 'Explorar con confianza', duracion: '25 min', xp: 30, completada: false },
      { id: 'sonidos-estimulos', titulo: 'Sonidos y Estímulos', descripcion: 'Habituación gradual', duracion: '20 min', xp: 25, completada: false },
      { id: 'parque-canino', titulo: 'El Parque Canino', descripcion: 'Juego social seguro', duracion: '30 min', xp: 35, completada: false },
    ],
    objetivos: [
      'Mejorar la confianza social de tu perro',
      'Realizar presentaciones seguras con otros perros',
      'Enseñar saludos apropiados con personas',
      'Explorar nuevos lugares sin miedo',
    ],
  },
  'mundo-cachorro': {
    id: 'mundo-cachorro',
    titulo: 'Mundo Cachorro',
    subtitulo: 'Primeros pasos juntos',
    descripcion: 'Todo lo que necesitas saber para criar un cachorro feliz y equilibrado. Desde el primer día en casa hasta los 6 meses de edad.',
    categoria: 'Cachorros',
    categoriaColor: '#E91E63',
    imagen: 'https://images.unsplash.com/photo-1591160690555-5debfba289f0?w=600',
    duracionTotal: '6 semanas',
    lecciones: [
      { id: 'bienvenido-casa', titulo: 'Bienvenido a Casa', descripcion: 'El primer día', duracion: '15 min', xp: 20, completada: false },
      { id: 'rutina-cachorro', titulo: 'Rutina del Cachorro', descripcion: 'Horarios y hábitos', duracion: '20 min', xp: 25, completada: false },
      { id: 'inhibicion-mordisco', titulo: 'Inhibición del Mordisco', descripcion: 'Boca suave', duracion: '25 min', xp: 30, completada: false },
      { id: 'necesidades', titulo: 'Enseñar a Hacer Sus Necesidades', descripcion: 'Entrenamiento de baño', duracion: '25 min', xp: 30, completada: false },
      { id: 'socializacion-temprana', titulo: 'Socialización Temprana', descripcion: 'Experiencias positivas', duracion: '20 min', xp: 25, completada: false },
      { id: 'juego-apropiado', titulo: 'Juego Apropiado', descripcion: 'Diversión segura', duracion: '20 min', xp: 25, completada: false },
      { id: 'quedarse-solo', titulo: 'Quedarse Solo', descripcion: 'Prevenir ansiedad', duracion: '25 min', xp: 30, completada: false },
    ],
    objetivos: [
      'Establecer rutinas saludables desde el inicio',
      'Enseñar inhibición del mordisco',
      'Completar entrenamiento de baño',
      'Socializar correctamente al cachorro',
      'Prevenir problemas de comportamiento',
    ],
  },
};

export default function ProgramaScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t } = useLanguage();
  const [leccionesCompletadas, setLeccionesCompletadas] = useState<string[]>([]);

  const programa = PROGRAMAS_DB[id || 'educacion-basica'];

  if (!programa) {
    return (
      <SafeAreaView style={styles.container}>
        <Text>{t('error')}</Text>
      </SafeAreaView>
    );
  }

  const progreso = (leccionesCompletadas.length / programa.lecciones.length) * 100;
  const xpTotal = programa.lecciones.reduce((acc, l) => acc + l.xp, 0);

  const handleLeccionPress = (leccionId: string) => {
    // Navegar a la lección específica usando el ID directo
    router.push(`/leccion?id=${leccionId}`);
  };

  const toggleLeccionCompletada = (leccionId: string) => {
    setLeccionesCompletadas(prev => 
      prev.includes(leccionId) 
        ? prev.filter(id => id !== leccionId)
        : [...prev, leccionId]
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header Image */}
      <View style={styles.heroContainer}>
        <Image source={{ uri: programa.imagen }} style={styles.heroImage} />
        <View style={styles.heroOverlay} />
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={Colors.white} />
        </TouchableOpacity>
        <View style={styles.heroContent}>
          <View style={[styles.categoryBadge, { backgroundColor: programa.categoriaColor }]}>
            <Text style={styles.categoryText}>{programa.categoria}</Text>
          </View>
          <Text style={styles.heroTitle}>{programa.titulo}</Text>
          <Text style={styles.heroSubtitle}>{programa.subtitulo}</Text>
          <View style={styles.heroMeta}>
            <View style={styles.metaItem}>
              <Ionicons name="time-outline" size={16} color={Colors.white} />
              <Text style={styles.metaText}>{programa.duracionTotal}</Text>
            </View>
            <View style={styles.metaItem}>
              <Ionicons name="book-outline" size={16} color={Colors.white} />
              <Text style={styles.metaText}>{programa.lecciones.length} {t('lessons')}</Text>
            </View>
            <View style={styles.metaItem}>
              <Text style={styles.metaText}>🦴 {xpTotal} XP</Text>
            </View>
          </View>
        </View>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Progress Card */}
        <Card style={styles.progressCard} variant="elevated">
          <View style={styles.progressHeader}>
            <Text style={styles.progressTitle}>{t('yourProgress')}</Text>
            <Text style={styles.progressPercent}>{Math.round(progreso)}%</Text>
          </View>
          <View style={styles.progressBarContainer}>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${progreso}%` }]} />
            </View>
          </View>
          <Text style={styles.progressSubtext}>
            {leccionesCompletadas.length} {t('of')} {programa.lecciones.length} {t('lessons')} {t('completed')}
          </Text>
        </Card>

        {/* Description */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('description')}</Text>
          <Text style={styles.descriptionText}>{programa.descripcion}</Text>
        </View>

        {/* Objectives */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('whatYouWillLearn')}</Text>
          {programa.objetivos.map((objetivo, index) => (
            <View key={index} style={styles.objetivoItem}>
              <Ionicons name="checkmark-circle" size={20} color={Colors.primary} />
              <Text style={styles.objetivoText}>{objetivo}</Text>
            </View>
          ))}
        </View>

        {/* Lessons */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('lessons')}</Text>
          {programa.lecciones.map((leccion, index) => (
            <TouchableOpacity 
              key={leccion.id} 
              style={styles.leccionCard}
              onPress={() => handleLeccionPress(leccion.id)}
            >
              <TouchableOpacity 
                style={[
                  styles.checkbox,
                  leccionesCompletadas.includes(leccion.id) && styles.checkboxComplete
                ]}
                onPress={() => toggleLeccionCompletada(leccion.id)}
              >
                {leccionesCompletadas.includes(leccion.id) && (
                  <Ionicons name="checkmark" size={16} color={Colors.white} />
                )}
              </TouchableOpacity>
              <View style={styles.leccionNumber}>
                <Text style={styles.leccionNumberText}>{index + 1}</Text>
              </View>
              <View style={styles.leccionContent}>
                <Text style={[
                  styles.leccionTitle,
                  leccionesCompletadas.includes(leccion.id) && styles.leccionTitleComplete
                ]}>
                  {leccion.titulo}
                </Text>
                <Text style={styles.leccionSubtitle}>{leccion.descripcion}</Text>
                <View style={styles.leccionMeta}>
                  <View style={styles.leccionMetaItem}>
                    <Ionicons name="time-outline" size={14} color={Colors.gray} />
                    <Text style={styles.leccionMetaText}>{leccion.duracion}</Text>
                  </View>
                  <View style={styles.leccionMetaItem}>
                    <Text style={styles.leccionMetaText}>🦴 +{leccion.xp}</Text>
                  </View>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={20} color={Colors.gray} />
            </TouchableOpacity>
          ))}
        </View>

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
  heroContainer: {
    height: 280,
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
  categoryBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.sm,
    marginBottom: Spacing.xs,
  },
  categoryText: {
    color: Colors.white,
    fontSize: FontSizes.xs,
    fontWeight: '600',
  },
  heroTitle: {
    fontSize: FontSizes.xxl,
    fontWeight: 'bold',
    color: Colors.white,
    marginBottom: 4,
  },
  heroSubtitle: {
    fontSize: FontSizes.md,
    color: Colors.white,
    opacity: 0.9,
    marginBottom: Spacing.sm,
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
    color: Colors.white,
    fontSize: FontSizes.sm,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: Spacing.md,
  },
  progressCard: {
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  progressTitle: {
    fontSize: FontSizes.md,
    fontWeight: '600',
    color: Colors.text,
  },
  progressPercent: {
    fontSize: FontSizes.lg,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  progressBarContainer: {
    marginBottom: Spacing.xs,
  },
  progressBar: {
    height: 8,
    backgroundColor: Colors.lightGray,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: 4,
  },
  progressSubtext: {
    fontSize: FontSizes.sm,
    color: Colors.gray,
  },
  section: {
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    fontSize: FontSizes.lg,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: Spacing.sm,
  },
  descriptionText: {
    fontSize: FontSizes.md,
    color: Colors.darkGray,
    lineHeight: 24,
  },
  objetivoItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  objetivoText: {
    flex: 1,
    fontSize: FontSizes.md,
    color: Colors.text,
  },
  leccionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.sm,
    ...Shadows.sm,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Colors.gray,
    marginRight: Spacing.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxComplete: {
    backgroundColor: Colors.success,
    borderColor: Colors.success,
  },
  leccionNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.sm,
  },
  leccionNumberText: {
    fontSize: FontSizes.sm,
    fontWeight: '600',
    color: Colors.primary,
  },
  leccionContent: {
    flex: 1,
  },
  leccionTitle: {
    fontSize: FontSizes.md,
    fontWeight: '600',
    color: Colors.text,
  },
  leccionTitleComplete: {
    textDecorationLine: 'line-through',
    color: Colors.gray,
  },
  leccionSubtitle: {
    fontSize: FontSizes.sm,
    color: Colors.gray,
    marginTop: 2,
  },
  leccionMeta: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginTop: Spacing.xs,
  },
  leccionMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  leccionMetaText: {
    fontSize: FontSizes.xs,
    color: Colors.gray,
  },
});
