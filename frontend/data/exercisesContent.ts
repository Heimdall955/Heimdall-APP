import { Language } from './educationContent';

interface Ejercicio {
  nombre: string;
  instrucciones: string;
  repeticiones: string;
  tip: string;
}

interface ExerciseData {
  id: string;
  titulo: string;
  subtitulo: string;
  descripcion: string;
  huesos: number;
  color: string;
  icon: string;
  ejercicios: Ejercicio[];
}

const DB: Record<Language, Record<string, ExerciseData>> = {
  es: {
    'senales-basicas': {
      id: 'senales-basicas', titulo: 'Senales Basicas', subtitulo: 'Sentado, Tumbado, Quieto',
      descripcion: 'Los comandos fundamentales que todo perro deberia conocer.',
      huesos: 5, color: '#4CAF50', icon: 'hand-left',
      ejercicios: [
        { nombre: 'Sentado', instrucciones: '1. Sosten un premio cerca de la nariz\n2. Mueve hacia arriba\n3. Su trasero bajara\n4. Di "Sienta" y premia', repeticiones: '10 repeticiones', tip: 'No empujes su trasero' },
        { nombre: 'Tumbado', instrucciones: '1. Desde sentado, lleva premio al suelo\n2. Arrastra formando una "L"\n3. Sus codos tocaran el suelo\n4. Di "Tumba" y premia', repeticiones: '10 repeticiones', tip: 'Si se levanta, vuelve al sentado' },
        { nombre: 'Quieto', instrucciones: '1. Pide sentado o tumbado\n2. Di "Quieto" con palma hacia el\n3. Espera 1 segundo\n4. Premia y libera con "Vale"', repeticiones: '5 repeticiones', tip: 'Empieza con 1 segundo' },
      ],
    },
    'control-impulsos': {
      id: 'control-impulsos', titulo: 'Control de Impulsos', subtitulo: 'Espera, Deja, Suelta',
      descripcion: 'Ejercicios para que tu perro aprenda a controlar sus impulsos.',
      huesos: 10, color: '#9C27B0', icon: 'hourglass',
      ejercicios: [
        { nombre: 'Espera', instrucciones: '1. Pon comida en el suelo\n2. Cubre con la mano\n3. Solo cuando deje de intentar, descubre\n4. Di "Espera" antes', repeticiones: '8 repeticiones', tip: 'Empieza con premios de bajo valor' },
        { nombre: 'Deja', instrucciones: '1. Muestra un premio en mano cerrada\n2. Espera que deje de lamer/tocar\n3. En cuanto se aparte, premia con la otra mano\n4. Anade "Deja" como senal', repeticiones: '10 repeticiones', tip: 'Premia siempre con la OTRA mano' },
        { nombre: 'Suelta', instrucciones: '1. Ofrece un juguete\n2. Cuando lo tenga, muestra un premio\n3. Cuando suelte el juguete di "Suelta"\n4. Da el premio y devuelve el juguete', repeticiones: '6 repeticiones', tip: 'El juguete vuelve = recompensa doble' },
      ],
    },
    'socializacion': {
      id: 'socializacion', titulo: 'Socializacion', subtitulo: 'Perros, Personas, Entornos',
      descripcion: 'Aprende tecnicas para socializar correctamente a tu perro.',
      huesos: 15, color: '#00BFA5', icon: 'people',
      ejercicios: [
        { nombre: 'Observar Perros', instrucciones: '1. Lleva a tu perro a un parque\n2. Manten distancia segura\n3. Premia cuando mire perros con calma\n4. Reduce distancia gradualmente', repeticiones: '3 sesiones de 10 min', tip: 'Si se estresa, aumenta la distancia' },
        { nombre: 'Conocer Personas', instrucciones: '1. Pide a un amigo que se acerque\n2. Que lance premios sin mirar al perro\n3. Deja que el perro se acerque a su ritmo\n4. Premia la interaccion tranquila', repeticiones: '2-3 personas por sesion', tip: 'Nunca fuerces el contacto' },
        { nombre: 'Nuevos Entornos', instrucciones: '1. Visita un lugar nuevo tranquilo\n2. Deja que explore con correa larga\n3. Premia cuando se muestre curioso\n4. Si hay miedo, no fuerces', repeticiones: '1-2 lugares nuevos por semana', tip: 'Lleva muchos premios de alto valor' },
      ],
    },
    'paseos': {
      id: 'paseos', titulo: 'Paseos con Correa', subtitulo: 'Caminar sin tirar',
      descripcion: 'Tu perro aprendera a caminar a tu lado sin tirar de la correa.',
      huesos: 8, color: '#2196F3', icon: 'walk',
      ejercicios: [
        { nombre: 'Junto', instrucciones: '1. Con correa corta, camina\n2. Cuando la correa se tense, para\n3. Espera que te mire\n4. Premia y continua', repeticiones: '15 min de practica', tip: 'La paciencia es la clave' },
        { nombre: 'Cambio Direccion', instrucciones: '1. Camina y gira 180 grados\n2. Di el nombre de tu perro\n3. Premia cuando te siga\n4. Varia las direcciones', repeticiones: '10 cambios', tip: 'Hazlo divertido' },
      ],
    },
    'trucos': {
      id: 'trucos', titulo: 'Trucos Divertidos', subtitulo: 'Dar la pata, Girar, Reverencia',
      descripcion: 'Trucos divertidos que fortalecen el vinculo con tu perro.',
      huesos: 12, color: '#4CAF50', icon: 'star',
      ejercicios: [
        { nombre: 'Dar la Pata', instrucciones: '1. Con tu perro sentado, toca su pata\n2. Cuando la levante, premia\n3. Anade senal "Pata"\n4. Practica con ambas patas', repeticiones: '10 repeticiones', tip: 'Toca suavemente' },
        { nombre: 'Girar', instrucciones: '1. Con un premio, guia su nariz en circulo\n2. Sigue hasta que complete la vuelta\n3. Premia al finalizar\n4. Anade "Gira"', repeticiones: '5 giros por lado', tip: 'Hazlo lentamente al principio' },
      ],
    },
    'clicker': {
      id: 'clicker', titulo: 'Entrenamiento con Clicker', subtitulo: 'Precision y timing',
      descripcion: 'El clicker es una herramienta que marca el momento exacto del comportamiento correcto. Aprende a usarlo.',
      huesos: 10, color: '#9C27B0', icon: 'radio-button-on',
      ejercicios: [
        { nombre: 'Cargar el Clicker', instrucciones: '1. Click + premio inmediato\n2. Repite 20 veces seguidas\n3. Tu perro asociara el sonido con recompensa\n4. Haz esto antes de cualquier otro ejercicio', repeticiones: '20 repeticiones', tip: 'El premio debe llegar en menos de 1 segundo tras el click' },
        { nombre: 'Captura de Sentado', instrucciones: '1. Espera sin hacer nada\n2. Cuando tu perro se siente solo, haz click\n3. Premia inmediatamente\n4. Espera que se levante y vuelva a sentarse', repeticiones: '10 repeticiones', tip: 'No digas nada, solo observa y marca el momento exacto' },
        { nombre: 'Modelado Libre', instrucciones: '1. Pon un objeto nuevo en el suelo\n2. Haz click por cualquier interaccion: mirar, acercarse, tocar\n3. Ve subiendo criterio gradualmente\n4. Tu perro aprendera a ofrecer comportamientos', repeticiones: '5 minutos', tip: 'Acepta cualquier intento al principio, luego pide mas' },
        { nombre: 'Timing Perfecto', instrucciones: '1. Lanza una pelota al aire\n2. Practica hacer click justo cuando llegue al punto mas alto\n3. Despues practica con tu perro\n4. Marca el instante exacto del comportamiento', repeticiones: '15 lanzamientos', tip: 'Practica primero sin el perro para mejorar tu reflejos' },
      ],
    },
    'olfato': {
      id: 'olfato', titulo: 'Juegos de Olfato', subtitulo: 'Estimulacion mental natural',
      descripcion: 'El olfato es el sentido mas poderoso de tu perro. Estos juegos lo cansan mentalmente y le dan confianza.',
      huesos: 15, color: '#00BCD4', icon: 'search',
      ejercicios: [
        { nombre: 'Busqueda en Casa', instrucciones: '1. Esconde 5 premios por una habitacion\n2. Deja que tu perro te vea esconder los primeros\n3. Di "Busca" y deja que los encuentre\n4. Celebra cada hallazgo', repeticiones: '3 rondas', tip: 'Empieza con escondites faciles y visibles' },
        { nombre: 'Juego de Vasos', instrucciones: '1. Pon 3 vasos boca abajo\n2. Esconde un premio bajo uno\n3. Deja que tu perro olfatee\n4. Cuando senale el correcto, levanta el vaso', repeticiones: '10 repeticiones', tip: 'Al principio deja que vea donde lo pones' },
        { nombre: 'Alfombra de Olfateo', instrucciones: '1. Esparce premios en hierba o alfombra\n2. Deja que tu perro olfatee y busque\n3. Aumenta la dificultad con premios mas pequenos\n4. Esto simula la busqueda natural de comida', repeticiones: '5-10 minutos', tip: 'Es un ejercicio excelente para dias de lluvia' },
        { nombre: 'Rastro de Premios', instrucciones: '1. Arrastra un premio oloroso por el suelo\n2. Deja un rastro de 3-5 metros\n3. Pon el premio grande al final\n4. Di "Busca" y guia a tu perro al inicio del rastro', repeticiones: '3 rastros', tip: 'Usa premios muy olorosos como queso o salchicha' },
      ],
    },
  },
  en: {
    'senales-basicas': {
      id: 'senales-basicas', titulo: 'Basic Signals', subtitulo: 'Sit, Down, Stay',
      descripcion: 'The fundamental commands every dog should know.',
      huesos: 5, color: '#4CAF50', icon: 'hand-left',
      ejercicios: [
        { nombre: 'Sit', instrucciones: '1. Hold a treat near the nose\n2. Move it upward\n3. Their rear will lower\n4. Say "Sit" and reward', repeticiones: '10 reps', tip: 'Don\'t push their rear' },
        { nombre: 'Down', instrucciones: '1. From sit, bring treat to the floor\n2. Drag forming an "L"\n3. Their elbows will touch the floor\n4. Say "Down" and reward', repeticiones: '10 reps', tip: 'If they get up, go back to sit' },
        { nombre: 'Stay', instrucciones: '1. Ask for sit or down\n2. Say "Stay" with palm facing them\n3. Wait 1 second\n4. Reward and release with "OK"', repeticiones: '5 reps', tip: 'Start with just 1 second' },
      ],
    },
    'control-impulsos': {
      id: 'control-impulsos', titulo: 'Impulse Control', subtitulo: 'Wait, Leave it, Drop it',
      descripcion: 'Exercises to teach your dog impulse control.',
      huesos: 10, color: '#9C27B0', icon: 'hourglass',
      ejercicios: [
        { nombre: 'Wait', instrucciones: '1. Place food on the ground\n2. Cover with your hand\n3. Only uncover when they stop trying\n4. Say "Wait" before', repeticiones: '8 reps', tip: 'Start with low-value treats' },
        { nombre: 'Leave it', instrucciones: '1. Show a treat in closed hand\n2. Wait for them to stop licking/touching\n3. When they back away, reward with the other hand\n4. Add "Leave it" cue', repeticiones: '10 reps', tip: 'Always reward with the OTHER hand' },
        { nombre: 'Drop it', instrucciones: '1. Offer a toy\n2. When they have it, show a treat\n3. When they drop the toy say "Drop"\n4. Give the treat and return the toy', repeticiones: '6 reps', tip: 'Toy returns = double reward' },
      ],
    },
    'socializacion': {
      id: 'socializacion', titulo: 'Socialization', subtitulo: 'Dogs, People, Environments',
      descripcion: 'Learn proper techniques to socialize your dog.',
      huesos: 15, color: '#00BFA5', icon: 'people',
      ejercicios: [
        { nombre: 'Watch Dogs', instrucciones: '1. Take your dog to a park\n2. Keep a safe distance\n3. Reward when they watch dogs calmly\n4. Gradually reduce distance', repeticiones: '3 sessions of 10 min', tip: 'If stressed, increase distance' },
        { nombre: 'Meet People', instrucciones: '1. Ask a friend to approach\n2. They toss treats without looking at dog\n3. Let the dog approach at their pace\n4. Reward calm interaction', repeticiones: '2-3 people per session', tip: 'Never force contact' },
        { nombre: 'New Places', instrucciones: '1. Visit a quiet new place\n2. Let them explore on a long leash\n3. Reward curious behavior\n4. If afraid, don\'t force', repeticiones: '1-2 new places per week', tip: 'Bring lots of high-value treats' },
      ],
    },
    'paseos': {
      id: 'paseos', titulo: 'Leash Walking', subtitulo: 'Walk without pulling',
      descripcion: 'Your dog will learn to walk by your side without pulling.',
      huesos: 8, color: '#2196F3', icon: 'walk',
      ejercicios: [
        { nombre: 'Heel', instrucciones: '1. With a short leash, walk\n2. When the leash gets tight, stop\n3. Wait for them to look at you\n4. Reward and continue', repeticiones: '15 min practice', tip: 'Patience is key' },
        { nombre: 'Direction Change', instrucciones: '1. Walk and turn 180 degrees\n2. Say your dog\'s name\n3. Reward when they follow\n4. Vary directions', repeticiones: '10 changes', tip: 'Make it fun' },
      ],
    },
    'trucos': {
      id: 'trucos', titulo: 'Fun Tricks', subtitulo: 'Shake, Spin, Bow',
      descripcion: 'Fun tricks that strengthen the bond with your dog.',
      huesos: 12, color: '#4CAF50', icon: 'star',
      ejercicios: [
        { nombre: 'Shake', instrucciones: '1. With your dog sitting, touch their paw\n2. When they lift it, reward\n3. Add "Shake" cue\n4. Practice with both paws', repeticiones: '10 reps', tip: 'Touch gently' },
        { nombre: 'Spin', instrucciones: '1. With a treat, guide their nose in a circle\n2. Follow until they complete the turn\n3. Reward at the end\n4. Add "Spin"', repeticiones: '5 spins each way', tip: 'Go slowly at first' },
      ],
    },
    'clicker': {
      id: 'clicker', titulo: 'Clicker Training', subtitulo: 'Precision and timing',
      descripcion: 'The clicker marks the exact moment of the correct behavior. Learn to use it effectively.',
      huesos: 10, color: '#9C27B0', icon: 'radio-button-on',
      ejercicios: [
        { nombre: 'Load the Clicker', instrucciones: '1. Click + immediate treat\n2. Repeat 20 times in a row\n3. Your dog will associate the sound with reward\n4. Do this before any other exercise', repeticiones: '20 reps', tip: 'The treat must come within 1 second of the click' },
        { nombre: 'Capture a Sit', instrucciones: '1. Wait without doing anything\n2. When your dog sits on their own, click\n3. Reward immediately\n4. Wait for them to stand and sit again', repeticiones: '10 reps', tip: 'Say nothing, just watch and mark the exact moment' },
        { nombre: 'Free Shaping', instrucciones: '1. Place a new object on the floor\n2. Click for any interaction: looking, approaching, touching\n3. Gradually raise criteria\n4. Your dog will learn to offer behaviors', repeticiones: '5 minutes', tip: 'Accept any attempt at first, then ask for more' },
        { nombre: 'Perfect Timing', instrucciones: '1. Toss a ball in the air\n2. Practice clicking right when it reaches the highest point\n3. Then practice with your dog\n4. Mark the exact instant of the behavior', repeticiones: '15 tosses', tip: 'Practice without the dog first to improve your reflexes' },
      ],
    },
    'olfato': {
      id: 'olfato', titulo: 'Scent Games', subtitulo: 'Natural mental stimulation',
      descripcion: 'Scent is your dog\'s most powerful sense. These games tire them mentally and build confidence.',
      huesos: 15, color: '#00BCD4', icon: 'search',
      ejercicios: [
        { nombre: 'Indoor Search', instrucciones: '1. Hide 5 treats around a room\n2. Let your dog see you hide the first ones\n3. Say "Find it" and let them search\n4. Celebrate each find', repeticiones: '3 rounds', tip: 'Start with easy, visible hiding spots' },
        { nombre: 'Cup Game', instrucciones: '1. Place 3 cups upside down\n2. Hide a treat under one\n3. Let your dog sniff\n4. When they indicate the right one, lift the cup', repeticiones: '10 reps', tip: 'At first, let them see where you put it' },
        { nombre: 'Snuffle Mat', instrucciones: '1. Scatter treats in grass or on a mat\n2. Let your dog sniff and search\n3. Increase difficulty with smaller treats\n4. This simulates natural foraging', repeticiones: '5-10 minutes', tip: 'Great exercise for rainy days' },
        { nombre: 'Treat Trail', instrucciones: '1. Drag a smelly treat along the ground\n2. Leave a trail of 3-5 meters\n3. Place a big treat at the end\n4. Say "Find it" and guide your dog to the start', repeticiones: '3 trails', tip: 'Use very smelly treats like cheese or sausage' },
      ],
    },
  },
  it: {
    'senales-basicas': {
      id: 'senales-basicas', titulo: 'Segnali Base', subtitulo: 'Seduto, Terra, Fermo',
      descripcion: 'I comandi fondamentali che ogni cane dovrebbe conoscere.',
      huesos: 5, color: '#4CAF50', icon: 'hand-left',
      ejercicios: [
        { nombre: 'Seduto', instrucciones: '1. Tieni un premio vicino al naso\n2. Muovilo verso l\'alto\n3. Il sedere si abbassera\n4. Di "Seduto" e premia', repeticiones: '10 ripetizioni', tip: 'Non spingere il sedere' },
        { nombre: 'Terra', instrucciones: '1. Da seduto, porta il premio al pavimento\n2. Trascina formando una "L"\n3. I gomiti toccheranno il suolo\n4. Di "Terra" e premia', repeticiones: '10 ripetizioni', tip: 'Se si alza, torna al seduto' },
        { nombre: 'Fermo', instrucciones: '1. Chiedi seduto o terra\n2. Di "Fermo" con il palmo verso di lui\n3. Aspetta 1 secondo\n4. Premia e libera con "Via"', repeticiones: '5 ripetizioni', tip: 'Inizia con 1 secondo' },
      ],
    },
    'control-impulsos': {
      id: 'control-impulsos', titulo: 'Controllo degli Impulsi', subtitulo: 'Aspetta, Lascia, Molla',
      descripcion: 'Esercizi per insegnare al tuo cane l\'autocontrollo.',
      huesos: 10, color: '#9C27B0', icon: 'hourglass',
      ejercicios: [
        { nombre: 'Aspetta', instrucciones: '1. Metti il cibo per terra\n2. Coprilo con la mano\n3. Solo quando smette di provare, scopri\n4. Di "Aspetta" prima', repeticiones: '8 ripetizioni', tip: 'Inizia con premi di basso valore' },
        { nombre: 'Lascia', instrucciones: '1. Mostra un premio nel pugno chiuso\n2. Aspetta che smetta di leccare/toccare\n3. Quando si allontana, premia con l\'altra mano\n4. Aggiungi "Lascia"', repeticiones: '10 ripetizioni', tip: 'Premia sempre con l\'ALTRA mano' },
        { nombre: 'Molla', instrucciones: '1. Offri un giocattolo\n2. Quando lo ha, mostra un premio\n3. Quando molla il giocattolo di "Molla"\n4. Dai il premio e restituisci il giocattolo', repeticiones: '6 ripetizioni', tip: 'Giocattolo ritorna = doppia ricompensa' },
      ],
    },
    'socializacion': {
      id: 'socializacion', titulo: 'Socializzazione', subtitulo: 'Cani, Persone, Ambienti',
      descripcion: 'Impara le tecniche per socializzare correttamente il tuo cane.',
      huesos: 15, color: '#00BFA5', icon: 'people',
      ejercicios: [
        { nombre: 'Osservare Cani', instrucciones: '1. Porta il tuo cane al parco\n2. Mantieni una distanza sicura\n3. Premia quando guarda i cani con calma\n4. Riduci gradualmente la distanza', repeticiones: '3 sessioni da 10 min', tip: 'Se e stressato, aumenta la distanza' },
        { nombre: 'Incontrare Persone', instrucciones: '1. Chiedi a un amico di avvicinarsi\n2. Che lanci premi senza guardare il cane\n3. Lascia che il cane si avvicini al suo ritmo\n4. Premia l\'interazione tranquilla', repeticiones: '2-3 persone per sessione', tip: 'Mai forzare il contatto' },
        { nombre: 'Nuovi Ambienti', instrucciones: '1. Visita un posto nuovo e tranquillo\n2. Lascialo esplorare con guinzaglio lungo\n3. Premia quando si mostra curioso\n4. Se ha paura, non forzare', repeticiones: '1-2 posti nuovi a settimana', tip: 'Porta molti premi di alto valore' },
      ],
    },
    'paseos': {
      id: 'paseos', titulo: 'Passeggiata al Guinzaglio', subtitulo: 'Camminare senza tirare',
      descripcion: 'Il tuo cane imparera a camminare al tuo fianco senza tirare.',
      huesos: 8, color: '#2196F3', icon: 'walk',
      ejercicios: [
        { nombre: 'Al Piede', instrucciones: '1. Con guinzaglio corto, cammina\n2. Quando il guinzaglio si tende, fermati\n3. Aspetta che ti guardi\n4. Premia e continua', repeticiones: '15 min di pratica', tip: 'La pazienza e la chiave' },
        { nombre: 'Cambio Direzione', instrucciones: '1. Cammina e gira di 180 gradi\n2. Di il nome del tuo cane\n3. Premia quando ti segue\n4. Varia le direzioni', repeticiones: '10 cambi', tip: 'Rendilo divertente' },
      ],
    },
    'trucos': {
      id: 'trucos', titulo: 'Trucchi Divertenti', subtitulo: 'Zampa, Gira, Inchino',
      descripcion: 'Trucchi divertenti che rafforzano il legame con il tuo cane.',
      huesos: 12, color: '#4CAF50', icon: 'star',
      ejercicios: [
        { nombre: 'Zampa', instrucciones: '1. Con il cane seduto, tocca la sua zampa\n2. Quando la alza, premia\n3. Aggiungi il segnale "Zampa"\n4. Pratica con entrambe le zampe', repeticiones: '10 ripetizioni', tip: 'Tocca delicatamente' },
        { nombre: 'Gira', instrucciones: '1. Con un premio, guida il naso in cerchio\n2. Continua finche non completa il giro\n3. Premia alla fine\n4. Aggiungi "Gira"', repeticiones: '5 giri per lato', tip: 'Fallo lentamente all\'inizio' },
      ],
    },
    'clicker': {
      id: 'clicker', titulo: 'Addestramento con Clicker', subtitulo: 'Precisione e timing',
      descripcion: 'Il clicker marca il momento esatto del comportamento corretto. Impara ad usarlo efficacemente.',
      huesos: 10, color: '#9C27B0', icon: 'radio-button-on',
      ejercicios: [
        { nombre: 'Caricare il Clicker', instrucciones: '1. Click + premio immediato\n2. Ripeti 20 volte di fila\n3. Il tuo cane associera il suono alla ricompensa\n4. Fallo prima di qualsiasi altro esercizio', repeticiones: '20 ripetizioni', tip: 'Il premio deve arrivare entro 1 secondo dal click' },
        { nombre: 'Cattura del Seduto', instrucciones: '1. Aspetta senza fare nulla\n2. Quando il tuo cane si siede da solo, fai click\n3. Premia immediatamente\n4. Aspetta che si alzi e si risieda', repeticiones: '10 ripetizioni', tip: 'Non dire niente, osserva e marca il momento esatto' },
        { nombre: 'Modellamento Libero', instrucciones: '1. Metti un oggetto nuovo per terra\n2. Fai click per qualsiasi interazione: guardare, avvicinarsi, toccare\n3. Alza gradualmente i criteri\n4. Il tuo cane imparera a offrire comportamenti', repeticiones: '5 minuti', tip: 'Accetta qualsiasi tentativo all\'inizio' },
        { nombre: 'Timing Perfetto', instrucciones: '1. Lancia una palla in aria\n2. Pratica il click quando raggiunge il punto piu alto\n3. Poi pratica con il tuo cane\n4. Marca l\'istante esatto del comportamento', repeticiones: '15 lanci', tip: 'Pratica prima senza il cane per migliorare i riflessi' },
      ],
    },
    'olfato': {
      id: 'olfato', titulo: 'Giochi di Fiuto', subtitulo: 'Stimolazione mentale naturale',
      descripcion: 'L\'olfatto e il senso piu potente del tuo cane. Questi giochi lo stancano mentalmente e gli danno fiducia.',
      huesos: 15, color: '#00BCD4', icon: 'search',
      ejercicios: [
        { nombre: 'Ricerca in Casa', instrucciones: '1. Nascondi 5 premi in una stanza\n2. Lascia che il cane ti veda nascondere i primi\n3. Di "Cerca" e lascialo cercare\n4. Festeggia ogni ritrovamento', repeticiones: '3 round', tip: 'Inizia con nascondigli facili e visibili' },
        { nombre: 'Gioco dei Bicchieri', instrucciones: '1. Metti 3 bicchieri capovolti\n2. Nascondi un premio sotto uno\n3. Lascia che il cane annusi\n4. Quando indica quello giusto, alza il bicchiere', repeticiones: '10 ripetizioni', tip: 'All\'inizio lascia che veda dove lo metti' },
        { nombre: 'Tappetino Olfattivo', instrucciones: '1. Spargi premi nell\'erba o su un tappetino\n2. Lascia che il cane annusi e cerchi\n3. Aumenta la difficolta con premi piu piccoli\n4. Questo simula la ricerca naturale di cibo', repeticiones: '5-10 minuti', tip: 'Ottimo esercizio per i giorni di pioggia' },
        { nombre: 'Pista di Premi', instrucciones: '1. Trascina un premio odoroso per terra\n2. Lascia una pista di 3-5 metri\n3. Metti un grosso premio alla fine\n4. Di "Cerca" e guida il cane all\'inizio della pista', repeticiones: '3 piste', tip: 'Usa premi molto odorosi come formaggio o wurstel' },
      ],
    },
  },
};

export const getExerciseData = (lang: Language, id: string): ExerciseData | undefined => {
  return DB[lang]?.[id] || DB.es[id];
};

export const getAllExerciseIds = (): string[] => Object.keys(DB.es);
