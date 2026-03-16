import { Language } from './educationContent';

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

const DB: Record<Language, Record<string, Programa>> = {
  es: {
    'educacion-basica': {
      id: 'educacion-basica', titulo: 'Educacion Basica', subtitulo: 'Fundamentos solidos para tu perro',
      descripcion: 'Aprende las bases del adiestramiento canino con tecnicas de refuerzo positivo. Este programa te guiara paso a paso para establecer una comunicacion efectiva con tu perro.',
      categoria: 'Basico', categoriaColor: '#4CAF50', imagen: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=600', duracionTotal: '4 semanas',
      lecciones: [
        { id: 'refuerzo-positivo', titulo: 'Introduccion al Refuerzo Positivo', descripcion: 'Fundamentos del entrenamiento', duracion: '15 min', xp: 20, completada: false },
        { id: 'sentado-basico', titulo: 'El Comando "Sienta"', descripcion: 'Primera senal basica', duracion: '20 min', xp: 25, completada: false },
        { id: 'quieto', titulo: 'El Comando "Quieto"', descripcion: 'Control y paciencia', duracion: '25 min', xp: 30, completada: false },
        { id: 'llamada-perfecta', titulo: 'La Llamada Perfecta', descripcion: 'El comando "Ven"', duracion: '20 min', xp: 25, completada: false },
        { id: 'tumbado', titulo: 'El Comando "Tumba"', descripcion: 'Posicion de relajacion', duracion: '20 min', xp: 25, completada: false },
        { id: 'paseo-correa', titulo: 'Paseo con Correa', descripcion: 'Caminar sin tirones', duracion: '30 min', xp: 35, completada: false },
      ],
      objetivos: ['Establecer comunicacion clara con tu perro', 'Dominar los 5 comandos basicos', 'Crear rutinas de entrenamiento diarias', 'Pasear sin tirones de correa'],
    },
    'calma-control': {
      id: 'calma-control', titulo: 'Calma y Control', subtitulo: 'Gestion del estres canino',
      descripcion: 'Tecnicas especializadas para ayudar a tu perro a manejar la ansiedad y el estres. Ideal para perros reactivos o que se sobreexcitan facilmente.',
      categoria: 'Emocional', categoriaColor: '#FF9800', imagen: 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=600', duracionTotal: '3 semanas',
      lecciones: [
        { id: 'estres-canino', titulo: 'Entender el Estres Canino', descripcion: 'Senales y causas', duracion: '15 min', xp: 20, completada: false },
        { id: 'relajacion', titulo: 'Tecnicas de Relajacion', descripcion: 'Ejercicios calmantes', duracion: '25 min', xp: 30, completada: false },
        { id: 'lugar-seguro', titulo: 'El Lugar Seguro', descripcion: 'Crear un refugio', duracion: '20 min', xp: 25, completada: false },
        { id: 'desensibilizacion', titulo: 'Desensibilizacion', descripcion: 'Reducir la reactividad', duracion: '30 min', xp: 35, completada: false },
        { id: 'rutinas-calmantes', titulo: 'Rutinas Calmantes', descripcion: 'Establecer paz diaria', duracion: '20 min', xp: 25, completada: false },
      ],
      objetivos: ['Identificar senales de estres en tu perro', 'Aplicar tecnicas de relajacion efectivas', 'Crear un ambiente tranquilo en casa', 'Manejar situaciones de alta excitacion'],
    },
    'socializacion': {
      id: 'socializacion', titulo: 'Socializacion', subtitulo: 'Amigos caninos y humanos',
      descripcion: 'Programa completo para mejorar las habilidades sociales de tu perro. Aprenderas a presentar nuevos perros, personas y situaciones de forma segura.',
      categoria: 'Social', categoriaColor: '#2196F3', imagen: 'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=600', duracionTotal: '5 semanas',
      lecciones: [
        { id: 'ventana-socializacion', titulo: 'La Ventana de Socializacion', descripcion: 'Periodos criticos', duracion: '15 min', xp: 20, completada: false },
        { id: 'presentaciones-perros', titulo: 'Presentaciones Seguras', descripcion: 'Conocer otros perros', duracion: '25 min', xp: 30, completada: false },
        { id: 'interaccion-humanos', titulo: 'Interaccion con Humanos', descripcion: 'Saludos apropiados', duracion: '20 min', xp: 25, completada: false },
        { id: 'nuevos-entornos', titulo: 'Nuevos Entornos', descripcion: 'Explorar con confianza', duracion: '25 min', xp: 30, completada: false },
        { id: 'sonidos-estimulos', titulo: 'Sonidos y Estimulos', descripcion: 'Habituacion gradual', duracion: '20 min', xp: 25, completada: false },
        { id: 'parque-canino', titulo: 'El Parque Canino', descripcion: 'Juego social seguro', duracion: '30 min', xp: 35, completada: false },
      ],
      objetivos: ['Mejorar la confianza social de tu perro', 'Realizar presentaciones seguras con otros perros', 'Ensenar saludos apropiados con personas', 'Explorar nuevos lugares sin miedo'],
    },
    'mundo-cachorro': {
      id: 'mundo-cachorro', titulo: 'Mundo Cachorro', subtitulo: 'Primeros pasos juntos',
      descripcion: 'Todo lo que necesitas saber para criar un cachorro feliz y equilibrado. Desde el primer dia en casa hasta los 6 meses de edad.',
      categoria: 'Cachorros', categoriaColor: '#E91E63', imagen: 'https://images.unsplash.com/photo-1591160690555-5debfba289f0?w=600', duracionTotal: '6 semanas',
      lecciones: [
        { id: 'bienvenido-casa', titulo: 'Bienvenido a Casa', descripcion: 'El primer dia', duracion: '15 min', xp: 20, completada: false },
        { id: 'rutina-cachorro', titulo: 'Rutina del Cachorro', descripcion: 'Horarios y habitos', duracion: '20 min', xp: 25, completada: false },
        { id: 'inhibicion-mordisco', titulo: 'Inhibicion del Mordisco', descripcion: 'Boca suave', duracion: '25 min', xp: 30, completada: false },
        { id: 'necesidades', titulo: 'Ensenar a Hacer Sus Necesidades', descripcion: 'Entrenamiento de bano', duracion: '25 min', xp: 30, completada: false },
        { id: 'socializacion-temprana', titulo: 'Socializacion Temprana', descripcion: 'Experiencias positivas', duracion: '20 min', xp: 25, completada: false },
        { id: 'juego-apropiado', titulo: 'Juego Apropiado', descripcion: 'Diversion segura', duracion: '20 min', xp: 25, completada: false },
        { id: 'quedarse-solo', titulo: 'Quedarse Solo', descripcion: 'Prevenir ansiedad', duracion: '25 min', xp: 30, completada: false },
      ],
      objetivos: ['Establecer rutinas saludables desde el inicio', 'Ensenar inhibicion del mordisco', 'Completar entrenamiento de bano', 'Socializar correctamente al cachorro', 'Prevenir problemas de comportamiento'],
    },
  },
  en: {
    'educacion-basica': {
      id: 'educacion-basica', titulo: 'Basic Training', subtitulo: 'Solid foundations for your dog',
      descripcion: 'Learn the basics of dog training with positive reinforcement techniques. This program will guide you step by step to establish effective communication with your dog.',
      categoria: 'Basic', categoriaColor: '#4CAF50', imagen: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=600', duracionTotal: '4 weeks',
      lecciones: [
        { id: 'refuerzo-positivo', titulo: 'Introduction to Positive Reinforcement', descripcion: 'Training fundamentals', duracion: '15 min', xp: 20, completada: false },
        { id: 'sentado-basico', titulo: 'The "Sit" Command', descripcion: 'First basic signal', duracion: '20 min', xp: 25, completada: false },
        { id: 'quieto', titulo: 'The "Stay" Command', descripcion: 'Control and patience', duracion: '25 min', xp: 30, completada: false },
        { id: 'llamada-perfecta', titulo: 'The Perfect Recall', descripcion: 'The "Come" command', duracion: '20 min', xp: 25, completada: false },
        { id: 'tumbado', titulo: 'The "Down" Command', descripcion: 'Relaxation position', duracion: '20 min', xp: 25, completada: false },
        { id: 'paseo-correa', titulo: 'Leash Walking', descripcion: 'Walking without pulling', duracion: '30 min', xp: 35, completada: false },
      ],
      objetivos: ['Establish clear communication with your dog', 'Master the 5 basic commands', 'Create daily training routines', 'Walk without leash pulling'],
    },
    'calma-control': {
      id: 'calma-control', titulo: 'Calm & Control', subtitulo: 'Canine stress management',
      descripcion: 'Specialized techniques to help your dog manage anxiety and stress. Ideal for reactive dogs or those that get overexcited easily.',
      categoria: 'Emotional', categoriaColor: '#FF9800', imagen: 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=600', duracionTotal: '3 weeks',
      lecciones: [
        { id: 'estres-canino', titulo: 'Understanding Canine Stress', descripcion: 'Signs and causes', duracion: '15 min', xp: 20, completada: false },
        { id: 'relajacion', titulo: 'Relaxation Techniques', descripcion: 'Calming exercises', duracion: '25 min', xp: 30, completada: false },
        { id: 'lugar-seguro', titulo: 'The Safe Place', descripcion: 'Creating a refuge', duracion: '20 min', xp: 25, completada: false },
        { id: 'desensibilizacion', titulo: 'Desensitization', descripcion: 'Reducing reactivity', duracion: '30 min', xp: 35, completada: false },
        { id: 'rutinas-calmantes', titulo: 'Calming Routines', descripcion: 'Establishing daily peace', duracion: '20 min', xp: 25, completada: false },
      ],
      objetivos: ['Identify stress signals in your dog', 'Apply effective relaxation techniques', 'Create a calm home environment', 'Handle high excitement situations'],
    },
    'socializacion': {
      id: 'socializacion', titulo: 'Socialization', subtitulo: 'Canine and human friends',
      descripcion: 'Complete program to improve your dog\'s social skills. You\'ll learn to introduce new dogs, people, and situations safely.',
      categoria: 'Social', categoriaColor: '#2196F3', imagen: 'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=600', duracionTotal: '5 weeks',
      lecciones: [
        { id: 'ventana-socializacion', titulo: 'The Socialization Window', descripcion: 'Critical periods', duracion: '15 min', xp: 20, completada: false },
        { id: 'presentaciones-perros', titulo: 'Safe Introductions', descripcion: 'Meeting other dogs', duracion: '25 min', xp: 30, completada: false },
        { id: 'interaccion-humanos', titulo: 'Human Interaction', descripcion: 'Proper greetings', duracion: '20 min', xp: 25, completada: false },
        { id: 'nuevos-entornos', titulo: 'New Environments', descripcion: 'Exploring with confidence', duracion: '25 min', xp: 30, completada: false },
        { id: 'sonidos-estimulos', titulo: 'Sounds & Stimuli', descripcion: 'Gradual habituation', duracion: '20 min', xp: 25, completada: false },
        { id: 'parque-canino', titulo: 'The Dog Park', descripcion: 'Safe social play', duracion: '30 min', xp: 35, completada: false },
      ],
      objetivos: ['Improve your dog\'s social confidence', 'Make safe introductions with other dogs', 'Teach proper greetings with people', 'Explore new places without fear'],
    },
    'mundo-cachorro': {
      id: 'mundo-cachorro', titulo: 'Puppy World', subtitulo: 'First steps together',
      descripcion: 'Everything you need to know to raise a happy and balanced puppy. From the first day home to 6 months of age.',
      categoria: 'Puppies', categoriaColor: '#E91E63', imagen: 'https://images.unsplash.com/photo-1591160690555-5debfba289f0?w=600', duracionTotal: '6 weeks',
      lecciones: [
        { id: 'bienvenido-casa', titulo: 'Welcome Home', descripcion: 'The first day', duracion: '15 min', xp: 20, completada: false },
        { id: 'rutina-cachorro', titulo: 'Puppy Routine', descripcion: 'Schedules and habits', duracion: '20 min', xp: 25, completada: false },
        { id: 'inhibicion-mordisco', titulo: 'Bite Inhibition', descripcion: 'Soft mouth', duracion: '25 min', xp: 30, completada: false },
        { id: 'necesidades', titulo: 'Potty Training', descripcion: 'Bathroom training', duracion: '25 min', xp: 30, completada: false },
        { id: 'socializacion-temprana', titulo: 'Early Socialization', descripcion: 'Positive experiences', duracion: '20 min', xp: 25, completada: false },
        { id: 'juego-apropiado', titulo: 'Appropriate Play', descripcion: 'Safe fun', duracion: '20 min', xp: 25, completada: false },
        { id: 'quedarse-solo', titulo: 'Staying Alone', descripcion: 'Preventing anxiety', duracion: '25 min', xp: 30, completada: false },
      ],
      objetivos: ['Establish healthy routines from the start', 'Teach bite inhibition', 'Complete potty training', 'Properly socialize the puppy', 'Prevent behavior problems'],
    },
  },
  it: {
    'educacion-basica': {
      id: 'educacion-basica', titulo: 'Educazione Base', subtitulo: 'Fondamenti solidi per il tuo cane',
      descripcion: 'Impara le basi dell\'addestramento cinofilo con tecniche di rinforzo positivo. Questo programma ti guidera passo dopo passo per stabilire una comunicazione efficace con il tuo cane.',
      categoria: 'Base', categoriaColor: '#4CAF50', imagen: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=600', duracionTotal: '4 settimane',
      lecciones: [
        { id: 'refuerzo-positivo', titulo: 'Introduzione al Rinforzo Positivo', descripcion: 'Fondamenti dell\'addestramento', duracion: '15 min', xp: 20, completada: false },
        { id: 'sentado-basico', titulo: 'Il Comando "Seduto"', descripcion: 'Primo segnale base', duracion: '20 min', xp: 25, completada: false },
        { id: 'quieto', titulo: 'Il Comando "Fermo"', descripcion: 'Controllo e pazienza', duracion: '25 min', xp: 30, completada: false },
        { id: 'llamada-perfecta', titulo: 'Il Richiamo Perfetto', descripcion: 'Il comando "Vieni"', duracion: '20 min', xp: 25, completada: false },
        { id: 'tumbado', titulo: 'Il Comando "Terra"', descripcion: 'Posizione di rilassamento', duracion: '20 min', xp: 25, completada: false },
        { id: 'paseo-correa', titulo: 'Passeggiata al Guinzaglio', descripcion: 'Camminare senza tirare', duracion: '30 min', xp: 35, completada: false },
      ],
      objetivos: ['Stabilire una comunicazione chiara con il tuo cane', 'Padroneggiare i 5 comandi base', 'Creare routine di addestramento quotidiane', 'Passeggiare senza che tiri il guinzaglio'],
    },
    'calma-control': {
      id: 'calma-control', titulo: 'Calma e Controllo', subtitulo: 'Gestione dello stress canino',
      descripcion: 'Tecniche specializzate per aiutare il tuo cane a gestire ansia e stress. Ideale per cani reattivi o che si sovraeccitano facilmente.',
      categoria: 'Emotivo', categoriaColor: '#FF9800', imagen: 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=600', duracionTotal: '3 settimane',
      lecciones: [
        { id: 'estres-canino', titulo: 'Capire lo Stress Canino', descripcion: 'Segnali e cause', duracion: '15 min', xp: 20, completada: false },
        { id: 'relajacion', titulo: 'Tecniche di Rilassamento', descripcion: 'Esercizi calmanti', duracion: '25 min', xp: 30, completada: false },
        { id: 'lugar-seguro', titulo: 'Il Posto Sicuro', descripcion: 'Creare un rifugio', duracion: '20 min', xp: 25, completada: false },
        { id: 'desensibilizacion', titulo: 'Desensibilizzazione', descripcion: 'Ridurre la reattivita', duracion: '30 min', xp: 35, completada: false },
        { id: 'rutinas-calmantes', titulo: 'Routine Calmanti', descripcion: 'Stabilire la pace quotidiana', duracion: '20 min', xp: 25, completada: false },
      ],
      objetivos: ['Identificare i segnali di stress nel tuo cane', 'Applicare tecniche di rilassamento efficaci', 'Creare un ambiente tranquillo a casa', 'Gestire situazioni di alta eccitazione'],
    },
    'socializacion': {
      id: 'socializacion', titulo: 'Socializzazione', subtitulo: 'Amici canini e umani',
      descripcion: 'Programma completo per migliorare le abilita sociali del tuo cane. Imparerai a presentare nuovi cani, persone e situazioni in modo sicuro.',
      categoria: 'Sociale', categoriaColor: '#2196F3', imagen: 'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=600', duracionTotal: '5 settimane',
      lecciones: [
        { id: 'ventana-socializacion', titulo: 'La Finestra di Socializzazione', descripcion: 'Periodi critici', duracion: '15 min', xp: 20, completada: false },
        { id: 'presentaciones-perros', titulo: 'Presentazioni Sicure', descripcion: 'Incontrare altri cani', duracion: '25 min', xp: 30, completada: false },
        { id: 'interaccion-humanos', titulo: 'Interazione con le Persone', descripcion: 'Saluti appropriati', duracion: '20 min', xp: 25, completada: false },
        { id: 'nuevos-entornos', titulo: 'Nuovi Ambienti', descripcion: 'Esplorare con fiducia', duracion: '25 min', xp: 30, completada: false },
        { id: 'sonidos-estimulos', titulo: 'Suoni e Stimoli', descripcion: 'Abituazione graduale', duracion: '20 min', xp: 25, completada: false },
        { id: 'parque-canino', titulo: 'Il Parco Canino', descripcion: 'Gioco sociale sicuro', duracion: '30 min', xp: 35, completada: false },
      ],
      objetivos: ['Migliorare la fiducia sociale del tuo cane', 'Fare presentazioni sicure con altri cani', 'Insegnare saluti appropriati con le persone', 'Esplorare nuovi posti senza paura'],
    },
    'mundo-cachorro': {
      id: 'mundo-cachorro', titulo: 'Mondo Cucciolo', subtitulo: 'Primi passi insieme',
      descripcion: 'Tutto cio che devi sapere per crescere un cucciolo felice ed equilibrato. Dal primo giorno a casa fino ai 6 mesi di eta.',
      categoria: 'Cuccioli', categoriaColor: '#E91E63', imagen: 'https://images.unsplash.com/photo-1591160690555-5debfba289f0?w=600', duracionTotal: '6 settimane',
      lecciones: [
        { id: 'bienvenido-casa', titulo: 'Benvenuto a Casa', descripcion: 'Il primo giorno', duracion: '15 min', xp: 20, completada: false },
        { id: 'rutina-cachorro', titulo: 'Routine del Cucciolo', descripcion: 'Orari e abitudini', duracion: '20 min', xp: 25, completada: false },
        { id: 'inhibicion-mordisco', titulo: 'Inibizione del Morso', descripcion: 'Bocca morbida', duracion: '25 min', xp: 30, completada: false },
        { id: 'necesidades', titulo: 'Insegnare i Bisogni', descripcion: 'Addestramento al bagno', duracion: '25 min', xp: 30, completada: false },
        { id: 'socializacion-temprana', titulo: 'Socializzazione Precoce', descripcion: 'Esperienze positive', duracion: '20 min', xp: 25, completada: false },
        { id: 'juego-apropiado', titulo: 'Gioco Appropriato', descripcion: 'Divertimento sicuro', duracion: '20 min', xp: 25, completada: false },
        { id: 'quedarse-solo', titulo: 'Restare da Solo', descripcion: 'Prevenire l\'ansia', duracion: '25 min', xp: 30, completada: false },
      ],
      objetivos: ['Stabilire routine sane dall\'inizio', 'Insegnare l\'inibizione del morso', 'Completare l\'addestramento al bagno', 'Socializzare correttamente il cucciolo', 'Prevenire problemi comportamentali'],
    },
  },
};

export const getProgramData = (lang: Language, id: string): Programa => {
  return DB[lang]?.[id] || DB.es[id];
};

export const getAllPrograms = (lang: Language): Programa[] => {
  return Object.values(DB[lang] || DB.es);
};

export const getProgramIds = (): string[] => Object.keys(DB.es);
