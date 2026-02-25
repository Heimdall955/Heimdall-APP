import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Modal, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import axios from 'axios';
import { Colors, Spacing, BorderRadius, FontSizes, Shadows } from '../constants/theme';
import { useTheme } from '../contexts/ThemeContext';
import { Card } from '../components/ui';
import { useLanguage, Language } from '../contexts/LanguageContext';
import { SecureStore } from '../utils/secureStore';

const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL || '';

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
  },
  // Nuevas lecciones para los programas
  'refuerzo-positivo': {
    id: 'refuerzo-positivo',
    titulo: 'Introducción al Refuerzo Positivo',
    subtitulo: 'Los fundamentos del entrenamiento moderno',
    nivel: 'Básico',
    duracion: '15 min',
    xp: 20,
    huesos: 8,
    imagen: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=800',
    descripcion: 'El refuerzo positivo es la base de todo entrenamiento moderno. Aprende por qué funciona y cómo aplicarlo correctamente.',
    objetivos: [
      'Entender qué es el refuerzo positivo',
      'Conocer los tipos de premios',
      'Aprender el timing correcto',
      'Evitar errores comunes'
    ],
    pasos: [
      { titulo: 'Qué es el Refuerzo Positivo', contenido: 'Es añadir algo que tu perro quiere (premio, juego, caricias) inmediatamente después de un comportamiento para que lo repita.', tip: 'El comportamiento que se premia se repite. El que se ignora se extingue.', duracion: '3 min' },
      { titulo: 'Tipos de Premios', contenido: 'Comida (más efectiva), juguetes, caricias, libertad. Usa premios de alto valor (pollo, queso) para comportamientos difíciles.', tip: 'Varía los premios para mantener la motivación alta.', duracion: '4 min' },
      { titulo: 'El Timing Perfecto', contenido: 'El premio debe llegar en menos de 1-2 segundos después del comportamiento. Usa una palabra marcador ("Sí", "Bien") o clicker.', tip: 'Practica tu timing sin el perro: marca cuando la TV muestre algo específico.', duracion: '4 min' },
      { titulo: 'Errores a Evitar', contenido: 'No premies tarde, no repitas comandos, no uses castigos físicos, no entrenes cuando estés frustrado.', tip: 'Sesiones cortas (5-10 min) son más efectivas que largas.', duracion: '4 min' }
    ],
    erroresComunes: ['Premiar demasiado tarde', 'Sesiones muy largas', 'Expectativas irreales', 'Inconsistencia entre miembros de la familia'],
    ejercicioPractico: 'Practica el timing: di "Sí" cada vez que tu perro te mire, y dale un premio.'
  },
  'paseo-correa': {
    id: 'paseo-correa',
    titulo: 'Paseo con Correa',
    subtitulo: 'Caminar sin tirones de forma relajada',
    nivel: 'Intermedio',
    duracion: '30 min',
    xp: 35,
    huesos: 12,
    imagen: 'https://images.unsplash.com/photo-1558929996-da64ba858215?w=800',
    descripcion: 'Un paseo agradable es posible. Aprende técnicas para que tu perro camine a tu lado sin tirar de la correa.',
    objetivos: ['Entender por qué tira', 'Enseñar la posición correcta', 'Manejar distracciones', 'Disfrutar de paseos relajados'],
    pasos: [
      { titulo: 'Por Qué Tira', contenido: 'Tu perro tira porque funciona: le lleva a donde quiere ir. Cada vez que caminas cuando tira, refuerzas el tirón.', tip: 'Nunca avances cuando la correa esté tensa.', duracion: '5 min' },
      { titulo: 'El Árbol', contenido: 'Cuando tire, para completamente como un árbol. Espera a que afloje la correa y te mire. Entonces avanza.', tip: 'Sé paciente. Los primeros paseos serán MUY lentos.', duracion: '8 min' },
      { titulo: 'Premia la Posición', contenido: 'Cada vez que camine a tu lado con correa floja, di "Sí" y dale un premio. Premia frecuentemente al principio.', tip: 'Usa premios de alto valor en el paseo.', duracion: '10 min' },
      { titulo: 'Distracciones', contenido: 'Cuando vea algo interesante, llámalo antes de que tire. Prémialo por mirarte y luego déjale investigar como recompensa.', tip: 'El acceso al olor es un premio muy valioso.', duracion: '7 min' }
    ],
    erroresComunes: ['Tirar de la correa hacia atrás', 'Usar correa extensible', 'No ser consistente', 'Paseos demasiado largos al principio'],
    ejercicioPractico: 'Haz un paseo de 10 minutos usando la técnica del árbol. Cuenta cuántas veces paras.'
  },
  'estres-canino': {
    id: 'estres-canino',
    titulo: 'Entender el Estrés Canino',
    subtitulo: 'Señales, causas y soluciones',
    nivel: 'Todos',
    duracion: '15 min',
    xp: 20,
    huesos: 8,
    imagen: 'https://images.unsplash.com/photo-1537151625747-768eb6cf92b2?w=800',
    descripcion: 'Aprende a reconocer cuando tu perro está estresado y qué puedes hacer al respecto.',
    objetivos: ['Identificar señales de estrés', 'Conocer causas comunes', 'Aplicar técnicas calmantes', 'Prevenir estrés crónico'],
    pasos: [
      { titulo: 'Señales de Estrés', contenido: 'Lamerse los labios, bostezar, sacudirse, rascarse, jadear (sin calor), cola baja, orejas hacia atrás, evitar mirada.', tip: 'Una señal sola puede ser normal. Varias juntas indican estrés.', duracion: '4 min' },
      { titulo: 'Causas Comunes', contenido: 'Falta de ejercicio, sobreestimulación, cambios en rutina, ruidos fuertes, estar solo mucho tiempo, visitas al veterinario.', tip: 'Lleva un diario para identificar patrones de estrés.', duracion: '4 min' },
      { titulo: 'Qué Hacer', contenido: 'Aleja a tu perro del estresor, dale espacio, no le fuerces, usa premios para crear asociaciones positivas.', tip: 'Tu calma se contagia. Si estás tenso, él lo notará.', duracion: '4 min' },
      { titulo: 'Prevención', contenido: 'Rutinas predecibles, ejercicio diario, estimulación mental, lugar seguro en casa, descanso adecuado.', tip: 'Un perro descansado maneja mejor el estrés.', duracion: '3 min' }
    ],
    erroresComunes: ['Ignorar señales sutiles', 'Forzar al perro a enfrentar sus miedos', 'Castigar comportamientos de estrés', 'No dar suficiente descanso'],
    ejercicioPractico: 'Observa a tu perro durante 10 minutos. Anota cualquier señal de estrés que veas.'
  },
  'relajacion': {
    id: 'relajacion',
    titulo: 'Técnicas de Relajación',
    subtitulo: 'Calma y paz para tu perro',
    nivel: 'Todos',
    duracion: '25 min',
    xp: 30,
    huesos: 10,
    imagen: 'https://images.unsplash.com/photo-1517849845537-4d257902454a?w=800',
    descripcion: 'Ejercicios específicos para ayudar a tu perro a relajarse y encontrar la calma.',
    objetivos: ['Enseñar a relajarse a la orden', 'Crear rutinas calmantes', 'Usar el tacto para calmar', 'Establecer un lugar tranquilo'],
    pasos: [
      { titulo: 'El Tapete de Calma', contenido: 'Elige un tapete específico. Cada vez que tu perro se tumbe en él y esté tranquilo, dale premios suavemente.', tip: 'Este tapete viajará contigo y será su "zona de calma" en cualquier lugar.', duracion: '7 min' },
      { titulo: 'Masaje Relajante', contenido: 'Con movimientos lentos y suaves, masajea desde la cabeza hacia la cola. Usa presión ligera y constante.', tip: 'Hazlo cuando ya esté tranquilo para asociar el tacto con la calma.', duracion: '6 min' },
      { titulo: 'Respiración Sincronizada', contenido: 'Túmbate junto a tu perro y respira profunda y lentamente. Los perros sincronizan su respiración con la nuestra.', tip: 'Esto también te relajará a ti.', duracion: '6 min' },
      { titulo: 'Música Calmante', contenido: 'Pon música clásica o diseñada para perros a volumen bajo. Úsala consistentemente en momentos de calma.', tip: 'Spotify tiene playlists específicas para relajación canina.', duracion: '6 min' }
    ],
    erroresComunes: ['Practicar solo cuando está estresado', 'Movimientos demasiado rápidos', 'Esperar resultados inmediatos', 'No ser consistente'],
    ejercicioPractico: 'Haz una sesión de 5 minutos de tapete de calma con tu perro hoy.'
  },
  'lugar-seguro': {
    id: 'lugar-seguro',
    titulo: 'El Lugar Seguro',
    subtitulo: 'Crear un refugio para tu perro',
    nivel: 'Básico',
    duracion: '20 min',
    xp: 25,
    huesos: 10,
    imagen: 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=800',
    descripcion: 'Todo perro necesita un lugar donde sentirse completamente seguro y tranquilo.',
    objetivos: ['Elegir el lugar ideal', 'Hacer el espacio atractivo', 'Enseñar a usarlo', 'Respetar su refugio'],
    pasos: [
      { titulo: 'Elegir el Lugar', contenido: 'Busca un rincón tranquilo, alejado del tráfico de la casa, pero donde pueda verte. Puede ser un transportín abierto o una cama en esquina.', tip: 'No lo pongas en zonas de paso o cerca de ventanas ruidosas.', duracion: '5 min' },
      { titulo: 'Hacerlo Atractivo', contenido: 'Añade su cama favorita, una manta con tu olor, y deja ahí sus juguetes de morder seguros.', tip: 'Rocía con feromonas calmantes (Adaptil) si es necesario.', duracion: '5 min' },
      { titulo: 'Asociación Positiva', contenido: 'Esconde premios en su lugar seguro. Dale kongs rellenos ahí. Nunca lo llames desde ahí para algo negativo.', tip: 'Que descubra que cosas buenas aparecen en ese lugar.', duracion: '5 min' },
      { titulo: 'Regla de Oro', contenido: 'Cuando esté en su lugar seguro, NADIE le molesta. Ni niños, ni visitas, ni tú para abrazarle. Es SU espacio sagrado.', tip: 'Enseña esta regla a toda la familia.', duracion: '5 min' }
    ],
    erroresComunes: ['Usar el lugar como castigo', 'Molestarle cuando está ahí', 'Ubicación en zona de mucho tráfico', 'No respetar su espacio'],
    ejercicioPractico: 'Prepara el lugar seguro de tu perro y esconde 5 premios para que los descubra.'
  },
  'desensibilizacion': {
    id: 'desensibilizacion',
    titulo: 'Desensibilización',
    subtitulo: 'Reducir miedos y reactividad',
    nivel: 'Avanzado',
    duracion: '30 min',
    xp: 35,
    huesos: 15,
    imagen: 'https://images.unsplash.com/photo-1544568100-847a948585b9?w=800',
    descripcion: 'Técnica científica para reducir gradualmente la respuesta de miedo o reactividad.',
    objetivos: ['Entender la técnica', 'Identificar umbrales', 'Aplicar correctamente', 'Medir progreso'],
    pasos: [
      { titulo: 'El Concepto', contenido: 'Exponer gradualmente al perro al estímulo temido a una intensidad tan baja que no provoque miedo, mientras se asocia con cosas positivas.', tip: 'La clave es que NUNCA llegue a asustarse durante el proceso.', duracion: '7 min' },
      { titulo: 'Encontrar el Umbral', contenido: 'El umbral es la distancia o intensidad donde tu perro nota el estímulo pero aún puede comer premios y responder a ti.', tip: 'Si no come, estás demasiado cerca. Aléjate.', duracion: '8 min' },
      { titulo: 'Sesiones de Trabajo', contenido: 'En el umbral, presenta el estímulo y da premios continuamente. Retira el estímulo y para los premios. Repite.', tip: 'Estímulo = premios. Sin estímulo = nada. Esto crea asociación positiva.', duracion: '8 min' },
      { titulo: 'Progreso Gradual', contenido: 'Solo reduce la distancia o aumenta la intensidad cuando veas que tu perro está relajado en el nivel actual.', tip: 'Es mejor ir demasiado lento que demasiado rápido.', duracion: '7 min' }
    ],
    erroresComunes: ['Ir demasiado rápido', 'Exponer a intensidad que causa miedo', 'No premiar suficiente', 'Sesiones demasiado largas'],
    ejercicioPractico: 'Identifica un miedo de tu perro y encuentra su umbral (la distancia donde puede comer premios).'
  },
  'rutinas-calmantes': {
    id: 'rutinas-calmantes',
    titulo: 'Rutinas Calmantes',
    subtitulo: 'Paz y estructura diaria',
    nivel: 'Todos',
    duracion: '20 min',
    xp: 25,
    huesos: 10,
    imagen: 'https://images.unsplash.com/photo-1518717758536-85ae29035b6d?w=800',
    descripcion: 'Establecer rutinas predecibles ayuda a tu perro a sentirse seguro y reduce la ansiedad.',
    objetivos: ['Crear horarios consistentes', 'Incluir tiempo de calma', 'Equilibrar actividad y descanso', 'Señales de transición'],
    pasos: [
      { titulo: 'Horarios Predecibles', contenido: 'Comidas, paseos y tiempo de juego a las mismas horas cada día. La predictibilidad reduce la ansiedad.', tip: 'Usa alarmas en tu teléfono para mantener consistencia.', duracion: '5 min' },
      { titulo: 'Tiempo de Calma Obligatorio', contenido: 'Después de actividad, guía a tu perro a su lugar tranquilo. Dale algo para morder (kong, hueso) y déjalo descansar.', tip: 'Muchos problemas de conducta son por falta de descanso.', duracion: '5 min' },
      { titulo: 'La Regla 1-1-1', contenido: 'Por cada hora de actividad intensa, necesita al menos 1 hora de calma activa (morder) y 1 hora de sueño.', tip: 'Los cachorros necesitan hasta 18-20 horas de sueño al día.', duracion: '5 min' },
      { titulo: 'Transiciones Suaves', contenido: 'Usa palabras consistentes para transiciones: "Hora de descansar", "Vamos a pasear", "Hora de comer".', tip: 'Las palabras predecibles reducen la incertidumbre.', duracion: '5 min' }
    ],
    erroresComunes: ['Horarios caóticos', 'No incluir tiempo de descanso', 'Sobreestimular al perro', 'Actividad justo antes de dormir'],
    ejercicioPractico: 'Escribe la rutina ideal para tu perro incluyendo horas de comida, paseo, juego y descanso.'
  },
  'bienvenido-casa': {
    id: 'bienvenido-casa',
    titulo: 'Bienvenido a Casa',
    subtitulo: 'El primer día con tu cachorro',
    nivel: 'Cachorros',
    duracion: '15 min',
    xp: 20,
    huesos: 8,
    imagen: 'https://images.unsplash.com/photo-1591160690555-5debfba289f0?w=800',
    descripcion: 'Cómo hacer que el primer día de tu cachorro en casa sea positivo y sin estrés.',
    objetivos: ['Preparar la casa', 'Primera noche tranquila', 'Establecer rutinas desde el inicio', 'Crear vínculo seguro'],
    pasos: [
      { titulo: 'Preparación', contenido: 'Ten listo: cama, comedero, bebedero, juguetes seguros, empapadores, transportín. Retira cables y objetos peligrosos.', tip: 'Limita el espacio inicial a 1-2 habitaciones.', duracion: '4 min' },
      { titulo: 'Llegada a Casa', contenido: 'Llévalo directamente al área donde hará sus necesidades. Cuando haga, ¡fiesta de premios! Luego explora la casa tranquilamente.', tip: 'Mantén la calma. Tu energía se contagia.', duracion: '4 min' },
      { titulo: 'Primera Noche', contenido: 'Pon su cama cerca de ti las primeras noches. Un reloj con tictac y una botella de agua tibia simulan a su madre.', tip: 'Si llora, no le ignores completamente. Tranquilízalo brevemente.', duracion: '4 min' },
      { titulo: 'Primeras 48 horas', contenido: 'Minimiza visitas, ruidos fuertes y cambios. Deja que se adapte gradualmente. Muchas siestas son normales y necesarias.', tip: 'No lo presentes a todos tus amigos el primer día.', duracion: '3 min' }
    ],
    erroresComunes: ['Demasiada estimulación el primer día', 'Dejarlo solo la primera noche', 'Presentarlo a muchas personas', 'No supervisar constantemente'],
    ejercicioPractico: 'Haz una lista de verificación de todo lo que necesitas antes de traer al cachorro a casa.'
  },
  'inhibicion-mordisco': {
    id: 'inhibicion-mordisco',
    titulo: 'Inhibición del Mordisco',
    subtitulo: 'Boca suave y control',
    nivel: 'Cachorros',
    duracion: '25 min',
    xp: 30,
    huesos: 12,
    imagen: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=800',
    descripcion: 'Enseña a tu cachorro a tener una boca suave. Esto es crucial para su seguridad y la de otros.',
    objetivos: ['Entender por qué muerden', 'Reducir la fuerza del mordisco', 'Redirigir a objetos apropiados', 'Prevenir mordiscos adultos'],
    pasos: [
      { titulo: 'Por Qué Muerden', contenido: 'Los cachorros exploran el mundo con la boca. También les duelen las encías por los dientes nuevos. Es normal, pero hay que enseñar límites.', tip: 'NUNCA castigues físicamente. Empeora el problema.', duracion: '5 min' },
      { titulo: 'El Grito', contenido: 'Cuando muerda fuerte, di "¡AY!" agudo y retira la mano. Espera 5 segundos y continúa jugando. Repite.', tip: 'El grito imita lo que haría otro cachorro.', duracion: '7 min' },
      { titulo: 'Redirigir', contenido: 'Ten siempre un juguete de morder a mano. Cuando vaya a morderte, mete el juguete en su boca y felicítalo por morderlo.', tip: 'Juguetes fríos alivian el dolor de encías.', duracion: '7 min' },
      { titulo: 'Time-Out', contenido: 'Si sigue mordiendo después del grito, levántate y sal de la habitación 30 segundos. Aprende que morder = fin del juego.', tip: 'Sé consistente. Toda la familia debe hacer lo mismo.', duracion: '6 min' }
    ],
    erroresComunes: ['Jugar con las manos directamente', 'Gritar enfadado en vez de agudo', 'No redirigir a juguetes', 'Inconsistencia entre personas'],
    ejercicioPractico: 'Practica el "¡AY!" y redirige 5 veces durante el juego con tu cachorro hoy.'
  },
  'necesidades': {
    id: 'necesidades',
    titulo: 'Entrenamiento de Baño',
    subtitulo: 'Enseñar dónde hacer sus necesidades',
    nivel: 'Cachorros',
    duracion: '25 min',
    xp: 30,
    huesos: 12,
    imagen: 'https://images.unsplash.com/photo-1552053831-71594a27632d?w=800',
    descripcion: 'Guía completa para enseñar a tu cachorro a hacer sus necesidades en el lugar correcto.',
    objetivos: ['Establecer rutina de baño', 'Reconocer señales', 'Prevenir accidentes', 'Manejar errores correctamente'],
    pasos: [
      { titulo: 'La Rutina', contenido: 'Llévalo al mismo sitio: al despertar, después de comer, después de jugar, antes de dormir, y cada 2 horas entre medio.', tip: 'Los cachorros pueden aguantar 1 hora por mes de edad + 1.', duracion: '6 min' },
      { titulo: 'Celebra el Éxito', contenido: 'Cuando haga en el lugar correcto, ¡fiesta! Premios, caricias, voz alegre. Hazlo INMEDIATAMENTE después.', tip: 'No esperes a entrar en casa para premiar.', duracion: '6 min' },
      { titulo: 'Señales de Aviso', contenido: 'Olfatear el suelo, dar vueltas, inquietud, ir hacia la puerta. Cuando veas esto, ¡corre al lugar de baño!', tip: 'Conocer las señales previene accidentes.', duracion: '6 min' },
      { titulo: 'Accidentes', contenido: 'Si lo pillas haciéndolo dentro, interrumpe con "¡Eh!" y llévalo fuera. Si ya terminó, NO le riñas. Limpia con enzimático.', tip: 'Castigar después del hecho solo crea miedo y confusión.', duracion: '7 min' }
    ],
    erroresComunes: ['Castigar accidentes descubiertos después', 'No limpiar con limpiador enzimático', 'Horarios inconsistentes', 'No supervisar suficiente'],
    ejercicioPractico: 'Crea un horario de baño para tu cachorro y síguelo estrictamente por 3 días.'
  },
  'quedarse-solo': {
    id: 'quedarse-solo',
    titulo: 'Quedarse Solo',
    subtitulo: 'Prevenir la ansiedad por separación',
    nivel: 'Cachorros',
    duracion: '25 min',
    xp: 30,
    huesos: 12,
    imagen: 'https://images.unsplash.com/photo-1518717758536-85ae29035b6d?w=800',
    descripcion: 'Enseña a tu cachorro a estar tranquilo cuando te vas. La prevención es clave.',
    objetivos: ['Crear independencia gradual', 'Despedidas y llegadas neutras', 'Señales de calma', 'Enriquecimiento cuando está solo'],
    pasos: [
      { titulo: 'Independencia en Casa', contenido: 'Aunque estés en casa, deja que pase tiempo solo en otra habitación. Usa barreras para bebés. Premia la calma.', tip: 'No lo lleves contigo a todas partes de la casa.', duracion: '6 min' },
      { titulo: 'Despedidas Neutras', contenido: 'No hagas drama al irte. Sin despedidas largas ni "pobrecito". Simplemente vete. Lo mismo al llegar: saluda calmadamente.', tip: 'El drama aumenta la ansiedad.', duracion: '6 min' },
      { titulo: 'Ausencias Graduales', contenido: 'Empieza dejándolo solo 1 minuto, luego 2, 5, 10... Vuelve ANTES de que se estrese. Aumenta muy gradualmente.', tip: 'Es mejor 10 ausencias cortas que 1 larga.', duracion: '7 min' },
      { titulo: 'Enriquecimiento', contenido: 'Deja kongs rellenos, juguetes puzzle, radio a bajo volumen. Que asocie tu ausencia con cosas buenas.', tip: 'Dale el kong especial SOLO cuando te vas.', duracion: '6 min' }
    ],
    erroresComunes: ['Despedidas dramáticas', 'Volver cuando llora (refuerza el llanto)', 'Aumentar el tiempo demasiado rápido', 'No practicar antes de necesitarlo'],
    ejercicioPractico: 'Practica 5 salidas de 1 minuto hoy. Sal, cierra la puerta, espera en silencio, vuelve.'
  },
  'ventana-socializacion': {
    id: 'ventana-socializacion',
    titulo: 'La Ventana de Socialización',
    subtitulo: 'Períodos críticos del desarrollo',
    nivel: 'Cachorros',
    duracion: '15 min',
    xp: 20,
    huesos: 8,
    imagen: 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=800',
    descripcion: 'Aprende sobre la ventana crítica de socialización y cómo aprovecharla.',
    objetivos: ['Entender los períodos críticos', 'Planificar exposiciones', 'Calidad sobre cantidad', 'Qué hacer si ya pasó'],
    pasos: [
      { titulo: 'La Ventana', contenido: 'Entre las 3-14 semanas es cuando el cerebro del cachorro está más receptivo a nuevas experiencias. Lo que viva ahora le marcará.', tip: 'Esto no significa exponerle a todo. Calidad > cantidad.', duracion: '4 min' },
      { titulo: 'Lista de Socialización', contenido: 'Personas (niños, mayores, uniformes), animales, superficies, sonidos, lugares, objetos (paraguas, bicis).', tip: 'Busca "lista de socialización cachorro" para una checklist completa.', duracion: '4 min' },
      { titulo: 'Cómo Hacerlo', contenido: 'Cada experiencia debe ser POSITIVA. Observa, no fuerces. Premio por curiosidad y calma. Retírate si muestra miedo.', tip: 'Una mala experiencia puede causar miedo de por vida.', duracion: '4 min' },
      { titulo: 'Después de la Ventana', contenido: 'Si tu perro es mayor, aún puedes socializar, pero será más lento. Usa desensibilización y contra-condicionamiento.', tip: 'Nunca es tarde, solo requiere más paciencia.', duracion: '3 min' }
    ],
    erroresComunes: ['Esperar a tener todas las vacunas para salir', 'Forzar interacciones', 'Exponer a demasiadas cosas', 'No premiar durante las experiencias'],
    ejercicioPractico: 'Haz una lista de 5 cosas que tu cachorro aún no ha experimentado positivamente.'
  },
  'presentaciones-perros': {
    id: 'presentaciones-perros',
    titulo: 'Presentaciones Seguras',
    subtitulo: 'Conocer otros perros correctamente',
    nivel: 'Intermedio',
    duracion: '25 min',
    xp: 30,
    huesos: 12,
    imagen: 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=800',
    descripcion: 'Aprende a presentar a tu perro con otros perros de forma segura y positiva.',
    objetivos: ['Leer el lenguaje corporal canino', 'Hacer presentaciones en paralelo', 'Identificar señales de estrés', 'Saber cuándo separar'],
    pasos: [
      { titulo: 'Antes del Encuentro', contenido: 'Elige un espacio neutral (no el parque habitual). Ambos perros con correa floja. Mantén distancia inicial de 5-10 metros.', tip: 'Nunca presentes perros en casa de uno de ellos. El territorio genera conflicto.', duracion: '6 min' },
      { titulo: 'Caminata Paralela', contenido: 'Camina en la misma dirección con el otro perro a 3-4 metros de distancia. Premia la calma. Gradualmente reduce distancia.', tip: 'Caminar juntos crea vínculo sin la presión del cara a cara.', duracion: '7 min' },
      { titulo: 'El Primer Contacto', contenido: 'Cuando ambos estén relajados, permite un olfateo breve (3 segundos). Llama a tu perro y prémialo. Repite.', tip: 'Los olfateos deben ser cortos. Los largos generan tensión.', duracion: '6 min' },
      { titulo: 'Señales de Alerta', contenido: 'Pelo erizado, cola rígida, mirada fija, gruñido, labios tensos. Si ves estas señales, aumenta distancia inmediatamente.', tip: 'Mejor prevenir que lamentar. Separa antes de que escale.', duracion: '6 min' }
    ],
    erroresComunes: ['Presentar cara a cara', 'Correa tensa (transmite tu estrés)', 'Dejar que un perro acose al otro', 'No intervenir ante señales de estrés'],
    ejercicioPractico: 'Practica una caminata paralela con un perro conocido y tranquilo.'
  },
  'interaccion-humanos': {
    id: 'interaccion-humanos',
    titulo: 'Interacción con Humanos',
    subtitulo: 'Saludos apropiados con personas',
    nivel: 'Básico',
    duracion: '20 min',
    xp: 25,
    huesos: 10,
    imagen: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=800',
    descripcion: 'Enseña a tu perro a saludar personas de forma educada sin saltar ni abalanzarse.',
    objetivos: ['Saludar sin saltar', 'Aceptar caricias correctamente', 'Respetar el espacio personal', 'Manejar la excitación'],
    pasos: [
      { titulo: 'La Regla de Oro', contenido: 'Tu perro solo recibe atención cuando tiene las 4 patas en el suelo. Si salta, la persona se da la vuelta e ignora.', tip: 'Toda la familia y visitantes deben seguir esta regla.', duracion: '5 min' },
      { titulo: 'El Sentado Automático', contenido: 'Practica: cuando alguien se acerca, pide sentado. La persona solo saluda si está sentado. Si se levanta, la persona se aleja.', tip: 'Haz que sentarse sea más rentable que saltar.', duracion: '5 min' },
      { titulo: 'Caricias Correctas', contenido: 'Enseña a las personas a acariciar por el pecho o lateral, no por encima de la cabeza. Deja que el perro inicie el contacto.', tip: 'La regla de los 3 segundos: acaricia 3 segundos, para, y ve si pide más.', duracion: '5 min' },
      { titulo: 'Niños y Personas Especiales', contenido: 'Con niños, siempre supervisión directa. Enseña a los niños a ser suaves. Con personas con miedo, mantén distancia y no fuerces.', tip: 'Los niños nunca deben acercarse a un perro dormido o comiendo.', duracion: '5 min' }
    ],
    erroresComunes: ['Permitir que salte "porque es cariñoso"', 'Dejar que extraños lo acaricien sin consentimiento del perro', 'No supervisar con niños', 'Gritar cuando salta (le excita más)'],
    ejercicioPractico: 'Practica el saludo sentado con 3 personas diferentes hoy.'
  },
  'nuevos-entornos': {
    id: 'nuevos-entornos',
    titulo: 'Nuevos Entornos',
    subtitulo: 'Explorar con confianza',
    nivel: 'Intermedio',
    duracion: '25 min',
    xp: 30,
    huesos: 12,
    imagen: 'https://images.unsplash.com/photo-1558929996-da64ba858215?w=800',
    descripcion: 'Cómo introducir a tu perro a nuevos lugares de forma gradual y positiva.',
    objetivos: ['Preparar salidas a nuevos lugares', 'Leer las señales de tu perro', 'Usar premios estratégicamente', 'Crear experiencias positivas'],
    pasos: [
      { titulo: 'Planificación', contenido: 'Elige un lugar nuevo pero no abrumador. Ve en horario tranquilo. Lleva premios de alto valor y agua.', tip: 'Mejor un paseo corto positivo que uno largo estresante.', duracion: '6 min' },
      { titulo: 'Llegada al Lugar', contenido: 'Aparca lejos y camina hacia el lugar. Observa a tu perro. Si muestra estrés, mantén distancia y premia la calma.', tip: 'Deja que tu perro observe antes de entrar.', duracion: '7 min' },
      { titulo: 'Exploración Guiada', contenido: 'Deja que olfatee libremente (con correa larga). Premia cada interacción positiva con el entorno. No le arrastres hacia nada.', tip: 'Olfatear es la forma natural del perro de procesar información.', duracion: '7 min' },
      { titulo: 'Salida Positiva', contenido: 'Sal del lugar ANTES de que tu perro se estrese. Termina siempre en positivo. La última experiencia es la que más recuerda.', tip: 'Mejor salir con ganas de más que agotado y estresado.', duracion: '5 min' }
    ],
    erroresComunes: ['Ir a lugares muy estimulantes al principio', 'Forzar al perro a acercarse', 'Sesiones demasiado largas', 'No llevar premios suficientes'],
    ejercicioPractico: 'Visita un lugar nuevo con tu perro por 10 minutos, premiando toda interacción positiva.'
  },
  'sonidos-estimulos': {
    id: 'sonidos-estimulos',
    titulo: 'Sonidos y Estímulos',
    subtitulo: 'Habituación gradual al ruido',
    nivel: 'Intermedio',
    duracion: '20 min',
    xp: 25,
    huesos: 10,
    imagen: 'https://images.unsplash.com/photo-1537151625747-768eb6cf92b2?w=800',
    descripcion: 'Ayuda a tu perro a acostumbrarse a sonidos cotidianos y reducir el miedo al ruido.',
    objetivos: ['Identificar sonidos problemáticos', 'Aplicar desensibilización', 'Crear asociaciones positivas', 'Manejar tormentas y petardos'],
    pasos: [
      { titulo: 'Identifica los Miedos', contenido: 'Haz una lista de sonidos que asustan a tu perro: truenos, petardos, aspiradora, timbre, coches, etc.', tip: 'Observa su reacción: orejas atrás, temblar, esconderse, jadear.', duracion: '5 min' },
      { titulo: 'Grabaciones a Bajo Volumen', contenido: 'Busca en YouTube grabaciones del sonido. Ponlo a volumen MUY bajo mientras tu perro come o juega con su juguete favorito.', tip: 'Si deja de comer, el volumen es demasiado alto.', duracion: '5 min' },
      { titulo: 'Sube Gradualmente', contenido: 'Cada sesión sube ligeramente el volumen. Solo aumenta si en el nivel actual está completamente relajado.', tip: 'Este proceso puede llevar semanas. La paciencia es clave.', duracion: '5 min' },
      { titulo: 'En la Vida Real', contenido: 'Cuando escuche el sonido real, actúa normal. Dale premios calmadamente. Nunca lo consueles con voz aguda (confirma que hay peligro).', tip: 'Tu calma es contagiosa. Si estás tranquilo, él aprenderá que no hay peligro.', duracion: '5 min' }
    ],
    erroresComunes: ['Empezar con volumen alto', 'Forzar la exposición', 'Consolar con voz aguda y ansiosa', 'No ser consistente con las sesiones'],
    ejercicioPractico: 'Pon una grabación de truenos a volumen bajo durante 5 minutos mientras tu perro come.'
  },
  'parque-canino': {
    id: 'parque-canino',
    titulo: 'El Parque Canino',
    subtitulo: 'Juego social seguro',
    nivel: 'Avanzado',
    duracion: '30 min',
    xp: 35,
    huesos: 15,
    imagen: 'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=800',
    descripcion: 'Guía completa para usar parques caninos de forma segura y beneficiosa.',
    objetivos: ['Evaluar si el parque es seguro', 'Supervisar el juego activamente', 'Intervenir cuando sea necesario', 'Saber cuándo irse'],
    pasos: [
      { titulo: 'Antes de Entrar', contenido: 'Observa desde fuera: ¿cuántos perros hay? ¿Están jugando bien? ¿Los dueños están atentos? Si algo no te convence, no entres.', tip: 'Mejor ir cuando hay pocos perros, especialmente las primeras veces.', duracion: '7 min' },
      { titulo: 'La Entrada', contenido: 'Entra con correa puesta. Suelta cuando estés dentro y el ambiente sea calmado. Quédate cerca para intervenir si es necesario.', tip: 'No entres si tu perro está sobre-excitado. Espera a que se calme.', duracion: '8 min' },
      { titulo: 'Supervisión Activa', contenido: 'NO uses el móvil. Observa constantemente. Juego sano: se turnan persiguiéndose, pausas voluntarias, lenguaje corporal relajado.', tip: 'Si un perro siempre persigue y el otro siempre huye, no es buen juego.', duracion: '8 min' },
      { titulo: 'Cuándo Irse', contenido: 'Sal si: hay un perro agresivo, tu perro está estresado, la energía del grupo es caótica, o después de 20-30 minutos máximo.', tip: 'Es mejor irse pronto y que quiera volver que quedarse demasiado.', duracion: '7 min' }
    ],
    erroresComunes: ['No supervisar activamente', 'Llevar comida al parque (causa peleas)', 'Dejar que un perro acose al tuyo', 'Quedarse demasiado tiempo'],
    ejercicioPractico: 'Visita un parque canino y observa desde fuera 10 minutos. Identifica juego sano vs juego problemático.'
  },
  'rutina-cachorro': {
    id: 'rutina-cachorro',
    titulo: 'Rutina del Cachorro',
    subtitulo: 'Horarios y hábitos saludables',
    nivel: 'Cachorros',
    duracion: '20 min',
    xp: 25,
    huesos: 10,
    imagen: 'https://images.unsplash.com/photo-1591160690555-5debfba289f0?w=800',
    descripcion: 'Establece una rutina diaria que ayude a tu cachorro a sentirse seguro y aprender rápido.',
    objetivos: ['Crear un horario diario', 'Equilibrar actividad y descanso', 'Establecer hábitos de alimentación', 'Planificar tiempo de juego y entrenamiento'],
    pasos: [
      { titulo: 'El Horario Básico', contenido: 'Mañana: baño, comida, juego corto, siesta. Mediodía: baño, comida, paseo, siesta. Tarde: juego, entrenamiento, comida, rutina nocturna.', tip: 'Los cachorros necesitan 18-20 horas de sueño al día.', duracion: '5 min' },
      { titulo: 'Alimentación', contenido: 'Cachorros de 2-4 meses: 4 comidas/día. De 4-6 meses: 3 comidas/día. De 6+ meses: 2 comidas/día. Siempre a las mismas horas.', tip: 'Retira la comida después de 15 minutos si no la come. Aprenderá a comer cuando toca.', duracion: '5 min' },
      { titulo: 'Siestas Programadas', contenido: 'Después de cada periodo de actividad (20-30 min), guía al cachorro a su cama o transportín para una siesta obligatoria.', tip: 'Un cachorro sobre-estimulado muerde más y aprende peor.', duracion: '5 min' },
      { titulo: 'Sesiones de Entrenamiento', contenido: '3-5 sesiones de 5 minutos al día. Cortas, divertidas y con muchos premios. Mejor antes de comer (más motivación).', tip: 'Termina siempre con éxito. Si no sale bien, pide algo fácil y premia.', duracion: '5 min' }
    ],
    erroresComunes: ['No dar suficiente descanso', 'Horarios caóticos', 'Sesiones de entrenamiento muy largas', 'No adaptar la rutina a la edad'],
    ejercicioPractico: 'Escribe la rutina diaria de tu cachorro con horarios específicos y cúmplela 3 días.'
  },
  'socializacion-temprana': {
    id: 'socializacion-temprana',
    titulo: 'Socialización Temprana',
    subtitulo: 'Experiencias positivas para cachorros',
    nivel: 'Cachorros',
    duracion: '20 min',
    xp: 25,
    huesos: 10,
    imagen: 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=800',
    descripcion: 'Cómo socializar a tu cachorro de forma segura durante la ventana crítica de desarrollo.',
    objetivos: ['Planificar experiencias positivas', 'Socializar antes de completar vacunas', 'Crear una lista de exposiciones', 'Reconocer señales de estrés en cachorros'],
    pasos: [
      { titulo: 'La Regla 100', contenido: 'En sus primeros 100 días contigo, intenta que conozca: 100 personas diferentes, 100 superficies, 100 experiencias nuevas. Todo POSITIVO.', tip: 'Calidad sobre cantidad. 10 experiencias positivas > 100 estresantes.', duracion: '5 min' },
      { titulo: 'Antes de las Vacunas', contenido: 'Puedes llevarlo en brazos a ver el mundo, invitar personas a casa, exponerle a sonidos, y llevarlo a casas con perros vacunados.', tip: 'Evita suelos donde pasan muchos perros desconocidos hasta completar vacunas.', duracion: '5 min' },
      { titulo: 'Clases de Cachorro', contenido: 'Busca clases de socialización para cachorros (puppy classes). Son supervisadas, con perros de edad similar, y en entorno controlado.', tip: 'Las buenas clases incluyen tiempo de juego supervisado y ejercicios básicos.', duracion: '5 min' },
      { titulo: 'Diario de Socialización', contenido: 'Lleva un diario: anota qué experimentó, su reacción, y si necesita más exposición a algo. Esto te ayuda a planificar.', tip: 'Usa la app para registrar estas experiencias y hacer seguimiento.', duracion: '5 min' }
    ],
    erroresComunes: ['Esperar a tener todas las vacunas', 'Exponer a demasiadas cosas en un día', 'No observar señales de estrés', 'Forzar interacciones'],
    ejercicioPractico: 'Lleva a tu cachorro (en brazos si no tiene vacunas completas) a observar un parque durante 10 minutos.'
  },
  'juego-apropiado': {
    id: 'juego-apropiado',
    titulo: 'Juego Apropiado',
    subtitulo: 'Diversión segura y educativa',
    nivel: 'Cachorros',
    duracion: '20 min',
    xp: 25,
    huesos: 10,
    imagen: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=800',
    descripcion: 'Aprende qué tipos de juego son beneficiosos y cómo jugar de forma que eduque.',
    objetivos: ['Elegir juguetes seguros', 'Juegos que enseñan autocontrol', 'Evitar juegos que fomenten malos hábitos', 'Usar el juego como entrenamiento'],
    pasos: [
      { titulo: 'Juguetes Seguros', contenido: 'Tamaño adecuado (no puede tragarlo), material resistente, sin piezas pequeñas. Rota juguetes para mantener el interés.', tip: 'Los juguetes de morder son para el cachorro. Tus manos NO son juguetes.', duracion: '5 min' },
      { titulo: 'Juegos de Olfato', contenido: 'Esconde premios por la casa o jardín. El olfateo cansa mentalmente y es la forma natural del perro de explorar.', tip: 'Empieza fácil (premios visibles) y aumenta la dificultad.', duracion: '5 min' },
      { titulo: 'Tira y Afloja con Reglas', contenido: 'Tú inicias el juego y tú lo terminas. Practica "suelta" cada 30 segundos. Si los dientes tocan tu piel, el juego para.', tip: 'Este juego enseña autocontrol si se juega con reglas claras.', duracion: '5 min' },
      { titulo: 'Juegos Prohibidos', contenido: 'No juegues a perseguirle (enseña a huir de ti), no animes a morder manos/pies, no juegues brusco (enseña agresividad).', tip: 'Si el juego se descontrola, haz una pausa de 30 segundos.', duracion: '5 min' }
    ],
    erroresComunes: ['Usar manos como juguetes', 'Jugar a perseguir al cachorro', 'No poner límites en el juego', 'Juguetes peligrosos o demasiado pequeños'],
    ejercicioPractico: 'Haz un juego de olfato escondiendo 10 premios por tu casa y deja que tu cachorro los busque.'
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
  const { t, language } = useLanguage();
  const [pasoActual, setPasoActual] = useState(0);
  const [completado, setCompletado] = useState(false);
  const [rewardData, setRewardData] = useState<any>(null);
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [submittingReward, setSubmittingReward] = useState(false);

  const leccion = LECCIONES_DB[id || 'llamada-perfecta'];

  if (!leccion) {
    return (
      <SafeAreaView style={styles.container}>
        <Text>{t('error')}</Text>
      </SafeAreaView>
    );
  }

  const submitReward = async () => {
    setSubmittingReward(true);
    try {
      const token = await SecureStore.getItemAsync('session_token');
      if (!token) return;
      const response = await axios.post(
        `${BACKEND_URL}/api/gamification/add-bones`,
        { amount: leccion.huesos, reason: `Lección: ${leccion.titulo}`, lesson_id: leccion.id },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setRewardData(response.data);
      if (response.data.leveled_up) {
        setShowLevelUp(true);
      }
    } catch (error) {
      console.log('Error submitting reward:', error);
    } finally {
      setSubmittingReward(false);
    }
  };

  const handleSiguiente = () => {
    if (pasoActual < leccion.pasos.length - 1) {
      setPasoActual(pasoActual + 1);
    } else {
      setCompletado(true);
      submitReward();
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
          <Text style={styles.completadoTitulo}>{t('lessonCompleted')}</Text>
          <Text style={styles.completadoSubtitulo}>{leccion.titulo}</Text>
          
          <View style={styles.recompensasRow}>
            <View style={styles.recompensaItem}>
              <Ionicons name="flash" size={32} color={Colors.accent} />
              <Text style={styles.recompensaValor}>+{rewardData?.xp_added || leccion.xp} XP</Text>
            </View>
            <View style={styles.recompensaItem}>
              <Text style={styles.boneEmoji}>🦴</Text>
              <Text style={styles.recompensaValor}>+{rewardData?.bones_added || leccion.huesos}</Text>
            </View>
          </View>

          {/* Level Up notification */}
          {rewardData?.leveled_up && (
            <View style={styles.levelUpBanner} data-testid="level-up-banner">
              <Ionicons name="arrow-up-circle" size={28} color={Colors.accent} />
              <Text style={styles.levelUpText}>{t('levelUp')} {rewardData.level}!</Text>
            </View>
          )}

          {/* New Achievements */}
          {rewardData?.new_achievements && rewardData.new_achievements.length > 0 && (
            <View style={styles.newAchievementsContainer} data-testid="new-achievements">
              <Text style={styles.newAchievementsTitle}>{t('newAchievement')}</Text>
              {rewardData.new_achievements.map((ach: any) => (
                <View key={ach.id} style={styles.achievementItem}>
                  <Ionicons name={ach.icon as any} size={24} color={Colors.accent} />
                  <View style={styles.achievementInfo}>
                    <Text style={styles.achievementName}>{ach.name}</Text>
                    <Text style={styles.achievementDesc}>{ach.description}</Text>
                  </View>
                  <Text style={styles.achievementBones}>+{ach.bones_reward} 🦴</Text>
                </View>
              ))}
            </View>
          )}

          {/* Updated total stats */}
          {rewardData && (
            <View style={styles.totalStatsRow} data-testid="total-stats">
              <View style={styles.totalStatItem}>
                <Text style={styles.totalStatValue}>{rewardData.bones}</Text>
                <Text style={styles.totalStatLabel}>{t('totalBones')}</Text>
              </View>
              <View style={styles.totalStatItem}>
                <Text style={styles.totalStatValue}>{t('level')} {rewardData.level}</Text>
                <Text style={styles.totalStatLabel}>{rewardData.xp} XP</Text>
              </View>
              <View style={styles.totalStatItem}>
                <Ionicons name="flame" size={20} color={Colors.accentOrange} />
                <Text style={styles.totalStatValue}>{rewardData.streak_days}</Text>
                <Text style={styles.totalStatLabel}>{t('days')}</Text>
              </View>
            </View>
          )}

          <Card style={styles.ejercicioCard}>
            <View style={styles.ejercicioHeader}>
              <Ionicons name="fitness" size={24} color={Colors.primary} />
              <Text style={styles.ejercicioTitulo}>{t('practicalExercise')}</Text>
            </View>
            <Text style={styles.ejercicioTexto}>{leccion.ejercicioPractico}</Text>
          </Card>

          <TouchableOpacity style={styles.volverButton} onPress={() => router.back()}>
            <Text style={styles.volverButtonText}>{t('backToEducation')}</Text>
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
            {t('step')} {pasoActual + 1} {t('of')} {leccion.pasos.length}
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
            <Text style={styles.tipLabel}>{t('proTip')}</Text>
            <Text style={styles.tipTexto}>{pasoActualData.tip}</Text>
          </View>
        </View>

        {/* Objetivos en el primer paso */}
        {pasoActual === 0 && (
          <View style={styles.objetivosSection}>
            <Text style={styles.objetivosTitulo}>{t('whatYouWillLearn')}</Text>
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
            <Text style={styles.erroresTitulo}>{t('commonMistakes')}</Text>
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
            <Text style={styles.anteriorButtonText}>{t('previous')}</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.placeholder} />
        )}
        
        <TouchableOpacity style={styles.siguienteButton} onPress={handleSiguiente}>
          <Text style={styles.siguienteButtonText}>
            {pasoActual === leccion.pasos.length - 1 ? t('complete') : t('next')}
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
  levelUpBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.accentLight,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.lg,
    width: '100%',
    justifyContent: 'center',
  },
  levelUpText: {
    fontSize: FontSizes.xl,
    fontWeight: '800',
    color: Colors.accent,
  },
  newAchievementsContainer: {
    width: '100%',
    marginBottom: Spacing.lg,
  },
  newAchievementsTitle: {
    fontSize: FontSizes.lg,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: Spacing.sm,
    textAlign: 'center',
  },
  achievementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.accentLight,
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.sm,
    gap: Spacing.sm,
  },
  achievementInfo: {
    flex: 1,
  },
  achievementName: {
    fontSize: FontSizes.md,
    fontWeight: '700',
    color: Colors.text,
  },
  achievementDesc: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
  },
  achievementBones: {
    fontSize: FontSizes.md,
    fontWeight: '700',
    color: Colors.accent,
  },
  totalStatsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    backgroundColor: Colors.white,
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.lg,
    ...Shadows.sm,
  },
  totalStatItem: {
    alignItems: 'center',
    gap: 2,
  },
  totalStatValue: {
    fontSize: FontSizes.lg,
    fontWeight: '800',
    color: Colors.text,
  },
  totalStatLabel: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
  },
});
