import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Colors, Spacing, BorderRadius, FontSizes, Shadows } from '../constants/theme';
import { Card } from '../components/ui';

// Base de datos de lecciones de educación canina en positivo
const LECCIONES_DB: Record<string, Leccion> = {
  'llamada-perfecta': {
    id: 'llamada-perfecta',
    titulo: 'La Llamada Perfecta',
    subtitulo: 'Aprende a que tu perro venga siempre que le llames',
    nivel: 'Intermedio',
    duracion: '10 min',
    xp: 50,
    huesos: 15,
    imagen: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=800',
    descripcion: 'La llamada es uno de los comandos más importantes que puedes enseñar a tu perro. Un perro que viene cuando le llamas está más seguro y tiene más libertad.',
    objetivos: [
      'Entender por qué tu perro no viene cuando le llamas',
      'Crear una asociación positiva con la llamada',
      'Practicar en diferentes niveles de distracción',
      'Consolidar la respuesta automática'
    ],
    pasos: [
      {
        titulo: 'Paso 1: La Palabra Mágica',
        contenido: 'Elige una palabra nueva para la llamada (ej: "Aquí", "Ven", "Come"). No uses su nombre si ya lo has "quemado" llamándole sin recompensa.',
        tip: 'La palabra debe ser corta, clara y fácil de pronunciar con entusiasmo.',
        duracion: '2 min'
      },
      {
        titulo: 'Paso 2: Asociación Positiva',
        contenido: 'En casa, sin distracciones, di la palabra y INMEDIATAMENTE dale un premio de alto valor (pollo, queso, salchicha). Repite 10-15 veces.',
        tip: 'El premio debe llegar en menos de 1 segundo después de la palabra.',
        duracion: '3 min'
      },
      {
        titulo: 'Paso 3: Añade Movimiento',
        contenido: 'Ahora di la palabra y aléjate corriendo de tu perro de forma divertida. Cuando llegue a ti, ¡fiesta de premios!',
        tip: 'Huir activa el instinto de persecución. Nunca persigas a tu perro.',
        duracion: '3 min'
      },
      {
        titulo: 'Paso 4: Aumenta la Distancia',
        contenido: 'Practica en diferentes habitaciones, luego en el jardín, y finalmente en espacios abiertos con correa larga (10-15m).',
        tip: 'Sube el nivel de dificultad gradualmente. Si falla, vuelve al paso anterior.',
        duracion: '2 min'
      }
    ],
    erroresComunes: [
      'Llamar al perro para algo negativo (baño, fin del paseo)',
      'Repetir la palabra muchas veces sin respuesta',
      'Perseguir al perro cuando no viene',
      'Premiar tarde o con algo de bajo valor'
    ],
    ejercicioPractico: 'Practica 3 llamadas exitosas hoy en un lugar sin distracciones. Anota cuántas veces viene a la primera.'
  },
  'sentado-basico': {
    id: 'sentado-basico',
    titulo: 'Sentado Perfecto',
    subtitulo: 'El comando fundamental para cualquier perro',
    nivel: 'Básico',
    duracion: '8 min',
    xp: 30,
    huesos: 10,
    imagen: 'https://images.unsplash.com/photo-1552053831-71594a27632d?w=800',
    descripcion: 'El sentado es la base de muchos otros comportamientos. Un perro que sabe sentarse puede esperar tranquilo en muchas situaciones.',
    objetivos: [
      'Enseñar el sentado con señuelo',
      'Añadir la señal verbal',
      'Eliminar el señuelo gradualmente',
      'Generalizar en diferentes contextos'
    ],
    pasos: [
      {
        titulo: 'Paso 1: El Señuelo',
        contenido: 'Con un premio en la mano, acércalo a la nariz de tu perro y muévelo lentamente hacia arriba y atrás. Su trasero bajará naturalmente.',
        tip: 'Mueve el premio despacio. Si salta, lo estás subiendo demasiado.',
        duracion: '2 min'
      },
      {
        titulo: 'Paso 2: Marca y Premia',
        contenido: 'En el MOMENTO EXACTO que su trasero toque el suelo, di "Sí" o usa un clicker, y dale el premio.',
        tip: 'El timing es crucial. Practica marcar en el momento exacto.',
        duracion: '2 min'
      },
      {
        titulo: 'Paso 3: Añade la Palabra',
        contenido: 'Una vez que tu perro siga el señuelo consistentemente, di "Sienta" JUSTO ANTES de hacer el movimiento con la mano.',
        tip: 'La palabra va ANTES del gesto, no durante ni después.',
        duracion: '2 min'
      },
      {
        titulo: 'Paso 4: Reduce el Señuelo',
        contenido: 'Gradualmente haz el movimiento de la mano más pequeño hasta que solo necesites la palabra o un pequeño gesto.',
        tip: 'Si deja de funcionar, vuelve al paso anterior por unas repeticiones.',
        duracion: '2 min'
      }
    ],
    erroresComunes: [
      'Empujar el trasero del perro hacia abajo',
      'Repetir "sienta, sienta, sienta" muchas veces',
      'Dar el premio antes de que esté completamente sentado',
      'Sesiones demasiado largas (más de 5 min)'
    ],
    ejercicioPractico: 'Practica 10 sentados antes de cada comida. Tu perro debe sentarse para "ganarse" su comida.'
  },
  'tumbado': {
    id: 'tumbado',
    titulo: 'Tumbado Relajado',
    subtitulo: 'Enseña a tu perro a tumbarse y relajarse',
    nivel: 'Básico',
    duracion: '10 min',
    xp: 35,
    huesos: 12,
    imagen: 'https://images.unsplash.com/photo-1517849845537-4d257902454a?w=800',
    descripcion: 'El tumbado es ideal para momentos de calma. Un perro tumbado está más relajado y es perfecto para restaurantes, visitas o momentos de espera.',
    objetivos: [
      'Enseñar el tumbado desde sentado',
      'Crear una posición relajada, no tensa',
      'Aumentar la duración del tumbado',
      'Practicar en diferentes superficies'
    ],
    pasos: [
      {
        titulo: 'Paso 1: Desde Sentado',
        contenido: 'Con tu perro sentado, lleva un premio desde su nariz hacia abajo entre sus patas delanteras, y luego hacia ti arrastrándolo por el suelo.',
        tip: 'Imagina una "L": primero hacia abajo, luego hacia ti.',
        duracion: '3 min'
      },
      {
        titulo: 'Paso 2: Marca el Momento',
        contenido: 'Cuando sus codos toquen el suelo, marca con "Sí" y premia. No esperes a que esté perfectamente tumbado al principio.',
        tip: 'Premia el progreso. Primero un codo, luego los dos.',
        duracion: '2 min'
      },
      {
        titulo: 'Paso 3: La Palabra "Tumba"',
        contenido: 'Una vez que siga el señuelo bien, añade la palabra "Tumba" o "Échate" justo antes del movimiento.',
        tip: 'Usa siempre la misma palabra. Toda la familia debe usar la misma.',
        duracion: '2 min'
      },
      {
        titulo: 'Paso 4: Duración',
        contenido: 'Empieza a contar 1 segundo antes de premiar, luego 2, luego 3... Aumenta gradualmente hasta 30 segundos.',
        tip: 'Si se levanta, no le riñas. Simplemente no premies y vuelve a empezar.',
        duracion: '3 min'
      }
    ],
    erroresComunes: [
      'Presionar la espalda del perro hacia abajo',
      'Señuelo demasiado rápido',
      'Practicar solo en casa (hay que generalizar)',
      'Esperar demasiado tiempo para premiar al principio'
    ],
    ejercicioPractico: 'Practica el tumbado en 3 lugares diferentes hoy: en casa, en el jardín/balcón, y en un lugar nuevo.'
  },
  'quieto': {
    id: 'quieto',
    titulo: 'Quieto como Estatua',
    subtitulo: 'Tu perro aprenderá a quedarse inmóvil',
    nivel: 'Intermedio',
    duracion: '12 min',
    xp: 45,
    huesos: 15,
    imagen: 'https://images.unsplash.com/photo-1477884213360-7e9d7dcc1e48?w=800',
    descripcion: 'El quieto es esencial para la seguridad. Permite que tu perro espere mientras abres la puerta, cruzas la calle o necesitas que no se mueva.',
    objetivos: [
      'Enseñar que "quieto" significa no moverse',
      'Aumentar duración gradualmente',
      'Añadir distancia entre tú y tu perro',
      'Añadir distracciones progresivamente'
    ],
    pasos: [
      {
        titulo: 'Paso 1: El Concepto',
        contenido: 'Pide un sentado o tumbado. Di "Quieto" con la palma de la mano hacia tu perro. Espera 1 segundo, marca y premia.',
        tip: 'El gesto de la mano debe ser claro y consistente.',
        duracion: '3 min'
      },
      {
        titulo: 'Paso 2: Aumenta el Tiempo',
        contenido: 'Aumenta gradualmente: 2 segundos, 3, 5, 10, 15, 30... Si rompe el quieto, reduce el tiempo y vuelve a construir.',
        tip: 'Mejor 5 repeticiones cortas exitosas que 1 larga fallida.',
        duracion: '3 min'
      },
      {
        titulo: 'Paso 3: Añade Distancia',
        contenido: 'Da un paso atrás, vuelve y premia. Luego dos pasos. Gradualmente aumenta hasta poder alejarte varios metros.',
        tip: 'Si se levanta al alejarte, estás yendo demasiado rápido.',
        duracion: '3 min'
      },
      {
        titulo: 'Paso 4: Añade Distracciones',
        contenido: 'Practica con distracciones suaves: deja caer un juguete, haz un ruido, pasa otra persona...',
        tip: 'Las distracciones deben empezar muy fáciles e ir aumentando.',
        duracion: '3 min'
      }
    ],
    erroresComunes: [
      'Aumentar tiempo y distancia a la vez',
      'No tener una palabra de liberación ("Vale", "Libre")',
      'Practicar solo en un lugar',
      'Frustrarse cuando rompe el quieto'
    ],
    ejercicioPractico: 'Practica 5 quietos de 10 segundos antes de ponerle la comida. Usa "Vale" para liberarle.'
  },
  'control-impulsos': {
    id: 'control-impulsos',
    titulo: 'Control de Impulsos',
    subtitulo: 'Espera, Deja, Suelta - Los 3 pilares',
    nivel: 'Intermedio',
    duracion: '15 min',
    xp: 55,
    huesos: 18,
    imagen: 'https://images.unsplash.com/photo-1544568100-847a948585b9?w=800',
    descripcion: 'Un perro con autocontrol es un perro feliz y seguro. Estos ejercicios enseñan a tu perro a pensar antes de actuar.',
    objetivos: [
      'Enseñar "Espera" antes de la comida',
      'Enseñar "Deja" para ignorar cosas',
      'Enseñar "Suelta" para soltar objetos',
      'Aplicar en situaciones cotidianas'
    ],
    pasos: [
      {
        titulo: 'Ejercicio: Espera',
        contenido: 'Con la comida en la mano, cierra el puño. Cuando tu perro deje de intentar cogerla y te mire, di "Sí" y dale el premio.',
        tip: 'Espera el contacto visual. Eso significa que está pensando, no solo reaccionando.',
        duracion: '4 min'
      },
      {
        titulo: 'Ejercicio: Deja',
        contenido: 'Muestra un premio, di "Deja" y cúbrelo con la mano. Cuando se aleje o te mire, premia con OTRO premio de tu otra mano.',
        tip: 'Nunca le des el premio que le pediste que dejara. Eso enseña persistencia.',
        duracion: '4 min'
      },
      {
        titulo: 'Ejercicio: Suelta',
        contenido: 'Durante el juego, ofrece un premio irresistible cerca de su nariz. Cuando suelte el juguete, di "Suelta", dale el premio y devuélvele el juguete.',
        tip: 'Devolver el juguete enseña que soltar es ganar, no perder.',
        duracion: '4 min'
      },
      {
        titulo: 'Aplicación Práctica',
        contenido: 'Usa "Espera" antes de cada comida, "Deja" con cosas del suelo en el paseo, "Suelta" con juguetes y objetos.',
        tip: 'La práctica diaria hace que estos comandos sean automáticos.',
        duracion: '3 min'
      }
    ],
    erroresComunes: [
      'Dar el mismo premio que pediste que dejara',
      'Tirar del juguete cuando pides "suelta"',
      'No practicar consistentemente',
      'Esperar perfección demasiado pronto'
    ],
    ejercicioPractico: 'Hoy practica los 3 ejercicios: 5 repeticiones de cada uno antes de la cena.'
  },
  'socializacion': {
    id: 'socializacion',
    titulo: 'Socialización Positiva',
    subtitulo: 'Perros, Personas, Entornos nuevos',
    nivel: 'Todos los niveles',
    duracion: '12 min',
    xp: 50,
    huesos: 15,
    imagen: 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=800',
    descripcion: 'La socialización correcta crea un perro seguro y equilibrado. No se trata de cantidad, sino de CALIDAD de experiencias.',
    objetivos: [
      'Entender qué es socialización positiva',
      'Crear experiencias positivas con personas',
      'Presentaciones correctas con otros perros',
      'Habituación a entornos y sonidos'
    ],
    pasos: [
      {
        titulo: 'Regla de Oro',
        contenido: 'La socialización NO es exponer a tu perro a muchas cosas. Es asegurarte de que cada experiencia sea POSITIVA. Calidad sobre cantidad.',
        tip: 'Si tu perro muestra miedo, aléjate. Forzar empeora el miedo.',
        duracion: '2 min'
      },
      {
        titulo: 'Personas Nuevas',
        contenido: 'Pide a las personas que ignoren a tu perro al principio. Deja que él se acerque cuando esté listo. Premia cada interacción positiva.',
        tip: 'No dejes que extraños le acaricien la cabeza desde arriba. Es intimidante.',
        duracion: '3 min'
      },
      {
        titulo: 'Otros Perros',
        contenido: 'Presentaciones con correa floja, en paralelo (caminando en la misma dirección), no cara a cara. Observa el lenguaje corporal.',
        tip: 'Señales de estrés: cola baja, lamerse los labios, bostezar, girar la cabeza.',
        duracion: '4 min'
      },
      {
        titulo: 'Entornos y Sonidos',
        contenido: 'Expón gradualmente a sonidos (tráfico, obras, tormentas) a volumen bajo mientras le das premios. Aumenta gradualmente.',
        tip: 'YouTube tiene videos de "desensibilización a sonidos para perros".',
        duracion: '3 min'
      }
    ],
    erroresComunes: [
      'Forzar al perro a acercarse a algo que le da miedo',
      'Dejar que otros perros "le enseñen" siendo bruscos',
      'No premiar durante las experiencias nuevas',
      'Exponer a demasiadas cosas demasiado rápido'
    ],
    ejercicioPractico: 'Haz una salida de socialización: 10 min observando el mundo desde distancia segura, premiando calma.'
  }
};

