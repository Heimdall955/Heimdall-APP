// Education content translations
// This file contains all the educational content in multiple languages

export type Language = 'es' | 'en' | 'it';

interface TrainingProgram {
  id: string;
  title: string;
  subtitle: string;
  category: string;
  categoryColor: string;
  xpReward: number;
  image: string;
}

interface Exercise {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  iconColor: string;
  xpReward: number;
}

interface Game {
  id: string;
  title: string;
  difficulty: string;
  xpReward: number;
  image: string;
}

export const getTrainingPrograms = (lang: Language): TrainingProgram[] => {
  const programs: Record<Language, TrainingProgram[]> = {
    es: [
      { id: 'educacion-basica', title: 'Educación Básica', subtitle: 'Fundamentos sólidos', category: 'Básico', categoryColor: '#4CAF50', xpReward: 100, image: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=400' },
      { id: 'calma-control', title: 'Calma y Control', subtitle: 'Gestión del estrés', category: 'Emocional', categoryColor: '#FF9800', xpReward: 120, image: 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=400' },
      { id: 'socializacion', title: 'Socialización', subtitle: 'Amigos caninos', category: 'Social', categoryColor: '#2196F3', xpReward: 150, image: 'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=400' },
      { id: 'mundo-cachorro', title: 'Mundo Cachorro', subtitle: 'Primeros pasos', category: 'Cachorros', categoryColor: '#E91E63', xpReward: 80, image: 'https://images.unsplash.com/photo-1591160690555-5debfba289f0?w=400' },
    ],
    en: [
      { id: 'educacion-basica', title: 'Basic Training', subtitle: 'Solid foundations', category: 'Basic', categoryColor: '#4CAF50', xpReward: 100, image: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=400' },
      { id: 'calma-control', title: 'Calm & Control', subtitle: 'Stress management', category: 'Emotional', categoryColor: '#FF9800', xpReward: 120, image: 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=400' },
      { id: 'socializacion', title: 'Socialization', subtitle: 'Canine friends', category: 'Social', categoryColor: '#2196F3', xpReward: 150, image: 'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=400' },
      { id: 'mundo-cachorro', title: 'Puppy World', subtitle: 'First steps', category: 'Puppies', categoryColor: '#E91E63', xpReward: 80, image: 'https://images.unsplash.com/photo-1591160690555-5debfba289f0?w=400' },
    ],
    it: [
      { id: 'educacion-basica', title: 'Educazione Base', subtitle: 'Fondamenti solidi', category: 'Base', categoryColor: '#4CAF50', xpReward: 100, image: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=400' },
      { id: 'calma-control', title: 'Calma e Controllo', subtitle: 'Gestione dello stress', category: 'Emotivo', categoryColor: '#FF9800', xpReward: 120, image: 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=400' },
      { id: 'socializacion', title: 'Socializzazione', subtitle: 'Amici canini', category: 'Sociale', categoryColor: '#2196F3', xpReward: 150, image: 'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=400' },
      { id: 'mundo-cachorro', title: 'Mondo Cucciolo', subtitle: 'Primi passi', category: 'Cuccioli', categoryColor: '#E91E63', xpReward: 80, image: 'https://images.unsplash.com/photo-1591160690555-5debfba289f0?w=400' },
    ],
  };
  return programs[lang] || programs.es;
};

export const getExercises = (lang: Language): Exercise[] => {
  const exercises: Record<Language, Exercise[]> = {
    es: [
      { id: 'senales-basicas', title: 'Señales Básicas', subtitle: 'Sentado, Tumbado, Quieto', icon: 'paw', iconColor: '#2196F3', xpReward: 5 },
      { id: 'clicker', title: 'Entrenamiento con Clicker', subtitle: 'Precisión y timing', icon: 'radio-button-on', iconColor: '#9C27B0', xpReward: 10 },
      { id: 'olfato', title: 'Juegos de Olfato', subtitle: 'Estimulación mental natural', icon: 'search', iconColor: '#00BCD4', xpReward: 15 },
    ],
    en: [
      { id: 'senales-basicas', title: 'Basic Signals', subtitle: 'Sit, Down, Stay', icon: 'paw', iconColor: '#2196F3', xpReward: 5 },
      { id: 'clicker', title: 'Clicker Training', subtitle: 'Precision and timing', icon: 'radio-button-on', iconColor: '#9C27B0', xpReward: 10 },
      { id: 'olfato', title: 'Scent Games', subtitle: 'Natural mental stimulation', icon: 'search', iconColor: '#00BCD4', xpReward: 15 },
    ],
    it: [
      { id: 'senales-basicas', title: 'Segnali Base', subtitle: 'Seduto, Terra, Fermo', icon: 'paw', iconColor: '#2196F3', xpReward: 5 },
      { id: 'clicker', title: 'Addestramento con Clicker', subtitle: 'Precisione e timing', icon: 'radio-button-on', iconColor: '#9C27B0', xpReward: 10 },
      { id: 'olfato', title: 'Giochi di Fiuto', subtitle: 'Stimolazione mentale naturale', icon: 'search', iconColor: '#00BCD4', xpReward: 15 },
    ],
  };
  return exercises[lang] || exercises.es;
};

export const getGames = (lang: Language): Game[] => {
  const games: Record<Language, Game[]> = {
    es: [
      { id: 'puzzle-mental', title: 'Puzzle Mental', difficulty: 'Media', xpReward: 5, image: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=200' },
      { id: 'tira-afloja', title: 'Tira y Afloja', difficulty: 'Fácil', xpReward: 3, image: 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=200' },
    ],
    en: [
      { id: 'puzzle-mental', title: 'Mental Puzzle', difficulty: 'Medium', xpReward: 5, image: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=200' },
      { id: 'tira-afloja', title: 'Tug of War', difficulty: 'Easy', xpReward: 3, image: 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=200' },
    ],
    it: [
      { id: 'puzzle-mental', title: 'Puzzle Mentale', difficulty: 'Media', xpReward: 5, image: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=200' },
      { id: 'tira-afloja', title: 'Tiro alla Fune', difficulty: 'Facile', xpReward: 3, image: 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=200' },
    ],
  };
  return games[lang] || games.es;
};

export default { getTrainingPrograms, getExercises, getGames };
