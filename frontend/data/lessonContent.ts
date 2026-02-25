import { Language } from '../contexts/LanguageContext';

export interface LeccionData {
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
  pasos: { titulo: string; contenido: string; tip: string; duracion: string }[];
  erroresComunes: string[];
  ejercicioPractico: string;
}

const LESSONS_ES: Record<string, LeccionData> = {
  'llamada-perfecta': {
    id: 'llamada-perfecta', titulo: 'La Llamada Perfecta', subtitulo: 'Aprende a que tu perro venga siempre que le llames', nivel: 'Intermedio', duracion: '10 min', xp: 50, huesos: 15,
    imagen: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=800',
    descripcion: 'La llamada es uno de los comandos más importantes que puedes enseñar a tu perro. Un perro que viene cuando le llamas está más seguro y tiene más libertad.',
    objetivos: ['Entender por qué tu perro no viene cuando le llamas', 'Crear una asociación positiva con la llamada', 'Practicar en diferentes niveles de distracción', 'Consolidar la respuesta automática'],
    pasos: [
      { titulo: 'Paso 1: La Palabra Mágica', contenido: 'Elige una palabra nueva para la llamada (ej: "Aquí", "Ven", "Come"). No uses su nombre si ya lo has "quemado" llamándole sin recompensa.', tip: 'La palabra debe ser corta, clara y fácil de pronunciar con entusiasmo.', duracion: '2 min' },
      { titulo: 'Paso 2: Asociación Positiva', contenido: 'En casa, sin distracciones, di la palabra y INMEDIATAMENTE dale un premio de alto valor (pollo, queso, salchicha). Repite 10-15 veces.', tip: 'El premio debe llegar en menos de 1 segundo después de la palabra.', duracion: '3 min' },
      { titulo: 'Paso 3: Añade Movimiento', contenido: 'Ahora di la palabra y aléjate corriendo de tu perro de forma divertida. Cuando llegue a ti, ¡fiesta de premios!', tip: 'Huir activa el instinto de persecución. Nunca persigas a tu perro.', duracion: '3 min' },
      { titulo: 'Paso 4: Aumenta Distracción', contenido: 'Practica en el jardín, luego en la calle tranquila, después en el parque. Siempre con correa larga al principio.', tip: 'Si falla en un nivel, vuelve al anterior. No quemes la palabra.', duracion: '2 min' }
    ],
    erroresComunes: ['Llamar para algo negativo (baño, fin del paseo)', 'Perseguir al perro cuando no viene', 'No premiar cuando viene', 'Repetir la palabra muchas veces'],
    ejercicioPractico: 'Practica 15 llamadas en casa hoy, cada una seguida de su premio favorito.'
  },
  'sentado-basico': {
    id: 'sentado-basico', titulo: 'El Sentado Perfecto', subtitulo: 'La base de todo buen entrenamiento', nivel: 'Básico', duracion: '8 min', xp: 30, huesos: 10,
    imagen: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=800',
    descripcion: 'El sentado es la primera señal que todo perro debería aprender. Es la puerta de entrada al mundo del entrenamiento en positivo.',
    objetivos: ['Enseñar el sentado con señuelo', 'Eliminar el señuelo gradualmente', 'Añadir la señal verbal', 'Generalizar en diferentes contextos'],
    pasos: [
      { titulo: 'Señuelo', contenido: 'Toma un premio entre tus dedos. Ponlo en la nariz de tu perro y sube la mano lentamente por encima de su cabeza. Su trasero bajará naturalmente.', tip: 'No empujes su trasero hacia abajo. Deja que la gravedad haga su trabajo.', duracion: '2 min' },
      { titulo: 'Marca y Premia', contenido: 'En el INSTANTE en que su trasero toque el suelo, di "¡Sí!" o usa un clicker, y dale el premio. Repite 10 veces.', tip: 'El timing es clave. Marca en el momento exacto.', duracion: '2 min' },
      { titulo: 'Retira el Señuelo', contenido: 'Haz el mismo movimiento de mano pero SIN premio en la mano. Cuando se siente, premia de la otra mano. Repite hasta que funcione sin señuelo.', tip: 'Si no funciona, vuelve a usar señuelo 5 veces más.', duracion: '2 min' },
      { titulo: 'Añade la Palabra', contenido: 'Cuando ya se siente con el gesto de mano, di "Sit" ANTES del gesto. Pronto asociará la palabra con la acción.', tip: 'Di la palabra una sola vez. No repitas "sit, sit, sit".', duracion: '2 min' }
    ],
    erroresComunes: ['Empujar el trasero del perro', 'Repetir la orden muchas veces', 'No premiar cada vez al principio', 'Sesiones demasiado largas'],
    ejercicioPractico: 'Practica 3 sesiones de 2 minutos hoy en diferentes habitaciones.'
  },
  'tumbado': {
    id: 'tumbado', titulo: 'El Tumbado', subtitulo: 'Posición de calma y control', nivel: 'Básico', duracion: '10 min', xp: 35, huesos: 12,
    imagen: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=800',
    descripcion: 'El tumbado es esencial para enseñar calma y autocontrol. Es la base para comportamientos más avanzados.',
    objetivos: ['Enseñar el tumbado desde sentado', 'Usar la técnica del señuelo correctamente', 'Aumentar la duración del tumbado', 'Añadir la señal verbal y visual'],
    pasos: [
      { titulo: 'Desde Sentado', contenido: 'Con tu perro sentado, lleva un premio desde su nariz hacia el suelo entre sus patas delanteras. Cuando se tumbe, marca y premia.', tip: 'Mueve el premio lentamente. Si se levanta, empieza de nuevo.', duracion: '3 min' },
      { titulo: 'En L', contenido: 'Si no baja, haz una L con el premio: primero hacia abajo y luego hacia ti por el suelo. Esto le invitará a deslizarse hacia abajo.', tip: 'Algunos perros necesitan que deslices el premio bajo una silla.', duracion: '3 min' },
      { titulo: 'Duración', contenido: 'Una vez que se tumbe fácilmente, empieza a esperar 1 segundo antes de premiar, luego 2, luego 3... Construye duración gradualmente.', tip: 'Si se levanta, no le regañes. Simplemente no premies y vuelve a empezar.', duracion: '2 min' },
      { titulo: 'Señal Verbal', contenido: 'Cuando el gesto funcione bien, añade "Tumba" o "Down" ANTES del gesto de mano. La palabra predice el gesto.', tip: 'Usa un tono de voz tranquilo, no autoritario.', duracion: '2 min' }
    ],
    erroresComunes: ['Mover el premio demasiado rápido', 'No premiar la posición final', 'Pedir duración demasiado pronto', 'Frustración si no sale rápido'],
    ejercicioPractico: 'Practica 10 repeticiones del tumbado antes de cada comida.'
  },
  'quieto': {
    id: 'quieto', titulo: 'El Quieto', subtitulo: 'Paciencia y autocontrol canino', nivel: 'Intermedio', duracion: '12 min', xp: 40, huesos: 15,
    imagen: 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=800',
    descripcion: 'El quieto enseña a tu perro a mantener una posición hasta que le liberes. Es fundamental para su seguridad.',
    objetivos: ['Enseñar el concepto de mantener posición', 'Aumentar duración gradualmente', 'Añadir distancia', 'Introducir distracciones'],
    pasos: [
      { titulo: 'Concepto Básico', contenido: 'Con tu perro sentado o tumbado, espera 1 segundo, marca con "¡Sí!" y premia. Repite aumentando medio segundo cada vez.', tip: 'Si se mueve antes de que marques, no premies. Simplemente vuelve a empezar sin enfadarte.', duracion: '3 min' },
      { titulo: 'Palabra de Liberación', contenido: 'Elige una palabra como "Libre" o "Vale" para indicar que puede moverse. Solo premia si espera hasta escuchar esa palabra.', tip: 'La palabra de liberación es tan importante como la de quedarse.', duracion: '3 min' },
      { titulo: 'Añade Distancia', contenido: 'Da un paso atrás. Si mantiene la posición, vuelve, marca y premia. Aumenta gradualmente la distancia.', tip: 'Vuelve siempre a premiar. No le llames hacia ti desde el quieto.', duracion: '3 min' },
      { titulo: 'Distracciones', contenido: 'Empieza a hacer movimientos extraños (agitar brazos, dar un salto). Si mantiene, ¡jackpot de premios!', tip: 'Las 3D: Duración, Distancia, Distracción. Solo aumenta una a la vez.', duracion: '3 min' }
    ],
    erroresComunes: ['Aumentar todo demasiado rápido', 'No usar palabra de liberación', 'Llamar al perro desde el quieto', 'No volver a premiar en posición'],
    ejercicioPractico: 'Practica un quieto de 10 segundos 5 veces antes del paseo de hoy.'
  },
  'control-impulsos': {
    id: 'control-impulsos', titulo: 'Control de Impulsos', subtitulo: 'Autocontrol canino en la vida diaria', nivel: 'Intermedio', duracion: '15 min', xp: 45, huesos: 15,
    imagen: 'https://images.unsplash.com/photo-1537151625747-768eb6cf92b2?w=800',
    descripcion: 'Enseña a tu perro que la paciencia y el autocontrol siempre son recompensados.',
    objetivos: ['Enseñar el juego de "It is your choice"', 'Aplicar autocontrol a la comida', 'Esperar en puertas y antes de paseos', 'Generalizar a la vida cotidiana'],
    pasos: [
      { titulo: 'It Is Your Choice', contenido: 'Pon premios en tu mano abierta. Si tu perro intenta cogerlos, cierra la mano. Cuando se retire, abre la mano y dale uno de la OTRA mano.', tip: 'El perro aprende: alejarse del premio = conseguir el premio.', duracion: '4 min' },
      { titulo: 'Esperar la Comida', contenido: 'Baja el plato de comida lentamente. Si se lanza, sube el plato. Solo llega al suelo si espera sentado.', tip: 'Al principio premia con "libre" cuando el plato esté a medio camino.', duracion: '4 min' },
      { titulo: 'Puertas y Pasos', contenido: 'Antes de abrir la puerta para el paseo, pide un sentado. Si se levanta al tocar el pomo, retira la mano. La puerta solo se abre si está sentado.', tip: 'La puerta es el premio. Tú controlas el acceso.', duracion: '4 min' },
      { titulo: 'En el Mundo Real', contenido: 'Aplica el mismo principio en todas partes: antes de saludar personas, antes de olfatear algo, antes de jugar con otros perros.', tip: 'La vida cotidiana es el mejor campo de entrenamiento.', duracion: '3 min' }
    ],
    erroresComunes: ['Ceder cuando el perro insiste', 'No ser consistente con las reglas', 'Esperar perfección demasiado pronto', 'No premiar los pequeños logros'],
    ejercicioPractico: 'Practica "It is your choice" 10 veces con premios en la mano abierta.'
  },
  'socializacion': {
    id: 'socializacion', titulo: 'Socialización Positiva', subtitulo: 'Crear experiencias positivas', nivel: 'Básico', duracion: '12 min', xp: 35, huesos: 12,
    imagen: 'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=800',
    descripcion: 'La socialización es el proceso de exponer a tu perro a diferentes estímulos de forma positiva y gradual.',
    objetivos: ['Entender qué es socialización real', 'Crear un plan de exposición', 'Reconocer señales de estrés', 'Saber cuándo es demasiado'],
    pasos: [
      { titulo: 'Qué es Socialización', contenido: 'No es simplemente "que conozca otros perros". Es exponer gradualmente a todo tipo de estímulos (personas, sonidos, superficies, objetos) creando experiencias positivas.', tip: 'La calidad importa más que la cantidad.', duracion: '3 min' },
      { titulo: 'Plan de Exposición', contenido: 'Haz una lista de 20 cosas que tu perro necesita conocer. Prioriza las más relevantes para tu vida diaria.', tip: 'Incluye: diferentes personas, perros, sonidos, superficies, vehículos, objetos.', duracion: '3 min' },
      { titulo: 'Señales de Estrés', contenido: 'Aprende a leer: lamerse los labios, bostezar, mirar hacia otro lado, cola baja, orejas hacia atrás, jadeo excesivo.', tip: 'Si ves estas señales, aumenta la distancia al estímulo.', duracion: '3 min' },
      { titulo: 'La Regla del Umbral', contenido: 'Mantén a tu perro por debajo de su umbral de estrés. Si reacciona con miedo o agresividad, estás demasiado cerca del estímulo.', tip: 'El aprendizaje solo ocurre cuando el perro está relajado.', duracion: '3 min' }
    ],
    erroresComunes: ['Forzar interacciones', 'Inundar con estímulos', 'Ignorar señales de estrés', 'Pensar que socialización es solo con otros perros'],
    ejercicioPractico: 'Haz una lista de 10 estímulos nuevos y expón a tu perro a uno de forma positiva hoy.'
  },
  'refuerzo-positivo': {
    id: 'refuerzo-positivo', titulo: 'Refuerzo Positivo', subtitulo: 'La ciencia detrás del entrenamiento', nivel: 'Básico', duracion: '10 min', xp: 30, huesos: 10,
    imagen: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=800',
    descripcion: 'Entiende por qué el refuerzo positivo es el método más efectivo y ético para educar a tu perro.',
    objetivos: ['Entender los principios del aprendizaje', 'Tipos de reforzadores', 'Timing correcto', 'Evitar el castigo'],
    pasos: [
      { titulo: 'Cómo Aprenden los Perros', contenido: 'Los perros repiten comportamientos que les traen consecuencias agradables. Si sentarse le da un premio, se sentará más. Así de simple.', tip: 'Los perros no entienden conceptos morales como "bueno" o "malo".', duracion: '3 min' },
      { titulo: 'Tipos de Premios', contenido: 'Comida (el más efectivo), juego, atención, acceso a cosas (olfatear, salir). Cada perro tiene sus preferencias.', tip: 'Haz una jerarquía de premios: bajo, medio y alto valor.', duracion: '2 min' },
      { titulo: 'Timing', contenido: 'El premio debe llegar dentro de 1-2 segundos del comportamiento. Usa un marcador ("¡Sí!" o clicker) para ser más preciso.', tip: 'El marcador es como tomar una foto del comportamiento correcto.', duracion: '3 min' },
      { titulo: 'Por qué no Castigo', contenido: 'El castigo suprime comportamientos por miedo, no enseña qué hacer, daña la relación y puede generar agresividad.', tip: 'En vez de castigar lo malo, enseña y premia lo bueno.', duracion: '2 min' }
    ],
    erroresComunes: ['Premiar demasiado tarde', 'Usar siempre el mismo premio', 'No adaptar el premio a la dificultad', 'Pensar que el perro sabe qué está mal'],
    ejercicioPractico: 'Haz una lista de los 5 premios favoritos de tu perro, ordenados por valor.'
  },
  'paseo-correa': {
    id: 'paseo-correa', titulo: 'Paseo con Correa', subtitulo: 'Caminar juntos sin tirones', nivel: 'Intermedio', duracion: '15 min', xp: 45, huesos: 15,
    imagen: 'https://images.unsplash.com/photo-1558929996-da64ba858215?w=800',
    descripcion: 'Aprende a pasear con tu perro sin que tire de la correa, convirtiendo el paseo en una experiencia agradable.',
    objetivos: ['Entender por qué tira', 'Técnica del árbol', 'Técnica de cambios de dirección', 'Paseo relajado como objetivo'],
    pasos: [
      { titulo: 'Por qué Tira', contenido: 'Tu perro tira porque funciona: si tira, avanza. Tú le has enseñado sin querer que tirar = llegar al destino.', tip: 'No uses correas retráctiles. Enseñan a tirar.', duracion: '3 min' },
      { titulo: 'Técnica del Árbol', contenido: 'Cuando tire, para completamente como un árbol. No avances ni un paso. Cuando la correa se afloje, marca y avanza (el avance es el premio).', tip: 'Sé paciente. Al principio no avanzaréis mucho.', duracion: '4 min' },
      { titulo: 'Cambios de Dirección', contenido: 'Cuando tire, gira 180° y camina en dirección contraria. Tu perro aprenderá a prestarte atención para anticipar tus movimientos.', tip: 'Hazlo de forma alegre, no como castigo.', duracion: '4 min' },
      { titulo: 'Premia la Posición', contenido: 'Lleva premios y refuerza cada vez que camine a tu lado con la correa floja. Pon nombre a la posición: "Junto" o "Heel".', tip: 'Premia frecuentemente al principio. Cada 3-5 pasos.', duracion: '4 min' }
    ],
    erroresComunes: ['Tirar de la correa de vuelta', 'No ser consistente', 'Paseos demasiado largos sin entrenamiento previo', 'Usar collares de castigo o pinchos'],
    ejercicioPractico: 'Practica 5 minutos de "técnica del árbol" al inicio del paseo de hoy.'
  },
  'estres-canino': {
    id: 'estres-canino', titulo: 'Estrés Canino', subtitulo: 'Identifica y reduce el estrés', nivel: 'Intermedio', duracion: '12 min', xp: 35, huesos: 12,
    imagen: 'https://images.unsplash.com/photo-1537151625747-768eb6cf92b2?w=800',
    descripcion: 'Aprende a identificar las señales de estrés en tu perro y cómo ayudarle a gestionarlo.',
    objetivos: ['Reconocer señales de estrés', 'Identificar desencadenantes', 'Estrategias de reducción', 'Crear un entorno tranquilo'],
    pasos: [
      { titulo: 'Señales Sutiles', contenido: 'Lamerse los labios, bostezar fuera de contexto, sacudirse, mirar hacia otro lado, poner las orejas hacia atrás, jadeo excesivo.', tip: 'Estas señales son la primera alerta. Si las ignoras, escalará.', duracion: '3 min' },
      { titulo: 'Señales Claras', contenido: 'Gruñir, pelo erizado, cola entre las patas, temblar, intentar huir, quedarse paralizado ("shutdown").', tip: 'Si llegas a estas señales, el perro ya está en un nivel alto de estrés.', duracion: '3 min' },
      { titulo: 'Desencadenantes', contenido: 'Haz un diario: ¿cuándo se estresa tu perro? ¿Ruidos? ¿Otros perros? ¿Quedarse solo? ¿Visitas al veterinario?', tip: 'Conocer los desencadenantes es el primer paso para solucionarlos.', duracion: '3 min' },
      { titulo: 'Estrategias', contenido: 'Aumenta la distancia al estímulo, ofrece olfateo (calma el cerebro), usa su lugar seguro, no fuerces situaciones.', tip: 'A veces la mejor solución es simplemente irse.', duracion: '3 min' }
    ],
    erroresComunes: ['Ignorar señales sutiles', 'Forzar al perro a "enfrentar sus miedos"', 'Consolar con voz aguda y ansiosa', 'No buscar ayuda profesional cuando es necesario'],
    ejercicioPractico: 'Observa a tu perro durante 30 minutos y anota todas las señales de calma que muestre.'
  },
  'relajacion': {
    id: 'relajacion', titulo: 'Protocolo de Relajación', subtitulo: 'Enseñar a tu perro a estar tranquilo', nivel: 'Avanzado', duracion: '15 min', xp: 50, huesos: 15,
    imagen: 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=800',
    descripcion: 'El Protocolo de Relajación de Karen Overall enseña a tu perro a relajarse activamente.',
    objetivos: ['Entender el protocolo de relajación', 'Enseñar la posición de calma', 'Aumentar duración y distracciones', 'Aplicar en la vida diaria'],
    pasos: [
      { titulo: 'La Posición', contenido: 'Elige una esterilla o cama. Lleva a tu perro allí y premia SOLO la calma. Tumbado relajado = premio. De pie o sentado tenso = nada.', tip: 'La esterilla se convertirá en su "interruptor de calma".', duracion: '4 min' },
      { titulo: 'Duración', contenido: 'Empieza premiando cada 2 segundos de calma. Gradualmente aumenta los intervalos: 5 seg, 10 seg, 30 seg, 1 min...', tip: 'Si se levanta, simplemente espera. Premia cuando vuelva a relajarse.', duracion: '4 min' },
      { titulo: 'Distracciones', contenido: 'Mientras está relajado, empieza a moverte, hacer ruidos suaves, abrir puertas. Premia si mantiene la calma.', tip: 'Aumenta las distracciones MUY gradualmente.', duracion: '4 min' },
      { titulo: 'Generalización', contenido: 'Lleva la esterilla a otros lugares: terraza, jardín, casa de amigos. Tu perro asociará la esterilla con calma en cualquier lugar.', tip: 'La esterilla portátil es una herramienta increíble para restaurantes, viajes, etc.', duracion: '3 min' }
    ],
    erroresComunes: ['Premiar cuando está tenso', 'Aumentar criterio demasiado rápido', 'No usar la esterilla en la vida real', 'Obligar al perro a quedarse en la esterilla'],
    ejercicioPractico: 'Practica 5 minutos del protocolo de relajación en la esterilla mientras ves la TV.'
  },
  'lugar-seguro': {
    id: 'lugar-seguro', titulo: 'El Lugar Seguro', subtitulo: 'Refugio de calma para tu perro', nivel: 'Básico', duracion: '10 min', xp: 30, huesos: 10,
    imagen: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=800',
    descripcion: 'Crea un espacio donde tu perro se sienta 100% seguro y pueda retirarse cuando necesite tranquilidad.',
    objetivos: ['Elegir el lugar ideal', 'Crear asociaciones positivas', 'Respetar el espacio del perro', 'Usar el lugar seguro correctamente'],
    pasos: [
      { titulo: 'Elegir el Lugar', contenido: 'Observa dónde va tu perro cuando quiere estar tranquilo. Puede ser un rincón, debajo de la mesa, su transportín. Ponle una cama cómoda.', tip: 'El lugar debe estar alejado del tráfico del hogar.', duracion: '3 min' },
      { titulo: 'Asociación Positiva', contenido: 'Deja premios y juguetes especiales en ese lugar. Premia cada vez que tu perro vaya allí voluntariamente. NUNCA le envíes allí como castigo.', tip: 'Los Kongs rellenos y congelados son perfectos para el lugar seguro.', duracion: '3 min' },
      { titulo: 'La Regla de Oro', contenido: 'Cuando tu perro esté en su lugar seguro, NADIE le molesta. Ni niños, ni visitas, ni tú. Es su santuario inviolable.', tip: 'Enseña a toda la familia esta regla.', duracion: '2 min' },
      { titulo: 'Uso Práctico', contenido: 'Guía a tu perro a su lugar seguro antes de eventos estresantes (visitas, tormentas, petardos). Con el tiempo, irá solo.', tip: 'Puedes añadir música relajante para perros.', duracion: '2 min' }
    ],
    erroresComunes: ['Usar el lugar como castigo', 'Molestar al perro cuando está allí', 'Forzar al perro a ir al lugar', 'No respetar el espacio del perro'],
    ejercicioPractico: 'Prepara un lugar seguro con cama cómoda y deja 3 premios sorpresa allí.'
  },
  'desensibilizacion': {
    id: 'desensibilizacion', titulo: 'Desensibilización', subtitulo: 'Superar miedos gradualmente', nivel: 'Avanzado', duracion: '15 min', xp: 50, huesos: 18,
    imagen: 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=800',
    descripcion: 'La desensibilización es la técnica científica para ayudar a tu perro a superar miedos de forma gradual y segura.',
    objetivos: ['Entender la desensibilización', 'Crear un plan de exposición gradual', 'Combinar con contra-condicionamiento', 'Saber cuándo buscar ayuda profesional'],
    pasos: [
      { titulo: 'El Principio', contenido: 'Exponer al perro al estímulo que le da miedo a una intensidad tan baja que NO provoque reacción. Luego aumentar gradualmente.', tip: 'Si el perro reacciona, has ido demasiado rápido. Retrocede.', duracion: '4 min' },
      { titulo: 'El Plan', contenido: 'Identifica el estímulo. Crea 10 niveles de intensidad (de 1=apenas perceptible a 10=nivel real). Trabaja del 1 al 10.', tip: 'Ejemplo con ruidos: empieza con una grabación a volumen 1.', duracion: '4 min' },
      { titulo: 'Contra-condicionamiento', contenido: 'Mientras expones al estímulo de baja intensidad, dale premios de ALTO valor. El estímulo aterrador se convierte en predictor de cosas buenas.', tip: 'El premio debe aparecer SOLO cuando el estímulo está presente.', duracion: '4 min' },
      { titulo: 'Cuándo Pedir Ayuda', contenido: 'Si tu perro tiene reacciones extremas (agresividad, pánico total, autolesión), busca un profesional certificado en comportamiento.', tip: 'Un buen profesional usa métodos basados en la ciencia, no en la dominancia.', duracion: '3 min' }
    ],
    erroresComunes: ['Ir demasiado rápido', 'Forzar la exposición', 'No ser consistente', 'Intentar solucionar problemas graves sin ayuda profesional'],
    ejercicioPractico: 'Identifica un miedo de tu perro y diseña los 10 niveles de exposición.'
  },
  'rutinas-calmantes': {
    id: 'rutinas-calmantes', titulo: 'Rutinas Calmantes', subtitulo: 'Calma diaria para perro y humano', nivel: 'Básico', duracion: '8 min', xp: 25, huesos: 8,
    imagen: 'https://images.unsplash.com/photo-1537151625747-768eb6cf92b2?w=800',
    descripcion: 'Implementa rutinas diarias que promuevan la calma y reduzcan el estrés de tu perro.',
    objetivos: ['Crear una rutina matutina calmante', 'Implementar actividades de olfateo', 'Establecer momentos de descanso', 'Ritual nocturno de relajación'],
    pasos: [
      { titulo: 'Mañana Tranquila', contenido: 'Empieza el día sin excitación. Deja que tu perro olfatee al salir, no corras hacia el parque. El olfateo matutino calma.', tip: 'Los primeros 5 minutos del día marcan el tono.', duracion: '2 min' },
      { titulo: 'Olfateo Activo', contenido: 'Esparce premios por el jardín o usa un snuffle mat. 15 minutos de olfateo equivalen a 1 hora de paseo en términos de cansancio mental.', tip: 'El olfateo baja la frecuencia cardíaca del perro.', duracion: '2 min' },
      { titulo: 'Momentos de Descanso', contenido: 'Después de cada período de actividad, guía a tu perro a su lugar de descanso. No le estimules constantemente.', tip: 'Los perros necesitan 14-16 horas de descanso al día.', duracion: '2 min' },
      { titulo: 'Ritual Nocturno', contenido: 'Crea una rutina nocturna predecible: último paseo corto, kong relleno en su cama, luces bajas. La previsibilidad calma.', tip: 'La lavanda y la música clásica pueden ayudar a relajar.', duracion: '2 min' }
    ],
    erroresComunes: ['Sobre-estimular al perro constantemente', 'No permitir descanso suficiente', 'Rutinas caóticas e impredecibles', 'Ignorar la importancia del olfateo'],
    ejercicioPractico: 'Implementa un paseo de olfateo de 15 minutos esta tarde (tu perro elige la dirección).'
  },
  'bienvenido-casa': {
    id: 'bienvenido-casa', titulo: 'Bienvenido a Casa', subtitulo: 'Los primeros días del cachorro', nivel: 'Cachorros', duracion: '15 min', xp: 35, huesos: 12,
    imagen: 'https://images.unsplash.com/photo-1591160690555-5debfba289f0?w=800',
    descripcion: 'Guía completa para los primeros días de tu cachorro en casa. Establece las bases para una vida juntos feliz.',
    objetivos: ['Preparar la casa para el cachorro', 'Establecer rutinas desde el día 1', 'Crear un ambiente seguro', 'Evitar errores comunes del primer día'],
    pasos: [
      { titulo: 'Preparación', contenido: 'Antes de que llegue: cama, comedero, bebedero, juguetes de morder, transportín, zona vallada si es posible. Retira peligros.', tip: 'Los cachorros mastican TODO. Cables, zapatos, plantas...', duracion: '4 min' },
      { titulo: 'El Primer Día', contenido: 'Deja que explore a su ritmo. No le agobies con toda la familia a la vez. Ofrece agua, comida, y mucha calma.', tip: 'Es normal que llore la primera noche. Es un bebé en un lugar nuevo.', duracion: '4 min' },
      { titulo: 'Rutina Inmediata', contenido: 'Establece horarios de comida (3-4 veces al día), salidas al baño cada 2 horas, y siestas regulares en su zona segura.', tip: 'Los cachorros necesitan más sueño de lo que piensas.', duracion: '4 min' },
      { titulo: 'La Primera Noche', contenido: 'Pon su cama cerca de ti. Un reloj envuelto en una manta imita el latido de su madre. No le ignores si llora, pero no crees una fiesta.', tip: 'Un peluche con calor y latido puede ayudar mucho.', duracion: '3 min' }
    ],
    erroresComunes: ['Dejarle acceso a toda la casa', 'Demasiadas visitas el primer día', 'No establecer rutinas desde el inicio', 'Ignorar el llanto nocturno completamente'],
    ejercicioPractico: 'Si aún no tienes cachorro, haz una lista de todo lo que necesitas comprar. Si ya lo tienes, revisa que tu casa sea segura.'
  },
  'inhibicion-mordisco': {
    id: 'inhibicion-mordisco', titulo: 'Inhibición del Mordisco', subtitulo: 'Boca suave, cachorro educado', nivel: 'Cachorros', duracion: '12 min', xp: 40, huesos: 12,
    imagen: 'https://images.unsplash.com/photo-1591160690555-5debfba289f0?w=800',
    descripcion: 'Enseña a tu cachorro a controlar la fuerza de su boca. Es la lección más importante que aprenderá.',
    objetivos: ['Entender por qué muerde el cachorro', 'Enseñar la presión adecuada de la boca', 'Redirigir a objetos apropiados', 'Gestionar la fase de dentición'],
    pasos: [
      { titulo: 'Por Qué Muerden', contenido: 'Los cachorros exploran el mundo con la boca. Morder es NORMAL y necesario para su desarrollo. Tu trabajo es enseñar cuánta presión es aceptable.', tip: 'Nunca castigues a un cachorro por morder. Es como castigar a un bebé por agarrar cosas.', duracion: '3 min' },
      { titulo: 'La Técnica del "Ay"', contenido: 'Cuando muerda demasiado fuerte, di "¡AY!" con voz aguda (como un compañero de juego) y retira la mano 3 segundos. Si sigue, levántate y aléjate 30 seg.', tip: 'El objetivo NO es que deje de morder, sino que aprenda a morder suavemente.', duracion: '3 min' },
      { titulo: 'Redirección', contenido: 'Siempre ten un juguete de morder a mano. Cuando muerda tu mano, sustituye por el juguete y premia cuando lo muerda.', tip: 'Ten juguetes en cada habitación para poder redirigir rápidamente.', duracion: '3 min' },
      { titulo: 'Dentición', contenido: 'Entre los 3-6 meses los dientes de leche caen. Dale mordedores congelados (zanahoria, kong con caldo congelado) para aliviar las encías.', tip: 'La dentición puede durar varias semanas. Sé paciente.', duracion: '3 min' }
    ],
    erroresComunes: ['Castigar al cachorro por morder', 'Jugar brusco con las manos', 'No redirigir a juguetes', 'No ser consistente con la técnica'],
    ejercicioPractico: 'Prepara 3 juguetes de morder en diferentes habitaciones para poder redirigir rápidamente.'
  },
  'necesidades': {
    id: 'necesidades', titulo: 'Necesidades Fuera', subtitulo: 'Aprender a hacer fuera de casa', nivel: 'Cachorros', duracion: '12 min', xp: 40, huesos: 12,
    imagen: 'https://images.unsplash.com/photo-1591160690555-5debfba289f0?w=800',
    descripcion: 'Guía paso a paso para enseñar a tu cachorro a hacer sus necesidades en el lugar correcto.',
    objetivos: ['Entender el horario natural del cachorro', 'Crear una rutina de baño efectiva', 'Gestionar accidentes sin castigo', 'Señales de que necesita salir'],
    pasos: [
      { titulo: 'Horario del Cachorro', contenido: 'Los cachorros necesitan salir: al despertar, después de comer, después de jugar, después de dormir, y cada 2 horas como mínimo.', tip: 'Un cachorro de 2 meses aguanta máximo 2 horas. 3 meses = 3 horas.', duracion: '3 min' },
      { titulo: 'El Lugar Designado', contenido: 'Lleva SIEMPRE al mismo sitio. Espera pacientemente (hasta 5 min). Cuando haga, ¡fiesta de premios! No le metas prisa.', tip: 'Algunos perros necesitan caminar un poco antes de encontrar el lugar ideal.', duracion: '3 min' },
      { titulo: 'Gestionar Accidentes', contenido: 'NUNCA regañes ni frotes su nariz en el accidente. Simplemente limpia con enzimático y supervisa mejor la próxima vez.', tip: 'Si le pillas en el acto, llévalo rápidamente al lugar correcto y premia si termina allí.', duracion: '3 min' },
      { titulo: 'Señales', contenido: 'Aprende a leer: olfatear el suelo intensamente, dar vueltas en círculos, ir hacia la puerta, inquietud repentina.', tip: 'Pon una campana en la puerta y enseña al cachorro a tocarla para pedir salir.', duracion: '3 min' }
    ],
    erroresComunes: ['Castigar accidentes', 'No salir con suficiente frecuencia', 'No limpiar con enzimático (el olor invita a repetir)', 'Premiar dentro en vez de fuera'],
    ejercicioPractico: 'Lleva a tu cachorro al lugar designado cada 2 horas hoy y premia cada éxito.'
  },
  'quedarse-solo': {
    id: 'quedarse-solo', titulo: 'Quedarse Solo', subtitulo: 'Independencia sin ansiedad', nivel: 'Cachorros', duracion: '15 min', xp: 45, huesos: 15,
    imagen: 'https://images.unsplash.com/photo-1537151625747-768eb6cf92b2?w=800',
    descripcion: 'Enseña a tu cachorro a estar solo de forma gradual para prevenir la ansiedad por separación.',
    objetivos: ['Entender la ansiedad por separación', 'Enseñar independencia gradual', 'Crear rituales de despedida', 'Enriquecer el tiempo solo'],
    pasos: [
      { titulo: 'Empezar Pequeño', contenido: 'Sal de la habitación 5 segundos. Vuelve sin hacer aspavientos. Aumenta gradualmente: 10 seg, 30 seg, 1 min, 5 min...', tip: 'El truco es volver ANTES de que empiece a estresarse.', duracion: '4 min' },
      { titulo: 'Ritual Aburrido', contenido: 'Las despedidas y llegadas deben ser ABURRIDAS. Nada de "adiós mi amor" ni fiestas al volver. Simplemente sal y vuelve con normalidad.', tip: 'Las despedidas emotivas enseñan que irse es un evento importante.', duracion: '4 min' },
      { titulo: 'Enriquecimiento', contenido: 'Cuando te vayas, deja un Kong relleno congelado, juguetes interactivos, o una actividad de olfateo. Asocia tu salida con cosas geniales.', tip: 'El Kong congelado con mantequilla de cacahuete es tu mejor aliado.', duracion: '4 min' },
      { titulo: 'Señales Previas', contenido: 'Desensibiliza las señales previas: coge las llaves y siéntate, ponte los zapatos y ve la tele. Rompe la asociación llaves=me voy.', tip: 'Practica los rituales de salida sin salir realmente.', duracion: '3 min' }
    ],
    erroresComunes: ['Despedidas emotivas', 'Dejar solo demasiado tiempo demasiado pronto', 'No enriquecer el tiempo solo', 'Castigar destrozos al volver'],
    ejercicioPractico: 'Practica salir de la habitación 10 veces hoy, aumentando el tiempo de 5 seg a 2 min.'
  },
  'ventana-socializacion': {
    id: 'ventana-socializacion', titulo: 'La Ventana de Socialización', subtitulo: 'Períodos críticos del desarrollo', nivel: 'Cachorros', duracion: '15 min', xp: 20, huesos: 8,
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
    id: 'presentaciones-perros', titulo: 'Presentaciones Seguras', subtitulo: 'Conocer otros perros correctamente', nivel: 'Intermedio', duracion: '25 min', xp: 30, huesos: 12,
    imagen: 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=800',
    descripcion: 'Aprende a presentar a tu perro con otros perros de forma segura y positiva.',
    objetivos: ['Leer el lenguaje corporal canino', 'Hacer presentaciones en paralelo', 'Identificar señales de estrés', 'Saber cuándo separar'],
    pasos: [
      { titulo: 'Antes del Encuentro', contenido: 'Elige un espacio neutral. Ambos perros con correa floja. Mantén distancia inicial de 5-10 metros.', tip: 'Nunca presentes perros en casa de uno de ellos.', duracion: '6 min' },
      { titulo: 'Caminata Paralela', contenido: 'Camina en la misma dirección con el otro perro a 3-4 metros de distancia. Premia la calma. Gradualmente reduce distancia.', tip: 'Caminar juntos crea vínculo sin la presión del cara a cara.', duracion: '7 min' },
      { titulo: 'El Primer Contacto', contenido: 'Cuando ambos estén relajados, permite un olfateo breve (3 segundos). Llama a tu perro y prémialo. Repite.', tip: 'Los olfateos deben ser cortos. Los largos generan tensión.', duracion: '6 min' },
      { titulo: 'Señales de Alerta', contenido: 'Pelo erizado, cola rígida, mirada fija, gruñido, labios tensos. Si ves estas señales, aumenta distancia inmediatamente.', tip: 'Mejor prevenir que lamentar. Separa antes de que escale.', duracion: '6 min' }
    ],
    erroresComunes: ['Presentar cara a cara', 'Correa tensa', 'Dejar que un perro acose al otro', 'No intervenir ante señales de estrés'],
    ejercicioPractico: 'Practica una caminata paralela con un perro conocido y tranquilo.'
  },
  'interaccion-humanos': {
    id: 'interaccion-humanos', titulo: 'Interacción con Humanos', subtitulo: 'Saludos apropiados con personas', nivel: 'Básico', duracion: '20 min', xp: 25, huesos: 10,
    imagen: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=800',
    descripcion: 'Enseña a tu perro a saludar personas de forma educada sin saltar ni abalanzarse.',
    objetivos: ['Saludar sin saltar', 'Aceptar caricias correctamente', 'Respetar el espacio personal', 'Manejar la excitación'],
    pasos: [
      { titulo: 'La Regla de Oro', contenido: 'Tu perro solo recibe atención cuando tiene las 4 patas en el suelo. Si salta, la persona se da la vuelta e ignora.', tip: 'Toda la familia y visitantes deben seguir esta regla.', duracion: '5 min' },
      { titulo: 'El Sentado Automático', contenido: 'Practica: cuando alguien se acerca, pide sentado. La persona solo saluda si está sentado. Si se levanta, la persona se aleja.', tip: 'Haz que sentarse sea más rentable que saltar.', duracion: '5 min' },
      { titulo: 'Caricias Correctas', contenido: 'Enseña a las personas a acariciar por el pecho o lateral, no por encima de la cabeza. Deja que el perro inicie el contacto.', tip: 'La regla de los 3 segundos: acaricia 3 seg, para, y ve si pide más.', duracion: '5 min' },
      { titulo: 'Niños y Personas Especiales', contenido: 'Con niños, siempre supervisión directa. Con personas con miedo, mantén distancia y no fuerces.', tip: 'Los niños nunca deben acercarse a un perro dormido o comiendo.', duracion: '5 min' }
    ],
    erroresComunes: ['Permitir que salte "porque es cariñoso"', 'Dejar que extraños lo acaricien sin consentimiento', 'No supervisar con niños', 'Gritar cuando salta'],
    ejercicioPractico: 'Practica el saludo sentado con 3 personas diferentes hoy.'
  },
  'nuevos-entornos': {
    id: 'nuevos-entornos', titulo: 'Nuevos Entornos', subtitulo: 'Explorar con confianza', nivel: 'Intermedio', duracion: '25 min', xp: 30, huesos: 12,
    imagen: 'https://images.unsplash.com/photo-1558929996-da64ba858215?w=800',
    descripcion: 'Cómo introducir a tu perro a nuevos lugares de forma gradual y positiva.',
    objetivos: ['Preparar salidas a nuevos lugares', 'Leer las señales de tu perro', 'Usar premios estratégicamente', 'Crear experiencias positivas'],
    pasos: [
      { titulo: 'Planificación', contenido: 'Elige un lugar nuevo pero no abrumador. Ve en horario tranquilo. Lleva premios de alto valor y agua.', tip: 'Mejor un paseo corto positivo que uno largo estresante.', duracion: '6 min' },
      { titulo: 'Llegada al Lugar', contenido: 'Aparca lejos y camina hacia el lugar. Observa a tu perro. Si muestra estrés, mantén distancia y premia la calma.', tip: 'Deja que tu perro observe antes de entrar.', duracion: '7 min' },
      { titulo: 'Exploración Guiada', contenido: 'Deja que olfatee libremente. Premia cada interacción positiva con el entorno. No le arrastres hacia nada.', tip: 'Olfatear es la forma natural del perro de procesar información.', duracion: '7 min' },
      { titulo: 'Salida Positiva', contenido: 'Sal del lugar ANTES de que tu perro se estrese. Termina siempre en positivo.', tip: 'Mejor salir con ganas de más que agotado y estresado.', duracion: '5 min' }
    ],
    erroresComunes: ['Ir a lugares muy estimulantes al principio', 'Forzar al perro a acercarse', 'Sesiones demasiado largas', 'No llevar premios suficientes'],
    ejercicioPractico: 'Visita un lugar nuevo con tu perro por 10 minutos, premiando toda interacción positiva.'
  },
  'sonidos-estimulos': {
    id: 'sonidos-estimulos', titulo: 'Sonidos y Estímulos', subtitulo: 'Habituación gradual al ruido', nivel: 'Intermedio', duracion: '20 min', xp: 25, huesos: 10,
    imagen: 'https://images.unsplash.com/photo-1537151625747-768eb6cf92b2?w=800',
    descripcion: 'Ayuda a tu perro a acostumbrarse a sonidos cotidianos y reducir el miedo al ruido.',
    objetivos: ['Identificar sonidos problemáticos', 'Aplicar desensibilización', 'Crear asociaciones positivas', 'Manejar tormentas y petardos'],
    pasos: [
      { titulo: 'Identifica los Miedos', contenido: 'Haz una lista de sonidos que asustan a tu perro: truenos, petardos, aspiradora, timbre, coches.', tip: 'Observa su reacción: orejas atrás, temblar, esconderse, jadear.', duracion: '5 min' },
      { titulo: 'Grabaciones a Bajo Volumen', contenido: 'Busca grabaciones del sonido. Ponlo a volumen MUY bajo mientras tu perro come o juega.', tip: 'Si deja de comer, el volumen es demasiado alto.', duracion: '5 min' },
      { titulo: 'Sube Gradualmente', contenido: 'Cada sesión sube ligeramente el volumen. Solo aumenta si está completamente relajado.', tip: 'Este proceso puede llevar semanas. La paciencia es clave.', duracion: '5 min' },
      { titulo: 'En la Vida Real', contenido: 'Cuando escuche el sonido real, actúa normal. Dale premios calmadamente. Nunca lo consueles con voz aguda.', tip: 'Tu calma es contagiosa. Si estás tranquilo, él aprenderá.', duracion: '5 min' }
    ],
    erroresComunes: ['Empezar con volumen alto', 'Forzar la exposición', 'Consolar con voz aguda y ansiosa', 'No ser consistente con las sesiones'],
    ejercicioPractico: 'Pon una grabación de truenos a volumen bajo durante 5 minutos mientras tu perro come.'
  },
  'parque-canino': {
    id: 'parque-canino', titulo: 'El Parque Canino', subtitulo: 'Juego social seguro', nivel: 'Avanzado', duracion: '30 min', xp: 35, huesos: 15,
    imagen: 'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=800',
    descripcion: 'Guía completa para usar parques caninos de forma segura y beneficiosa.',
    objetivos: ['Evaluar si el parque es seguro', 'Supervisar el juego activamente', 'Intervenir cuando sea necesario', 'Saber cuándo irse'],
    pasos: [
      { titulo: 'Antes de Entrar', contenido: 'Observa desde fuera: ¿cuántos perros hay? ¿Están jugando bien? ¿Los dueños están atentos?', tip: 'Mejor ir cuando hay pocos perros.', duracion: '7 min' },
      { titulo: 'La Entrada', contenido: 'Entra con correa puesta. Suelta cuando estés dentro y el ambiente sea calmado.', tip: 'No entres si tu perro está sobre-excitado. Espera a que se calme.', duracion: '8 min' },
      { titulo: 'Supervisión Activa', contenido: 'NO uses el móvil. Observa constantemente. Juego sano: se turnan, pausas voluntarias, lenguaje relajado.', tip: 'Si un perro siempre persigue y el otro siempre huye, no es buen juego.', duracion: '8 min' },
      { titulo: 'Cuándo Irse', contenido: 'Sal si hay un perro agresivo, tu perro está estresado, la energía es caótica, o después de 20-30 min.', tip: 'Es mejor irse pronto y que quiera volver.', duracion: '7 min' }
    ],
    erroresComunes: ['No supervisar activamente', 'Llevar comida al parque', 'Dejar que un perro acose al tuyo', 'Quedarse demasiado tiempo'],
    ejercicioPractico: 'Visita un parque canino y observa desde fuera 10 minutos. Identifica juego sano vs problemático.'
  },
  'rutina-cachorro': {
    id: 'rutina-cachorro', titulo: 'Rutina del Cachorro', subtitulo: 'Horarios y hábitos saludables', nivel: 'Cachorros', duracion: '20 min', xp: 25, huesos: 10,
    imagen: 'https://images.unsplash.com/photo-1591160690555-5debfba289f0?w=800',
    descripcion: 'Establece una rutina diaria que ayude a tu cachorro a sentirse seguro y aprender rápido.',
    objetivos: ['Crear un horario diario', 'Equilibrar actividad y descanso', 'Establecer hábitos de alimentación', 'Planificar tiempo de juego y entrenamiento'],
    pasos: [
      { titulo: 'El Horario Básico', contenido: 'Mañana: baño, comida, juego corto, siesta. Mediodía: baño, comida, paseo, siesta. Tarde: juego, entrenamiento, comida, rutina nocturna.', tip: 'Los cachorros necesitan 18-20 horas de sueño al día.', duracion: '5 min' },
      { titulo: 'Alimentación', contenido: 'Cachorros de 2-4 meses: 4 comidas/día. De 4-6 meses: 3 comidas/día. De 6+ meses: 2 comidas/día. Siempre a las mismas horas.', tip: 'Retira la comida después de 15 minutos si no la come.', duracion: '5 min' },
      { titulo: 'Siestas Programadas', contenido: 'Después de cada periodo de actividad (20-30 min), guía al cachorro a su cama para una siesta obligatoria.', tip: 'Un cachorro sobre-estimulado muerde más y aprende peor.', duracion: '5 min' },
      { titulo: 'Sesiones de Entrenamiento', contenido: '3-5 sesiones de 5 minutos al día. Cortas, divertidas y con muchos premios. Mejor antes de comer.', tip: 'Termina siempre con éxito. Si no sale bien, pide algo fácil y premia.', duracion: '5 min' }
    ],
    erroresComunes: ['No dar suficiente descanso', 'Horarios caóticos', 'Sesiones de entrenamiento muy largas', 'No adaptar la rutina a la edad'],
    ejercicioPractico: 'Escribe la rutina diaria de tu cachorro con horarios específicos y cúmplela 3 días.'
  },
  'socializacion-temprana': {
    id: 'socializacion-temprana', titulo: 'Socialización Temprana', subtitulo: 'Experiencias positivas para cachorros', nivel: 'Cachorros', duracion: '20 min', xp: 25, huesos: 10,
    imagen: 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=800',
    descripcion: 'Cómo socializar a tu cachorro de forma segura durante la ventana crítica de desarrollo.',
    objetivos: ['Planificar experiencias positivas', 'Socializar antes de completar vacunas', 'Crear una lista de exposiciones', 'Reconocer señales de estrés en cachorros'],
    pasos: [
      { titulo: 'La Regla 100', contenido: 'En sus primeros 100 días contigo, intenta que conozca: 100 personas, 100 superficies, 100 experiencias nuevas. Todo POSITIVO.', tip: 'Calidad sobre cantidad. 10 experiencias positivas > 100 estresantes.', duracion: '5 min' },
      { titulo: 'Antes de las Vacunas', contenido: 'Puedes llevarlo en brazos, invitar personas a casa, exponerle a sonidos, y llevarlo a casas con perros vacunados.', tip: 'Evita suelos donde pasan muchos perros desconocidos.', duracion: '5 min' },
      { titulo: 'Clases de Cachorro', contenido: 'Busca clases de socialización para cachorros. Son supervisadas, con perros de edad similar, y en entorno controlado.', tip: 'Las buenas clases incluyen tiempo de juego supervisado.', duracion: '5 min' },
      { titulo: 'Diario de Socialización', contenido: 'Lleva un diario: anota qué experimentó, su reacción, y si necesita más exposición a algo.', tip: 'Usa la app para registrar estas experiencias.', duracion: '5 min' }
    ],
    erroresComunes: ['Esperar a tener todas las vacunas', 'Exponer a demasiadas cosas en un día', 'No observar señales de estrés', 'Forzar interacciones'],
    ejercicioPractico: 'Lleva a tu cachorro (en brazos si no tiene vacunas) a observar un parque durante 10 minutos.'
  },
  'juego-apropiado': {
    id: 'juego-apropiado', titulo: 'Juego Apropiado', subtitulo: 'Diversión segura y educativa', nivel: 'Cachorros', duracion: '20 min', xp: 25, huesos: 10,
    imagen: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=800',
    descripcion: 'Aprende qué tipos de juego son beneficiosos y cómo jugar de forma que eduque.',
    objetivos: ['Elegir juguetes seguros', 'Juegos que enseñan autocontrol', 'Evitar juegos que fomenten malos hábitos', 'Usar el juego como entrenamiento'],
    pasos: [
      { titulo: 'Juguetes Seguros', contenido: 'Tamaño adecuado, material resistente, sin piezas pequeñas. Rota juguetes para mantener el interés.', tip: 'Los juguetes de morder son para el cachorro. Tus manos NO son juguetes.', duracion: '5 min' },
      { titulo: 'Juegos de Olfato', contenido: 'Esconde premios por la casa o jardín. El olfateo cansa mentalmente y es la forma natural del perro de explorar.', tip: 'Empieza fácil (premios visibles) y aumenta la dificultad.', duracion: '5 min' },
      { titulo: 'Tira y Afloja con Reglas', contenido: 'Tú inicias y terminas el juego. Practica "suelta" cada 30 segundos. Si los dientes tocan tu piel, el juego para.', tip: 'Este juego enseña autocontrol si se juega con reglas claras.', duracion: '5 min' },
      { titulo: 'Juegos Prohibidos', contenido: 'No juegues a perseguirle, no animes a morder manos/pies, no juegues brusco.', tip: 'Si el juego se descontrola, haz una pausa de 30 segundos.', duracion: '5 min' }
    ],
    erroresComunes: ['Usar manos como juguetes', 'Jugar a perseguir al cachorro', 'No poner límites en el juego', 'Juguetes peligrosos o pequeños'],
    ejercicioPractico: 'Haz un juego de olfato escondiendo 10 premios por tu casa.'
  }
};