interface Paso {
  titulo: string;
  contenido: string;
  tip: string;
  duracion: string;
}

interface Leccion {
  id: string;
  titulo: string;
  subtitulo: string;
  nivel: string;
  duracion: string;
  xp: number;
  huesos: number;
  imagen: string;
  descripcion: string;
  objetivos: string[];
  pasos: Paso[];
  erroresComunes: string[];
  ejercicioPractico: string;
}

export default function LeccionScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [pasoActual, setPasoActual] = useState(0);
  const [completado, setCompletado] = useState(false);

  const leccion = LECCIONES_DB[id || 'llamada-perfecta'];

  if (!leccion) {
    return (
      <SafeAreaView style={styles.container}>
        <Text>Lección no encontrada</Text>
      </SafeAreaView>
    );
  }

  const handleSiguiente = () => {
    if (pasoActual < leccion.pasos.length - 1) {
      setPasoActual(pasoActual + 1);
    } else {
      setCompletado(true);
    }
  };

  const handleAnterior = () => {
    if (pasoActual > 0) {
      setPasoActual(pasoActual - 1);
    }
  };

  if (completado) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <ScrollView style={styles.scrollView} contentContainerStyle={styles.completadoContainer}>
          <View style={styles.completadoIcon}>
            <Ionicons name="checkmark-circle" size={80} color={Colors.primary} />
          </View>
          <Text style={styles.completadoTitulo}>¡Lección Completada!</Text>
          <Text style={styles.completadoSubtitulo}>{leccion.titulo}</Text>
          
          <View style={styles.recompensasRow}>
            <View style={styles.recompensaItem}>
              <Ionicons name="flash" size={32} color={Colors.accent} />
              <Text style={styles.recompensaValor}>+{leccion.xp} XP</Text>
            </View>
            <View style={styles.recompensaItem}>
              <Text style={styles.boneEmoji}>🦴</Text>
              <Text style={styles.recompensaValor}>+{leccion.huesos}</Text>
            </View>
          </View>

          <Card style={styles.ejercicioCard}>
            <View style={styles.ejercicioHeader}>
              <Ionicons name="fitness" size={24} color={Colors.primary} />
              <Text style={styles.ejercicioTitulo}>Tu Ejercicio Práctico</Text>
            </View>
            <Text style={styles.ejercicioTexto}>{leccion.ejercicioPractico}</Text>
          </Card>

          <TouchableOpacity style={styles.volverButton} onPress={() => router.back()}>
            <Text style={styles.volverButtonText}>Volver a Educación</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    );
  }

  const pasoActualData = leccion.pasos[pasoActual];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={Colors.text} />
        </TouchableOpacity>
        <View style={styles.headerProgress}>
          <Text style={styles.headerProgressText}>
            Paso {pasoActual + 1} de {leccion.pasos.length}
          </Text>
        </View>
        <TouchableOpacity onPress={() => router.back()} style={styles.closeButton}>
          <Ionicons name="close" size={24} color={Colors.text} />
        </TouchableOpacity>
      </View>

      {/* Progress Bar */}
      <View style={styles.progressBarContainer}>
        <View style={styles.progressBarTrack}>
          <View 
            style={[
              styles.progressBarFill, 
              { width: `${((pasoActual + 1) / leccion.pasos.length) * 100}%` }
            ]} 
          />
        </View>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Imagen si es el primer paso */}
        {pasoActual === 0 && (
          <Image source={{ uri: leccion.imagen }} style={styles.leccionImagen} />
        )}

        {/* Título del paso */}
        <Text style={styles.pasoTitulo}>{pasoActualData.titulo}</Text>
        <View style={styles.pasoDuracion}>
          <Ionicons name="time-outline" size={16} color={Colors.textSecondary} />
          <Text style={styles.pasoDuracionText}>{pasoActualData.duracion}</Text>
        </View>

        {/* Contenido */}
        <Card style={styles.contenidoCard}>
          <Text style={styles.contenidoTexto}>{pasoActualData.contenido}</Text>
        </Card>

        {/* Tip */}
        <View style={styles.tipContainer}>
          <View style={styles.tipIcon}>
            <Ionicons name="bulb" size={24} color={Colors.accent} />
          </View>
          <View style={styles.tipContent}>
            <Text style={styles.tipLabel}>Consejo Pro</Text>
            <Text style={styles.tipTexto}>{pasoActualData.tip}</Text>
          </View>
        </View>

        {/* Objetivos en el primer paso */}
        {pasoActual === 0 && (
          <View style={styles.objetivosSection}>
            <Text style={styles.objetivosTitulo}>Lo que aprenderás:</Text>
            {leccion.objetivos.map((objetivo, index) => (
              <View key={index} style={styles.objetivoItem}>
                <Ionicons name="checkmark-circle" size={20} color={Colors.primary} />
                <Text style={styles.objetivoTexto}>{objetivo}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Errores comunes en el último paso */}
        {pasoActual === leccion.pasos.length - 1 && (
          <View style={styles.erroresSection}>
            <Text style={styles.erroresTitulo}>Errores Comunes a Evitar:</Text>
            {leccion.erroresComunes.map((error, index) => (
              <View key={index} style={styles.errorItem}>
                <Ionicons name="close-circle" size={20} color={Colors.error} />
                <Text style={styles.errorTexto}>{error}</Text>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Navigation Buttons */}
      <View style={styles.navigationContainer}>
        {pasoActual > 0 ? (
          <TouchableOpacity style={styles.anteriorButton} onPress={handleAnterior}>
            <Ionicons name="arrow-back" size={20} color={Colors.primary} />
            <Text style={styles.anteriorButtonText}>Anterior</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.placeholder} />
        )}
        
        <TouchableOpacity style={styles.siguienteButton} onPress={handleSiguiente}>
          <Text style={styles.siguienteButtonText}>
            {pasoActual === leccion.pasos.length - 1 ? 'Completar' : 'Siguiente'}
          </Text>
          <Ionicons 
            name={pasoActual === leccion.pasos.length - 1 ? 'checkmark' : 'arrow-forward'} 
            size={20} 
            color={Colors.white} 
          />
        </TouchableOpacity>
      </View>
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
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerProgress: {
    backgroundColor: Colors.primaryLight,
    paddingVertical: 6,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.full,
  },
  headerProgressText: {
    fontSize: FontSizes.sm,
    fontWeight: '600',
    color: Colors.primary,
  },
  closeButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressBarContainer: {
    paddingHorizontal: Spacing.md,
    marginBottom: Spacing.md,
  },
  progressBarTrack: {
    height: 6,
    backgroundColor: Colors.grayLight,
    borderRadius: 3,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: 3,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: Spacing.md,
    paddingBottom: Spacing.xxl,
  },
  leccionImagen: {
    width: '100%',
    height: 200,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.lg,
  },
  pasoTitulo: {
    fontSize: FontSizes.xxl,
    fontWeight: '800',
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  pasoDuracion: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: Spacing.lg,
  },
  pasoDuracionText: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
  },
  contenidoCard: {
    marginBottom: Spacing.lg,
  },
  contenidoTexto: {
    fontSize: FontSizes.lg,
    color: Colors.text,
    lineHeight: 26,
  },
  tipContainer: {
    flexDirection: 'row',
    backgroundColor: Colors.accentLight,
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.lg,
    gap: Spacing.md,
  },
  tipIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tipContent: {
    flex: 1,
  },
  tipLabel: {
    fontSize: FontSizes.sm,
    fontWeight: '700',
    color: Colors.accent,
    marginBottom: 4,
  },
  tipTexto: {
    fontSize: FontSizes.md,
    color: Colors.text,
    lineHeight: 22,
  },
  objetivosSection: {
    marginBottom: Spacing.lg,
  },
  objetivosTitulo: {
    fontSize: FontSizes.lg,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: Spacing.md,
  },
  objetivoItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  objetivoTexto: {
    flex: 1,
    fontSize: FontSizes.md,
    color: Colors.text,
    lineHeight: 22,
  },
  erroresSection: {
    backgroundColor: '#FFF5F5',
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    marginTop: Spacing.md,
  },
  erroresTitulo: {
    fontSize: FontSizes.lg,
    fontWeight: '700',
    color: Colors.error,
    marginBottom: Spacing.md,
  },
  errorItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  errorTexto: {
    flex: 1,
    fontSize: FontSizes.md,
    color: Colors.text,
    lineHeight: 22,
  },
  navigationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: Spacing.md,
    backgroundColor: Colors.white,
    borderTopWidth: 1,
    borderTopColor: Colors.grayLight,
  },
  placeholder: {
    width: 100,
  },
  anteriorButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
  },
  anteriorButtonText: {
    fontSize: FontSizes.md,
    fontWeight: '600',
    color: Colors.primary,
  },
  siguienteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    backgroundColor: Colors.primary,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.lg,
  },
  siguienteButtonText: {
    fontSize: FontSizes.md,
    fontWeight: '700',
    color: Colors.white,
  },
  completadoContainer: {
    padding: Spacing.xl,
    alignItems: 'center',
  },
  completadoIcon: {
    marginBottom: Spacing.lg,
  },
  completadoTitulo: {
    fontSize: FontSizes.title,
    fontWeight: '800',
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  completadoSubtitulo: {
    fontSize: FontSizes.lg,
    color: Colors.textSecondary,
    marginBottom: Spacing.xl,
  },
  recompensasRow: {
    flexDirection: 'row',
    gap: Spacing.xl,
    marginBottom: Spacing.xl,
  },
  recompensaItem: {
    alignItems: 'center',
    gap: Spacing.xs,
  },
  boneEmoji: {
    fontSize: 32,
  },
  recompensaValor: {
    fontSize: FontSizes.xl,
    fontWeight: '700',
    color: Colors.text,
  },
  ejercicioCard: {
    width: '100%',
    marginBottom: Spacing.xl,
  },
  ejercicioHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  ejercicioTitulo: {
    fontSize: FontSizes.lg,
    fontWeight: '700',
    color: Colors.primary,
  },
  ejercicioTexto: {
    fontSize: FontSizes.md,
    color: Colors.text,
    lineHeight: 24,
  },
  volverButton: {
    backgroundColor: Colors.primary,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xl,
    borderRadius: BorderRadius.lg,
  },
  volverButtonText: {
    fontSize: FontSizes.lg,
    fontWeight: '700',
    color: Colors.white,
  },
});
