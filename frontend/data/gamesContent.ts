import { Language } from './educationContent';

interface Paso { numero: number; titulo: string; instrucciones: string; }

interface GameData {
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

const DB: Record<Language, Record<string, GameData>> = {
  es: {
    'puzzle-mental': {
      id: 'puzzle-mental', titulo: 'Puzzle Mental',
      descripcion: 'Estimula la mente de tu perro con juegos de busqueda de premios escondidos.',
      dificultad: 'Media', duracion: '15-20 min',
      beneficios: ['Estimulacion mental intensa', 'Reduce el aburrimiento', 'Mejora la concentracion', 'Cansa sin ejercicio fisico intenso'],
      materialesNecesarios: ['Premios pequenos o croquetas', 'Toalla o manta', 'Vasos de plastico o cajas pequenas', 'Opcional: juguete puzzle comercial'],
      pasos: [
        { numero: 1, titulo: 'Preparacion', instrucciones: 'Reune los materiales y elige un espacio tranquilo. Asegurate de que tu perro tenga hambre moderada.' },
        { numero: 2, titulo: 'Nivel Facil', instrucciones: 'Coloca premios bajo una toalla con las esquinas levantadas. Deja que tu perro los encuentre.' },
        { numero: 3, titulo: 'Nivel Medio', instrucciones: 'Esconde premios bajo vasos boca abajo. Tu perro debe voltearlos para encontrar la recompensa.' },
        { numero: 4, titulo: 'Nivel Dificil', instrucciones: 'Enrolla premios dentro de la toalla. Tu perro debe desenrollar para acceder a ellos.' },
        { numero: 5, titulo: 'Celebracion', instrucciones: 'Felicita a tu perro efusivamente cuando complete cada nivel!' },
      ],
      consejos: ['Empieza siempre por el nivel mas facil', 'No dejes a tu perro solo con materiales que pueda tragar', 'Aumenta la dificultad gradualmente', 'Limita las sesiones a 15-20 minutos'],
      xp: 25, imagen: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=600',
    },
    'tira-afloja': {
      id: 'tira-afloja', titulo: 'Tira y Afloja',
      descripcion: 'Un juego clasico que fortalece el vinculo y permite canalizar energia.',
      dificultad: 'Facil', duracion: '10-15 min',
      beneficios: ['Ejercicio fisico moderado', 'Fortalece el vinculo', 'Ensena autocontrol', 'Reduce el estres acumulado'],
      materialesNecesarios: ['Juguete de cuerda resistente', 'Espacio suficiente', 'Premios para recompensar el "suelta"'],
      pasos: [
        { numero: 1, titulo: 'La Invitacion', instrucciones: 'Muestra el juguete y muevelo por el suelo. Di "Juega!" cuando tu perro lo muerda.' },
        { numero: 2, titulo: 'El Juego', instrucciones: 'Tira suavemente en diferentes direcciones. No levantes el juguete.' },
        { numero: 3, titulo: 'La Pausa', instrucciones: 'Cada 30 segundos, deja de tirar y di "Suelta". Espera y recompensa.' },
        { numero: 4, titulo: 'Reinicio', instrucciones: 'Una vez suelte, di "Juega!" y continua.' },
        { numero: 5, titulo: 'Fin del Juego', instrucciones: 'Termina siempre tu la sesion. Di "Suelta" y guarda el juguete.' },
      ],
      consejos: ['Nunca dejes que tu perro inicie el juego sin permiso', 'Si los dientes tocan tu mano, di "Ay!" y detente 10 segundos', 'El juguete de tira es solo para este juego', 'No juegues si tu perro esta muy excitado'],
      xp: 15, imagen: 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=600',
    },
  },
  en: {
    'puzzle-mental': {
      id: 'puzzle-mental', titulo: 'Mental Puzzle',
      descripcion: 'Stimulate your dog\'s mind with hidden treat search games.',
      dificultad: 'Medium', duracion: '15-20 min',
      beneficios: ['Intense mental stimulation', 'Reduces boredom', 'Improves concentration', 'Tires without intense physical exercise'],
      materialesNecesarios: ['Small treats or kibble', 'Towel or blanket', 'Plastic cups or small boxes', 'Optional: commercial puzzle toy'],
      pasos: [
        { numero: 1, titulo: 'Preparation', instrucciones: 'Gather materials and choose a quiet space. Make sure your dog is moderately hungry.' },
        { numero: 2, titulo: 'Easy Level', instrucciones: 'Place treats under a towel with corners raised. Let your dog find them.' },
        { numero: 3, titulo: 'Medium Level', instrucciones: 'Hide treats under upside-down cups. Your dog must flip them to find the reward.' },
        { numero: 4, titulo: 'Hard Level', instrucciones: 'Roll treats inside the towel. Your dog must unroll it to access them.' },
        { numero: 5, titulo: 'Celebration', instrucciones: 'Praise your dog enthusiastically when they complete each level!' },
      ],
      consejos: ['Always start with the easiest level', 'Don\'t leave your dog alone with materials they could swallow', 'Increase difficulty gradually', 'Limit sessions to 15-20 minutes'],
      xp: 25, imagen: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=600',
    },
    'tira-afloja': {
      id: 'tira-afloja', titulo: 'Tug of War',
      descripcion: 'A classic game that strengthens the bond and channels energy.',
      dificultad: 'Easy', duracion: '10-15 min',
      beneficios: ['Moderate physical exercise', 'Strengthens the bond', 'Teaches self-control', 'Reduces accumulated stress'],
      materialesNecesarios: ['Sturdy rope toy', 'Enough space', 'Treats to reward "drop it"'],
      pasos: [
        { numero: 1, titulo: 'The Invitation', instrucciones: 'Show the toy and move it on the ground. Say "Play!" when your dog grabs it.' },
        { numero: 2, titulo: 'The Game', instrucciones: 'Pull gently in different directions. Don\'t lift the toy.' },
        { numero: 3, titulo: 'The Pause', instrucciones: 'Every 30 seconds, stop pulling and say "Drop". Wait and reward.' },
        { numero: 4, titulo: 'Restart', instrucciones: 'Once they drop it, say "Play!" and continue.' },
        { numero: 5, titulo: 'End of Game', instrucciones: 'You always end the session. Say "Drop" and put the toy away.' },
      ],
      consejos: ['Never let your dog start the game without permission', 'If teeth touch your hand, say "Ouch!" and stop for 10 seconds', 'The tug toy is only for this game', 'Don\'t play if your dog is overly excited'],
      xp: 15, imagen: 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=600',
    },
  },
  it: {
    'puzzle-mental': {
      id: 'puzzle-mental', titulo: 'Puzzle Mentale',
      descripcion: 'Stimola la mente del tuo cane con giochi di ricerca di premi nascosti.',
      dificultad: 'Media', duracion: '15-20 min',
      beneficios: ['Stimolazione mentale intensa', 'Riduce la noia', 'Migliora la concentrazione', 'Stanca senza esercizio fisico intenso'],
      materialesNecesarios: ['Premi piccoli o crocchette', 'Asciugamano o coperta', 'Bicchieri di plastica o scatoline', 'Opzionale: giocattolo puzzle commerciale'],
      pasos: [
        { numero: 1, titulo: 'Preparazione', instrucciones: 'Raccogli i materiali e scegli uno spazio tranquillo. Assicurati che il cane abbia fame moderata.' },
        { numero: 2, titulo: 'Livello Facile', instrucciones: 'Metti i premi sotto un asciugamano con gli angoli sollevati. Lascia che il cane li trovi.' },
        { numero: 3, titulo: 'Livello Medio', instrucciones: 'Nascondi premi sotto bicchieri capovolti. Il cane deve rovesciarli per trovare la ricompensa.' },
        { numero: 4, titulo: 'Livello Difficile', instrucciones: 'Arrotola i premi nell\'asciugamano. Il cane deve srotolarlo per accedere.' },
        { numero: 5, titulo: 'Celebrazione', instrucciones: 'Festeggia con entusiasmo quando completa ogni livello!' },
      ],
      consejos: ['Inizia sempre dal livello piu facile', 'Non lasciare il cane solo con materiali che potrebbe ingoiare', 'Aumenta la difficolta gradualmente', 'Limita le sessioni a 15-20 minuti'],
      xp: 25, imagen: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=600',
    },
    'tira-afloja': {
      id: 'tira-afloja', titulo: 'Tiro alla Fune',
      descripcion: 'Un gioco classico che rafforza il legame e canalizza l\'energia.',
      dificultad: 'Facile', duracion: '10-15 min',
      beneficios: ['Esercizio fisico moderato', 'Rafforza il legame', 'Insegna l\'autocontrollo', 'Riduce lo stress accumulato'],
      materialesNecesarios: ['Giocattolo di corda resistente', 'Spazio sufficiente', 'Premi per ricompensare il "molla"'],
      pasos: [
        { numero: 1, titulo: 'L\'Invito', instrucciones: 'Mostra il giocattolo e muovilo per terra. Di "Gioca!" quando lo afferra.' },
        { numero: 2, titulo: 'Il Gioco', instrucciones: 'Tira dolcemente in diverse direzioni. Non sollevare il giocattolo.' },
        { numero: 3, titulo: 'La Pausa', instrucciones: 'Ogni 30 secondi, smetti di tirare e di "Molla". Aspetta e premia.' },
        { numero: 4, titulo: 'Riavvio', instrucciones: 'Una volta che molla, di "Gioca!" e continua.' },
        { numero: 5, titulo: 'Fine del Gioco', instrucciones: 'Sei sempre tu a terminare la sessione. Di "Molla" e metti via il giocattolo.' },
      ],
      consejos: ['Mai lasciare che il cane inizi il gioco senza permesso', 'Se i denti toccano la tua mano, di "Ahi!" e fermati 10 secondi', 'Il giocattolo da tiro e solo per questo gioco', 'Non giocare se il cane e troppo eccitato'],
      xp: 15, imagen: 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=600',
    },
  },
};

export const getGameData = (lang: Language, id: string): GameData | undefined => {
  return DB[lang]?.[id] || DB.es[id];
};