// Helper to translate a single lesson
function translateLesson(es: LeccionData, translations: {
  titulo: string; subtitulo: string; nivel: string; descripcion: string;
  objetivos: string[]; erroresComunes: string[]; ejercicioPractico: string;
  pasos: { titulo: string; contenido: string; tip: string }[];
}): LeccionData {
  return {
    ...es,
    titulo: translations.titulo,
    subtitulo: translations.subtitulo,
    nivel: translations.nivel,
    descripcion: translations.descripcion,
    objetivos: translations.objetivos,
    erroresComunes: translations.erroresComunes,
    ejercicioPractico: translations.ejercicioPractico,
    pasos: es.pasos.map((p, i) => ({
      ...p,
      titulo: translations.pasos[i]?.titulo || p.titulo,
      contenido: translations.pasos[i]?.contenido || p.contenido,
      tip: translations.pasos[i]?.tip || p.tip,
    })),
  };
}

const EN_TRANSLATIONS: Record<string, Parameters<typeof translateLesson>[1]> = {
  'llamada-perfecta': { titulo: 'The Perfect Recall', subtitulo: 'Teach your dog to always come when called', nivel: 'Intermediate', descripcion: 'Recall is one of the most important commands you can teach your dog. A dog that comes when called is safer and has more freedom.', objetivos: ['Understand why your dog doesn\'t come when called', 'Create a positive association with the recall word', 'Practice at different distraction levels', 'Build an automatic response'], erroresComunes: ['Calling for something negative (bath, end of walk)', 'Chasing the dog when it doesn\'t come', 'Not rewarding when it comes', 'Repeating the word many times'], ejercicioPractico: 'Practice 15 recalls at home today, each followed by your dog\'s favorite treat.', pasos: [{ titulo: 'Step 1: The Magic Word', contenido: 'Choose a new word for the recall (e.g., "Here", "Come"). Don\'t use their name if you\'ve already "burned" it by calling without reward.', tip: 'The word should be short, clear, and easy to say with enthusiasm.' }, { titulo: 'Step 2: Positive Association', contenido: 'At home, with no distractions, say the word and IMMEDIATELY give a high-value treat (chicken, cheese, sausage). Repeat 10-15 times.', tip: 'The treat must arrive within 1 second of the word.' }, { titulo: 'Step 3: Add Movement', contenido: 'Now say the word and run AWAY from your dog in a fun way. When they reach you, party time with treats!', tip: 'Running away activates the chase instinct. Never chase your dog.' }, { titulo: 'Step 4: Increase Distraction', contenido: 'Practice in the yard, then on a quiet street, then at the park. Always with a long leash at first.', tip: 'If it fails at one level, go back to the previous one.' }] },
  'sentado-basico': { titulo: 'The Perfect Sit', subtitulo: 'The foundation of all good training', nivel: 'Basic', descripcion: 'Sit is the first signal every dog should learn. It\'s the gateway to the world of positive training.', objetivos: ['Teach sit with a lure', 'Gradually remove the lure', 'Add the verbal cue', 'Generalize in different contexts'], erroresComunes: ['Pushing the dog\'s rear down', 'Repeating the command many times', 'Not rewarding every time at first', 'Sessions too long'], ejercicioPractico: 'Practice 3 sessions of 2 minutes today in different rooms.', pasos: [{ titulo: 'Lure', contenido: 'Hold a treat between your fingers. Place it on your dog\'s nose and slowly raise your hand above their head. Their rear will naturally lower.', tip: 'Don\'t push their rear down. Let gravity do its work.' }, { titulo: 'Mark & Reward', contenido: 'The INSTANT their rear touches the ground, say "Yes!" or use a clicker, and give the treat. Repeat 10 times.', tip: 'Timing is key. Mark at the exact moment.' }, { titulo: 'Remove the Lure', contenido: 'Make the same hand motion but WITHOUT a treat in your hand. When they sit, reward from the other hand.', tip: 'If it doesn\'t work, go back to luring 5 more times.' }, { titulo: 'Add the Word', contenido: 'When they sit reliably with the hand gesture, say "Sit" BEFORE the gesture. They\'ll soon associate the word with the action.', tip: 'Say the word only once. Don\'t repeat "sit, sit, sit".' }] },
  'tumbado': { titulo: 'The Down', subtitulo: 'A position of calm and control', nivel: 'Basic', descripcion: 'Down is essential for teaching calm and self-control. It\'s the foundation for more advanced behaviors.', objetivos: ['Teach down from sit', 'Use the lure technique correctly', 'Increase the duration', 'Add verbal and visual cues'], erroresComunes: ['Moving the treat too fast', 'Not rewarding the final position', 'Asking for duration too soon', 'Frustration if it doesn\'t work quickly'], ejercicioPractico: 'Practice 10 repetitions of down before each meal.', pasos: [{ titulo: 'From Sit', contenido: 'With your dog sitting, bring a treat from their nose down to the floor between their front paws. When they lie down, mark and reward.', tip: 'Move the treat slowly. If they stand up, start over.' }, { titulo: 'The L Shape', contenido: 'If they don\'t go down, make an L with the treat: first down, then toward you along the floor.', tip: 'Some dogs need you to slide the treat under a chair.' }, { titulo: 'Duration', contenido: 'Once they lie down easily, start waiting 1 second before rewarding, then 2, then 3... Build duration gradually.', tip: 'If they get up, don\'t scold. Simply don\'t reward and try again.' }, { titulo: 'Verbal Cue', contenido: 'When the gesture works well, add "Down" BEFORE the hand gesture. The word predicts the gesture.', tip: 'Use a calm tone of voice, not authoritarian.' }] },
  'quieto': { titulo: 'The Stay', subtitulo: 'Canine patience and self-control', nivel: 'Intermediate', descripcion: 'Stay teaches your dog to hold a position until you release them. It\'s fundamental for their safety.', objetivos: ['Teach the concept of holding position', 'Gradually increase duration', 'Add distance', 'Introduce distractions'], erroresComunes: ['Increasing everything too fast', 'Not using a release word', 'Calling the dog from the stay', 'Not going back to reward in position'], ejercicioPractico: 'Practice a 10-second stay 5 times before today\'s walk.', pasos: [{ titulo: 'Basic Concept', contenido: 'With your dog sitting or lying down, wait 1 second, mark with "Yes!" and reward. Repeat, adding half a second each time.', tip: 'If they move before you mark, don\'t reward. Simply start again without getting upset.' }, { titulo: 'Release Word', contenido: 'Choose a word like "Free" or "OK" to indicate they can move. Only reward if they wait to hear that word.', tip: 'The release word is as important as the stay command.' }, { titulo: 'Add Distance', contenido: 'Take one step back. If they hold position, return, mark, and reward. Gradually increase distance.', tip: 'Always go back to reward. Don\'t call them toward you from a stay.' }, { titulo: 'Distractions', contenido: 'Start making odd movements (wave arms, jump). If they hold, jackpot of treats!', tip: 'The 3 D\'s: Duration, Distance, Distraction. Only increase one at a time.' }] },
  'control-impulsos': { titulo: 'Impulse Control', subtitulo: 'Canine self-control in daily life', nivel: 'Intermediate', descripcion: 'Teach your dog that patience and self-control are always rewarded.', objetivos: ['Teach "It\'s Your Choice" game', 'Apply self-control to food', 'Wait at doors and before walks', 'Generalize to daily life'], erroresComunes: ['Giving in when the dog insists', 'Not being consistent with rules', 'Expecting perfection too soon', 'Not rewarding small successes'], ejercicioPractico: 'Practice "It\'s Your Choice" 10 times with treats in your open hand.', pasos: [{ titulo: 'It\'s Your Choice', contenido: 'Put treats in your open hand. If your dog tries to grab them, close your hand. When they back off, open and give one from the OTHER hand.', tip: 'The dog learns: moving away from the treat = getting the treat.' }, { titulo: 'Wait for Food', contenido: 'Lower the food bowl slowly. If they lunge, raise it back up. It only reaches the floor if they wait sitting.', tip: 'At first, reward with "free" when the bowl is halfway down.' }, { titulo: 'Doors and Steps', contenido: 'Before opening the door for a walk, ask for a sit. If they stand when you touch the handle, remove your hand.', tip: 'The door is the reward. You control access.' }, { titulo: 'Real World', contenido: 'Apply the same principle everywhere: before greeting people, before sniffing something, before playing with other dogs.', tip: 'Daily life is the best training ground.' }] },
  'socializacion': { titulo: 'Positive Socialization', subtitulo: 'Creating positive experiences', nivel: 'Basic', descripcion: 'Socialization is the process of exposing your dog to different stimuli in a positive and gradual way.', objetivos: ['Understand real socialization', 'Create an exposure plan', 'Recognize stress signals', 'Know when it\'s too much'], erroresComunes: ['Forcing interactions', 'Flooding with stimuli', 'Ignoring stress signals', 'Thinking socialization is only with other dogs'], ejercicioPractico: 'Make a list of 10 new stimuli and expose your dog to one positively today.', pasos: [{ titulo: 'What is Socialization', contenido: 'It\'s not just "meeting other dogs." It\'s gradually exposing to all types of stimuli (people, sounds, surfaces, objects) creating positive experiences.', tip: 'Quality matters more than quantity.' }, { titulo: 'Exposure Plan', contenido: 'Make a list of 20 things your dog needs to know. Prioritize the most relevant to your daily life.', tip: 'Include: different people, dogs, sounds, surfaces, vehicles, objects.' }, { titulo: 'Stress Signals', contenido: 'Learn to read: lip licking, yawning, looking away, low tail, ears back, excessive panting.', tip: 'If you see these signals, increase distance from the stimulus.' }, { titulo: 'The Threshold Rule', contenido: 'Keep your dog below their stress threshold. If they react with fear or aggression, you\'re too close to the stimulus.', tip: 'Learning only happens when the dog is relaxed.' }] },
  'refuerzo-positivo': { titulo: 'Positive Reinforcement', subtitulo: 'The science behind training', nivel: 'Basic', descripcion: 'Understand why positive reinforcement is the most effective and ethical method to train your dog.', objetivos: ['Understand learning principles', 'Types of reinforcers', 'Correct timing', 'Avoid punishment'], erroresComunes: ['Rewarding too late', 'Always using the same treat', 'Not matching reward to difficulty', 'Thinking the dog knows what\'s wrong'], ejercicioPractico: 'Make a list of your dog\'s top 5 favorite rewards, ranked by value.', pasos: [{ titulo: 'How Dogs Learn', contenido: 'Dogs repeat behaviors that bring pleasant consequences. If sitting earns a treat, they\'ll sit more. It\'s that simple.', tip: 'Dogs don\'t understand moral concepts like "good" or "bad".' }, { titulo: 'Types of Rewards', contenido: 'Food (most effective), play, attention, access to things (sniffing, going out). Each dog has preferences.', tip: 'Create a reward hierarchy: low, medium, and high value.' }, { titulo: 'Timing', contenido: 'The reward must arrive within 1-2 seconds of the behavior. Use a marker ("Yes!" or clicker) to be more precise.', tip: 'The marker is like taking a photo of the correct behavior.' }, { titulo: 'Why Not Punishment', contenido: 'Punishment suppresses behaviors through fear, doesn\'t teach what to do, damages the relationship, and can generate aggression.', tip: 'Instead of punishing the bad, teach and reward the good.' }] },
  'paseo-correa': { titulo: 'Leash Walking', subtitulo: 'Walking together without pulling', nivel: 'Intermediate', descripcion: 'Learn to walk with your dog without leash pulling, making walks an enjoyable experience.', objetivos: ['Understand why they pull', 'Tree technique', 'Direction change technique', 'Relaxed walking as goal'], erroresComunes: ['Pulling the leash back', 'Not being consistent', 'Walks too long without prior training', 'Using punishment collars or prongs'], ejercicioPractico: 'Practice 5 minutes of "tree technique" at the start of today\'s walk.', pasos: [{ titulo: 'Why They Pull', contenido: 'Your dog pulls because it works: if they pull, they move forward. You\'ve accidentally taught that pulling = reaching the destination.', tip: 'Don\'t use retractable leashes. They teach pulling.' }, { titulo: 'Tree Technique', contenido: 'When they pull, stop completely like a tree. Don\'t take a single step. When the leash loosens, mark and advance (advancing is the reward).', tip: 'Be patient. At first you won\'t go far.' }, { titulo: 'Direction Changes', contenido: 'When they pull, turn 180° and walk in the opposite direction. Your dog will learn to pay attention to anticipate your movements.', tip: 'Do it cheerfully, not as punishment.' }, { titulo: 'Reward Position', contenido: 'Carry treats and reinforce every time they walk beside you with a loose leash. Name the position: "Heel."', tip: 'Reward frequently at first. Every 3-5 steps.' }] },
  'estres-canino': { titulo: 'Canine Stress', subtitulo: 'Identify and reduce stress', nivel: 'Intermediate', descripcion: 'Learn to identify stress signals in your dog and how to help them manage it.', objetivos: ['Recognize stress signals', 'Identify triggers', 'Reduction strategies', 'Create a calm environment'], erroresComunes: ['Ignoring subtle signals', 'Forcing the dog to "face their fears"', 'Comforting with a high-pitched anxious voice', 'Not seeking professional help when needed'], ejercicioPractico: 'Watch your dog for 30 minutes and note all calming signals they show.', pasos: [{ titulo: 'Subtle Signals', contenido: 'Lip licking, yawning out of context, shaking off, looking away, ears back, excessive panting.', tip: 'These signals are the first warning. If you ignore them, it will escalate.' }, { titulo: 'Clear Signals', contenido: 'Growling, raised hackles, tail between legs, trembling, trying to escape, freezing ("shutdown").', tip: 'If you reach these signals, the dog is already at a high stress level.' }, { titulo: 'Triggers', contenido: 'Keep a diary: when does your dog get stressed? Noises? Other dogs? Being alone? Vet visits?', tip: 'Knowing the triggers is the first step to solving them.' }, { titulo: 'Strategies', contenido: 'Increase distance from stimulus, offer sniffing (calms the brain), use their safe place, don\'t force situations.', tip: 'Sometimes the best solution is simply to leave.' }] },
  'relajacion': { titulo: 'Relaxation Protocol', subtitulo: 'Teaching your dog to be calm', nivel: 'Advanced', descripcion: 'Karen Overall\'s Relaxation Protocol teaches your dog to actively relax.', objetivos: ['Understand the relaxation protocol', 'Teach the calm position', 'Increase duration and distractions', 'Apply in daily life'], erroresComunes: ['Rewarding when tense', 'Increasing criteria too fast', 'Not using the mat in real life', 'Forcing the dog to stay on the mat'], ejercicioPractico: 'Practice 5 minutes of the relaxation protocol on the mat while watching TV.', pasos: [{ titulo: 'The Position', contenido: 'Choose a mat or bed. Take your dog there and ONLY reward calm. Relaxed lying down = reward. Standing or tense sitting = nothing.', tip: 'The mat will become their "calm switch".' }, { titulo: 'Duration', contenido: 'Start rewarding every 2 seconds of calm. Gradually increase intervals: 5 sec, 10 sec, 30 sec, 1 min...', tip: 'If they get up, simply wait. Reward when they relax again.' }, { titulo: 'Distractions', contenido: 'While relaxed, start moving, making soft noises, opening doors. Reward if they stay calm.', tip: 'Increase distractions VERY gradually.' }, { titulo: 'Generalization', contenido: 'Take the mat to other places: patio, garden, friend\'s house. Your dog will associate the mat with calm anywhere.', tip: 'The portable mat is an incredible tool for restaurants, trips, etc.' }] },
  'lugar-seguro': { titulo: 'The Safe Place', subtitulo: 'A calm refuge for your dog', nivel: 'Basic', descripcion: 'Create a space where your dog feels 100% safe and can retreat when they need peace.', objetivos: ['Choose the ideal location', 'Create positive associations', 'Respect the dog\'s space', 'Use the safe place correctly'], erroresComunes: ['Using the place as punishment', 'Bothering the dog when they\'re there', 'Forcing the dog to go there', 'Not respecting the dog\'s space'], ejercicioPractico: 'Set up a safe place with a comfy bed and leave 3 surprise treats there.', pasos: [{ titulo: 'Choose the Place', contenido: 'Watch where your dog goes when they want peace. It could be a corner, under the table, their crate. Add a comfy bed.', tip: 'The place should be away from household traffic.' }, { titulo: 'Positive Association', contenido: 'Leave treats and special toys there. Reward every time your dog goes voluntarily. NEVER send them there as punishment.', tip: 'Frozen stuffed Kongs are perfect for the safe place.' }, { titulo: 'The Golden Rule', contenido: 'When your dog is in their safe place, NOBODY bothers them. Not kids, not visitors, not you. It\'s their inviolable sanctuary.', tip: 'Teach the whole family this rule.' }, { titulo: 'Practical Use', contenido: 'Guide your dog to their safe place before stressful events (visitors, storms, fireworks). Over time, they\'ll go on their own.', tip: 'You can add calming music for dogs.' }] },
  'desensibilizacion': { titulo: 'Desensitization', subtitulo: 'Overcoming fears gradually', nivel: 'Advanced', descripcion: 'Desensitization is the scientific technique to help your dog overcome fears gradually and safely.', objetivos: ['Understand desensitization', 'Create a gradual exposure plan', 'Combine with counter-conditioning', 'Know when to seek professional help'], erroresComunes: ['Going too fast', 'Forcing exposure', 'Not being consistent', 'Trying to solve severe problems without professional help'], ejercicioPractico: 'Identify one of your dog\'s fears and design the 10 exposure levels.', pasos: [{ titulo: 'The Principle', contenido: 'Expose the dog to the scary stimulus at an intensity so low it causes NO reaction. Then gradually increase.', tip: 'If the dog reacts, you\'ve gone too fast. Step back.' }, { titulo: 'The Plan', contenido: 'Identify the stimulus. Create 10 intensity levels (1=barely noticeable to 10=real level). Work from 1 to 10.', tip: 'Example with sounds: start with a recording at volume 1.' }, { titulo: 'Counter-conditioning', contenido: 'While exposing to the low-intensity stimulus, give HIGH-value treats. The scary stimulus becomes a predictor of good things.', tip: 'The treat should only appear when the stimulus is present.' }, { titulo: 'When to Get Help', contenido: 'If your dog has extreme reactions (aggression, total panic, self-harm), seek a certified behavior professional.', tip: 'A good professional uses science-based methods, not dominance.' }] },
  'rutinas-calmantes': { titulo: 'Calming Routines', subtitulo: 'Daily calm for dog and human', nivel: 'Basic', descripcion: 'Implement daily routines that promote calm and reduce your dog\'s stress.', objetivos: ['Create a calming morning routine', 'Implement sniffing activities', 'Establish rest moments', 'Nighttime relaxation ritual'], erroresComunes: ['Over-stimulating the dog constantly', 'Not allowing enough rest', 'Chaotic, unpredictable routines', 'Ignoring the importance of sniffing'], ejercicioPractico: 'Implement a 15-minute sniffing walk this afternoon (your dog chooses the direction).', pasos: [{ titulo: 'Calm Morning', contenido: 'Start the day without excitement. Let your dog sniff when going out, don\'t rush to the park. Morning sniffing calms.', tip: 'The first 5 minutes of the day set the tone.' }, { titulo: 'Active Sniffing', contenido: 'Scatter treats in the yard or use a snuffle mat. 15 minutes of sniffing equals 1 hour of walking in terms of mental tiredness.', tip: 'Sniffing lowers the dog\'s heart rate.' }, { titulo: 'Rest Moments', contenido: 'After each activity period, guide your dog to their resting place. Don\'t stimulate them constantly.', tip: 'Dogs need 14-16 hours of rest per day.' }, { titulo: 'Night Ritual', contenido: 'Create a predictable nighttime routine: short last walk, stuffed kong in their bed, dim lights. Predictability calms.', tip: 'Lavender and classical music can help relax.' }] },
  'bienvenido-casa': { titulo: 'Welcome Home', subtitulo: 'The puppy\'s first days', nivel: 'Puppies', descripcion: 'Complete guide for your puppy\'s first days at home. Set the foundation for a happy life together.', objetivos: ['Prepare the house for the puppy', 'Establish routines from day 1', 'Create a safe environment', 'Avoid common first-day mistakes'], erroresComunes: ['Giving access to the whole house', 'Too many visitors on the first day', 'Not establishing routines from the start', 'Completely ignoring nighttime crying'], ejercicioPractico: 'If you don\'t have a puppy yet, list everything you need to buy. If you do, check that your home is safe.', pasos: [{ titulo: 'Preparation', contenido: 'Before they arrive: bed, bowls, water, chew toys, crate, fenced area if possible. Remove hazards.', tip: 'Puppies chew EVERYTHING. Cables, shoes, plants...' }, { titulo: 'First Day', contenido: 'Let them explore at their own pace. Don\'t overwhelm with the whole family at once. Offer water, food, and lots of calm.', tip: 'It\'s normal for them to cry the first night. They\'re a baby in a new place.' }, { titulo: 'Immediate Routine', contenido: 'Set feeding times (3-4 times/day), bathroom breaks every 2 hours, and regular naps in their safe zone.', tip: 'Puppies need more sleep than you think.' }, { titulo: 'First Night', contenido: 'Put their bed near you. A wrapped clock mimics their mother\'s heartbeat. Don\'t ignore crying, but don\'t create a party.', tip: 'A heartbeat plush toy can help a lot.' }] },
  'inhibicion-mordisco': { titulo: 'Bite Inhibition', subtitulo: 'Soft mouth, polite puppy', nivel: 'Puppies', descripcion: 'Teach your puppy to control the force of their mouth. It\'s the most important lesson they\'ll learn.', objetivos: ['Understand why puppies bite', 'Teach appropriate mouth pressure', 'Redirect to appropriate objects', 'Manage the teething phase'], erroresComunes: ['Punishing the puppy for biting', 'Playing rough with hands', 'Not redirecting to toys', 'Not being consistent with the technique'], ejercicioPractico: 'Prepare 3 chew toys in different rooms for quick redirecting.', pasos: [{ titulo: 'Why They Bite', contenido: 'Puppies explore the world with their mouth. Biting is NORMAL and necessary for development. Your job is to teach how much pressure is acceptable.', tip: 'Never punish a puppy for biting. It\'s like punishing a baby for grabbing things.' }, { titulo: 'The "Ouch" Technique', contenido: 'When they bite too hard, say "OUCH!" in a high voice (like a playmate) and withdraw your hand for 3 seconds. If they continue, get up and leave for 30 sec.', tip: 'The goal is NOT to stop biting, but to teach gentle biting.' }, { titulo: 'Redirection', contenido: 'Always have a chew toy handy. When they bite your hand, substitute with the toy and reward when they chew it.', tip: 'Keep toys in every room for quick redirection.' }, { titulo: 'Teething', contenido: 'Between 3-6 months baby teeth fall out. Give frozen chewers (carrot, kong with frozen broth) to soothe gums.', tip: 'Teething can last several weeks. Be patient.' }] },
  'necesidades': { titulo: 'Potty Training', subtitulo: 'Learning to go outside', nivel: 'Puppies', descripcion: 'Step-by-step guide to teach your puppy to do their business in the right place.', objetivos: ['Understand the puppy\'s natural schedule', 'Create an effective bathroom routine', 'Handle accidents without punishment', 'Signs they need to go out'], erroresComunes: ['Punishing accidents', 'Not going out frequently enough', 'Not cleaning with enzymatic cleaner', 'Rewarding inside instead of outside'], ejercicioPractico: 'Take your puppy to the designated spot every 2 hours today and reward every success.', pasos: [{ titulo: 'Puppy Schedule', contenido: 'Puppies need to go out: when waking up, after eating, after playing, after sleeping, and every 2 hours minimum.', tip: 'A 2-month puppy can hold maximum 2 hours. 3 months = 3 hours.' }, { titulo: 'The Designated Spot', contenido: 'ALWAYS go to the same place. Wait patiently (up to 5 min). When they go, treat party! Don\'t rush them.', tip: 'Some dogs need to walk a bit before finding the ideal spot.' }, { titulo: 'Managing Accidents', contenido: 'NEVER scold or rub their nose in the accident. Simply clean with enzymatic cleaner and supervise better next time.', tip: 'If you catch them in the act, quickly take them to the right spot and reward if they finish there.' }, { titulo: 'Signals', contenido: 'Learn to read: intense ground sniffing, circling, going toward the door, sudden restlessness.', tip: 'Hang a bell on the door and teach your puppy to ring it to ask to go out.' }] },
  'quedarse-solo': { titulo: 'Home Alone', subtitulo: 'Independence without anxiety', nivel: 'Puppies', descripcion: 'Teach your puppy to be alone gradually to prevent separation anxiety.', objetivos: ['Understand separation anxiety', 'Teach gradual independence', 'Create farewell rituals', 'Enrich alone time'], erroresComunes: ['Emotional goodbyes', 'Leaving alone too long too soon', 'Not enriching alone time', 'Punishing destruction upon return'], ejercicioPractico: 'Practice leaving the room 10 times today, increasing from 5 sec to 2 min.', pasos: [{ titulo: 'Start Small', contenido: 'Leave the room for 5 seconds. Return without fuss. Gradually increase: 10 sec, 30 sec, 1 min, 5 min...', tip: 'The trick is to return BEFORE they start getting stressed.' }, { titulo: 'Boring Ritual', contenido: 'Goodbyes and arrivals should be BORING. No "goodbye my love" or parties on return. Simply leave and return normally.', tip: 'Emotional goodbyes teach that leaving is an important event.' }, { titulo: 'Enrichment', contenido: 'When you leave, leave a frozen stuffed Kong, interactive toys, or a sniffing activity. Associate your departure with great things.', tip: 'Frozen Kong with peanut butter is your best ally.' }, { titulo: 'Pre-signals', contenido: 'Desensitize prior signals: grab keys and sit down, put on shoes and watch TV. Break the association keys=I\'m leaving.', tip: 'Practice departure rituals without actually leaving.' }] },
  'ventana-socializacion': { titulo: 'The Socialization Window', subtitulo: 'Critical development periods', nivel: 'Puppies', descripcion: 'Learn about the critical socialization window and how to make the most of it.', objetivos: ['Understand critical periods', 'Plan exposures', 'Quality over quantity', 'What to do if it\'s passed'], erroresComunes: ['Waiting for all vaccines before going out', 'Forcing interactions', 'Exposing to too many things', 'Not rewarding during experiences'], ejercicioPractico: 'Make a list of 5 things your puppy hasn\'t yet experienced positively.', pasos: [{ titulo: 'The Window', contenido: 'Between 3-14 weeks is when the puppy\'s brain is most receptive to new experiences. What they experience now will mark them.', tip: 'This doesn\'t mean exposing to everything. Quality > quantity.' }, { titulo: 'Socialization List', contenido: 'People (children, elderly, uniforms), animals, surfaces, sounds, places, objects (umbrellas, bikes).', tip: 'Search "puppy socialization checklist" for a complete list.' }, { titulo: 'How to Do It', contenido: 'Every experience must be POSITIVE. Observe, don\'t force. Reward curiosity and calm. Retreat if they show fear.', tip: 'One bad experience can cause lifelong fear.' }, { titulo: 'After the Window', contenido: 'If your dog is older, you can still socialize, but it will be slower. Use desensitization and counter-conditioning.', tip: 'It\'s never too late, it just requires more patience.' }] },
  'presentaciones-perros': { titulo: 'Safe Introductions', subtitulo: 'Meeting other dogs correctly', nivel: 'Intermediate', descripcion: 'Learn to introduce your dog to other dogs safely and positively.', objetivos: ['Read canine body language', 'Do parallel introductions', 'Identify stress signals', 'Know when to separate'], erroresComunes: ['Face-to-face introductions', 'Tight leash', 'Letting one dog bully another', 'Not intervening at stress signals'], ejercicioPractico: 'Practice a parallel walk with a known, calm dog.', pasos: [{ titulo: 'Before the Meeting', contenido: 'Choose a neutral space. Both dogs on loose leash. Keep initial distance of 5-10 meters.', tip: 'Never introduce dogs in one of their homes.' }, { titulo: 'Parallel Walk', contenido: 'Walk in the same direction with the other dog at 3-4 meters distance. Reward calm. Gradually reduce distance.', tip: 'Walking together builds bond without face-to-face pressure.' }, { titulo: 'First Contact', contenido: 'When both are relaxed, allow a brief sniff (3 seconds). Call your dog back and reward. Repeat.', tip: 'Sniffs should be short. Long ones create tension.' }, { titulo: 'Warning Signs', contenido: 'Raised hackles, stiff tail, hard stare, growling, tight lips. If you see these, increase distance immediately.', tip: 'Better safe than sorry. Separate before it escalates.' }] },
  'interaccion-humanos': { titulo: 'Human Interaction', subtitulo: 'Proper greetings with people', nivel: 'Basic', descripcion: 'Teach your dog to greet people politely without jumping or lunging.', objetivos: ['Greet without jumping', 'Accept petting correctly', 'Respect personal space', 'Manage excitement'], erroresComunes: ['Allowing jumping "because they\'re friendly"', 'Letting strangers pet without consent', 'Not supervising with children', 'Yelling when they jump'], ejercicioPractico: 'Practice sit-greetings with 3 different people today.', pasos: [{ titulo: 'The Golden Rule', contenido: 'Your dog only gets attention with all 4 paws on the ground. If they jump, the person turns around and ignores.', tip: 'Everyone in the family and visitors must follow this rule.' }, { titulo: 'Auto-Sit', contenido: 'Practice: when someone approaches, ask for sit. The person only greets if sitting. If they stand, the person moves away.', tip: 'Make sitting more profitable than jumping.' }, { titulo: 'Proper Petting', contenido: 'Teach people to pet on the chest or side, not over the head. Let the dog initiate contact.', tip: 'The 3-second rule: pet for 3 sec, stop, see if they ask for more.' }, { titulo: 'Children and Special People', contenido: 'With children, always direct supervision. With fearful people, keep distance and don\'t force.', tip: 'Children should never approach a sleeping or eating dog.' }] },
  'nuevos-entornos': { titulo: 'New Environments', subtitulo: 'Exploring with confidence', nivel: 'Intermediate', descripcion: 'How to introduce your dog to new places gradually and positively.', objetivos: ['Prepare outings to new places', 'Read your dog\'s signals', 'Use treats strategically', 'Create positive experiences'], erroresComunes: ['Going to very stimulating places first', 'Forcing the dog to approach', 'Sessions too long', 'Not bringing enough treats'], ejercicioPractico: 'Visit a new place with your dog for 10 minutes, rewarding every positive interaction.', pasos: [{ titulo: 'Planning', contenido: 'Choose a new but not overwhelming place. Go during quiet hours. Bring high-value treats and water.', tip: 'A short positive outing is better than a long stressful one.' }, { titulo: 'Arriving', contenido: 'Park far away and walk toward the place. Watch your dog. If they show stress, keep distance and reward calm.', tip: 'Let your dog observe before entering.' }, { titulo: 'Guided Exploration', contenido: 'Let them sniff freely. Reward every positive interaction with the environment. Don\'t drag them toward anything.', tip: 'Sniffing is the dog\'s natural way of processing information.' }, { titulo: 'Positive Exit', contenido: 'Leave the place BEFORE your dog gets stressed. Always end on a positive note.', tip: 'Better to leave wanting more than exhausted and stressed.' }] },
  'sonidos-estimulos': { titulo: 'Sounds and Stimuli', subtitulo: 'Gradual noise habituation', nivel: 'Intermediate', descripcion: 'Help your dog get used to everyday sounds and reduce noise fear.', objetivos: ['Identify problematic sounds', 'Apply desensitization', 'Create positive associations', 'Handle storms and fireworks'], erroresComunes: ['Starting with high volume', 'Forcing exposure', 'Comforting with anxious voice', 'Not being consistent with sessions'], ejercicioPractico: 'Play a thunder recording at low volume for 5 minutes while your dog eats.', pasos: [{ titulo: 'Identify the Fears', contenido: 'List sounds that scare your dog: thunder, fireworks, vacuum, doorbell, cars.', tip: 'Watch their reaction: ears back, trembling, hiding, panting.' }, { titulo: 'Low Volume Recordings', contenido: 'Find recordings of the sound. Play at VERY low volume while your dog eats or plays.', tip: 'If they stop eating, the volume is too high.' }, { titulo: 'Gradually Increase', contenido: 'Each session slightly increase volume. Only increase if completely relaxed at current level.', tip: 'This process can take weeks. Patience is key.' }, { titulo: 'In Real Life', contenido: 'When they hear the real sound, act normal. Give treats calmly. Never comfort with a high-pitched voice.', tip: 'Your calm is contagious. If you\'re calm, they\'ll learn.' }] },
  'parque-canino': { titulo: 'The Dog Park', subtitulo: 'Safe social play', nivel: 'Advanced', descripcion: 'Complete guide to using dog parks safely and beneficially.', objetivos: ['Assess if the park is safe', 'Actively supervise play', 'Intervene when necessary', 'Know when to leave'], erroresComunes: ['Not actively supervising', 'Bringing food to the park', 'Letting a dog bully yours', 'Staying too long'], ejercicioPractico: 'Visit a dog park and observe from outside for 10 minutes. Identify healthy vs problematic play.', pasos: [{ titulo: 'Before Entering', contenido: 'Watch from outside: how many dogs? Are they playing well? Are owners attentive?', tip: 'Better to go when there are few dogs.' }, { titulo: 'The Entrance', contenido: 'Enter with leash on. Release when inside and the atmosphere is calm.', tip: 'Don\'t enter if your dog is over-excited. Wait until they calm down.' }, { titulo: 'Active Supervision', contenido: 'DON\'T use your phone. Watch constantly. Healthy play: taking turns, voluntary pauses, relaxed body language.', tip: 'If one dog always chases and the other always flees, it\'s not good play.' }, { titulo: 'When to Leave', contenido: 'Leave if there\'s an aggressive dog, your dog is stressed, energy is chaotic, or after 20-30 min.', tip: 'Better to leave early wanting to return.' }] },
  'rutina-cachorro': { titulo: 'Puppy Routine', subtitulo: 'Healthy schedules and habits', nivel: 'Puppies', descripcion: 'Set up a daily routine that helps your puppy feel secure and learn fast.', objetivos: ['Create a daily schedule', 'Balance activity and rest', 'Establish feeding habits', 'Plan play and training time'], erroresComunes: ['Not giving enough rest', 'Chaotic schedules', 'Training sessions too long', 'Not adapting routine to age'], ejercicioPractico: 'Write your puppy\'s daily routine with specific times and follow it for 3 days.', pasos: [{ titulo: 'Basic Schedule', contenido: 'Morning: potty, food, short play, nap. Midday: potty, food, walk, nap. Evening: play, training, food, bedtime routine.', tip: 'Puppies need 18-20 hours of sleep per day.' }, { titulo: 'Feeding', contenido: '2-4 months: 4 meals/day. 4-6 months: 3 meals/day. 6+ months: 2 meals/day. Always at the same times.', tip: 'Remove food after 15 minutes if uneaten.' }, { titulo: 'Scheduled Naps', contenido: 'After each activity period (20-30 min), guide the puppy to their bed for a mandatory nap.', tip: 'An over-stimulated puppy bites more and learns worse.' }, { titulo: 'Training Sessions', contenido: '3-5 sessions of 5 minutes per day. Short, fun, with lots of treats. Best before meals.', tip: 'Always end with success. If struggling, ask for something easy and reward.' }] },
  'socializacion-temprana': { titulo: 'Early Socialization', subtitulo: 'Positive experiences for puppies', nivel: 'Puppies', descripcion: 'How to socialize your puppy safely during the critical development window.', objetivos: ['Plan positive experiences', 'Socialize before complete vaccines', 'Create an exposure list', 'Recognize puppy stress signals'], erroresComunes: ['Waiting for all vaccines', 'Exposing to too many things in one day', 'Not watching for stress signals', 'Forcing interactions'], ejercicioPractico: 'Take your puppy (carry if unvaccinated) to watch a park for 10 minutes.', pasos: [{ titulo: 'The 100 Rule', contenido: 'In their first 100 days, try to introduce: 100 different people, 100 surfaces, 100 new experiences. All POSITIVE.', tip: 'Quality over quantity. 10 positive experiences > 100 stressful ones.' }, { titulo: 'Before Vaccines', contenido: 'You can carry them to see the world, invite people home, expose to sounds, and visit homes with vaccinated dogs.', tip: 'Avoid floors where many unknown dogs walk.' }, { titulo: 'Puppy Classes', contenido: 'Look for puppy socialization classes. They\'re supervised, with similar-age dogs, in controlled environments.', tip: 'Good classes include supervised playtime.' }, { titulo: 'Socialization Diary', contenido: 'Keep a diary: note what they experienced, their reaction, and if they need more exposure to something.', tip: 'Use the app to record these experiences.' }] },
  'juego-apropiado': { titulo: 'Appropriate Play', subtitulo: 'Safe and educational fun', nivel: 'Puppies', descripcion: 'Learn what types of play are beneficial and how to play in a way that educates.', objetivos: ['Choose safe toys', 'Games that teach self-control', 'Avoid games that encourage bad habits', 'Use play as training'], erroresComunes: ['Using hands as toys', 'Playing chase with the puppy', 'Not setting play limits', 'Dangerous or small toys'], ejercicioPractico: 'Set up a scent game hiding 10 treats around your house.', pasos: [{ titulo: 'Safe Toys', contenido: 'Right size, durable material, no small parts. Rotate toys to maintain interest.', tip: 'Chew toys are for the puppy. Your hands are NOT toys.' }, { titulo: 'Scent Games', contenido: 'Hide treats around the house or yard. Sniffing is mentally tiring and the dog\'s natural way to explore.', tip: 'Start easy (visible treats) and increase difficulty.' }, { titulo: 'Tug with Rules', contenido: 'You start and end the game. Practice "drop it" every 30 seconds. If teeth touch skin, game stops.', tip: 'This game teaches self-control when played with clear rules.' }, { titulo: 'Forbidden Games', contenido: 'Don\'t play chase, don\'t encourage biting hands/feet, don\'t play rough.', tip: 'If play gets out of control, take a 30-second break.' }] },
};

const IT_TRANSLATIONS: Record<string, Parameters<typeof translateLesson>[1]> = {
  'llamada-perfecta': { titulo: 'Il Richiamo Perfetto', subtitulo: 'Insegna al tuo cane a venire sempre', nivel: 'Intermedio', descripcion: 'Il richiamo \u00e8 uno dei comandi pi\u00f9 importanti. Un cane che viene quando lo chiami \u00e8 pi\u00f9 sicuro e ha pi\u00f9 libert\u00e0.', objetivos: ['Capire perch\u00e9 il tuo cane non viene', 'Creare un\'associazione positiva', 'Praticare con diversi livelli di distrazione', 'Consolidare la risposta automatica'], erroresComunes: ['Chiamare per qualcosa di negativo', 'Inseguire il cane', 'Non premiare quando viene', 'Ripetere la parola molte volte'], ejercicioPractico: 'Pratica 15 richiami a casa oggi, ciascuno seguito dal suo premio preferito.', pasos: [{ titulo: 'Passo 1: La Parola Magica', contenido: 'Scegli una parola nuova per il richiamo. Non usare il suo nome se l\'hai gi\u00e0 "bruciato" chiamandolo senza ricompensa.', tip: 'La parola deve essere corta, chiara e facile da pronunciare con entusiasmo.' }, { titulo: 'Passo 2: Associazione Positiva', contenido: 'A casa, senza distrazioni, dici la parola e IMMEDIATAMENTE dai un premio di alto valore. Ripeti 10-15 volte.', tip: 'Il premio deve arrivare entro 1 secondo dalla parola.' }, { titulo: 'Passo 3: Aggiungi Movimento', contenido: 'Ora dici la parola e corri LONTANO dal tuo cane in modo divertente. Quando ti raggiunge, festa di premi!', tip: 'Correre via attiva l\'istinto di inseguimento. Non inseguire mai il tuo cane.' }, { titulo: 'Passo 4: Aumenta la Distrazione', contenido: 'Pratica in giardino, poi in una strada tranquilla, poi al parco. Sempre con guinzaglio lungo all\'inizio.', tip: 'Se fallisce a un livello, torna al precedente.' }] },
  'sentado-basico': { titulo: 'Il Seduto Perfetto', subtitulo: 'La base di ogni buon addestramento', nivel: 'Base', descripcion: 'Il seduto \u00e8 il primo segnale che ogni cane dovrebbe imparare.', objetivos: ['Insegnare il seduto con esca', 'Eliminare l\'esca gradualmente', 'Aggiungere il comando verbale', 'Generalizzare in contesti diversi'], erroresComunes: ['Spingere il sedere del cane', 'Ripetere il comando', 'Non premiare ogni volta all\'inizio', 'Sessioni troppo lunghe'], ejercicioPractico: 'Pratica 3 sessioni da 2 minuti oggi in stanze diverse.', pasos: [{ titulo: 'Esca', contenido: 'Tieni un premio tra le dita. Mettilo sul naso del cane e alza la mano lentamente sopra la testa. Il sedere scender\u00e0 naturalmente.', tip: 'Non spingere il sedere. Lascia che la gravit\u00e0 faccia il suo lavoro.' }, { titulo: 'Marca e Premia', contenido: 'Nell\'ISTANTE in cui il sedere tocca il pavimento, dici "S\u00ec!" o usa un clicker, e dai il premio. Ripeti 10 volte.', tip: 'Il timing \u00e8 fondamentale. Marca nel momento esatto.' }, { titulo: 'Rimuovi l\'Esca', contenido: 'Fai lo stesso gesto ma SENZA premio in mano. Quando si siede, premia dall\'altra mano.', tip: 'Se non funziona, torna a usare l\'esca 5 volte in pi\u00f9.' }, { titulo: 'Aggiungi la Parola', contenido: 'Quando si siede con il gesto, dici "Sit" PRIMA del gesto. Associer\u00e0 presto la parola all\'azione.', tip: 'Dici la parola una sola volta.' }] },
  'tumbado': { titulo: 'Il Terra', subtitulo: 'Posizione di calma e controllo', nivel: 'Base', descripcion: 'Il terra \u00e8 essenziale per insegnare calma e autocontrollo.', objetivos: ['Insegnare il terra dal seduto', 'Usare la tecnica dell\'esca', 'Aumentare la durata', 'Aggiungere segnali verbali e visivi'], erroresComunes: ['Muovere il premio troppo veloce', 'Non premiare la posizione finale', 'Chiedere durata troppo presto', 'Frustrazione'], ejercicioPractico: 'Pratica 10 ripetizioni del terra prima di ogni pasto.', pasos: [{ titulo: 'Dal Seduto', contenido: 'Con il cane seduto, porta un premio dal naso verso il pavimento tra le zampe anteriori. Quando si sdraia, marca e premia.', tip: 'Muovi il premio lentamente. Se si alza, ricomincia.' }, { titulo: 'La L', contenido: 'Se non scende, fai una L con il premio: prima verso il basso poi verso di te lungo il pavimento.', tip: 'Alcuni cani hanno bisogno di far scivolare il premio sotto una sedia.' }, { titulo: 'Durata', contenido: 'Una volta che si sdraia facilmente, aspetta 1 secondo prima di premiare, poi 2, poi 3...', tip: 'Se si alza, non sgridarlo. Semplicemente non premiare e riprova.' }, { titulo: 'Comando Verbale', contenido: 'Quando il gesto funziona bene, aggiungi "Terra" PRIMA del gesto di mano.', tip: 'Usa un tono di voce tranquillo.' }] },
  'quieto': { titulo: 'Il Resta', subtitulo: 'Pazienza e autocontrollo canino', nivel: 'Intermedio', descripcion: 'Il resta insegna al tuo cane a mantenere una posizione fino al rilascio.', objetivos: ['Insegnare il concetto di mantenere posizione', 'Aumentare la durata', 'Aggiungere distanza', 'Introdurre distrazioni'], erroresComunes: ['Aumentare tutto troppo velocemente', 'Non usare parola di rilascio', 'Chiamare il cane dal resta', 'Non tornare a premiare in posizione'], ejercicioPractico: 'Pratica un resta di 10 secondi 5 volte prima della passeggiata.', pasos: [{ titulo: 'Concetto Base', contenido: 'Con il cane seduto o sdraiato, aspetta 1 secondo, marca con "S\u00ec!" e premia. Ripeti aumentando mezzo secondo.', tip: 'Se si muove prima della marca, non premiare. Ricomincia senza arrabbiarti.' }, { titulo: 'Parola di Rilascio', contenido: 'Scegli una parola come "Libero" o "Via" per indicare che pu\u00f2 muoversi.', tip: 'La parola di rilascio \u00e8 tanto importante quanto il resta.' }, { titulo: 'Aggiungi Distanza', contenido: 'Fai un passo indietro. Se mantiene la posizione, torna, marca e premia. Aumenta gradualmente.', tip: 'Torna sempre a premiare. Non chiamarlo verso di te dal resta.' }, { titulo: 'Distrazioni', contenido: 'Inizia a fare movimenti strani. Se mantiene, jackpot di premi!', tip: 'Le 3 D: Durata, Distanza, Distrazione. Aumenta solo una alla volta.' }] },
};

// Build EN and IT maps using translation helper
function buildTranslatedMap(baseMap: Record<string, LeccionData>, translations: Record<string, Parameters<typeof translateLesson>[1]>): Record<string, LeccionData> {
  const result: Record<string, LeccionData> = {};
  for (const [id, lesson] of Object.entries(baseMap)) {
    if (translations[id]) {
      result[id] = translateLesson(lesson, translations[id]);
    } else {
      result[id] = lesson; // fallback to Spanish
    }
  }
  return result;
}

const LESSONS_EN = buildTranslatedMap(LESSONS_ES, EN_TRANSLATIONS);
const LESSONS_IT = buildTranslatedMap(LESSONS_ES, IT_TRANSLATIONS);

const ALL_LESSONS: Record<string, Record<string, LeccionData>> = {
  es: LESSONS_ES,
  en: LESSONS_EN,
  it: LESSONS_IT,
};

export function getLessonById(id: string, lang: Language): LeccionData | undefined {
  return ALL_LESSONS[lang]?.[id] || ALL_LESSONS.es[id];
}

export function getAllLessons(lang: Language): Record<string, LeccionData> {
  return ALL_LESSONS[lang] || ALL_LESSONS.es;
}
