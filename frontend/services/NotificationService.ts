import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import { SecureStore } from '../utils/secureStore';

const PREFS_KEY = '@heimdall_notification_prefs';

export interface NotificationPrefs {
  training_reminder: boolean;
  emotion_diary: boolean;
  streak_warning: boolean;
  achievements: boolean;
  miss_you: boolean;
}

export const DEFAULT_PREFS: NotificationPrefs = {
  training_reminder: true,
  emotion_diary: true,
  streak_warning: true,
  achievements: true,
  miss_you: true,
};

type Lang = 'es' | 'en' | 'it';

const MESSAGES: Record<string, Record<Lang, { title: string; body: string }[]>> = {
  training: {
    es: [
      { title: 'Hora de entrenar!', body: 'Tu perro te espera para practicar. Cada sesion cuenta!' },
      { title: 'Sesion de hoy', body: 'Un ejercicio rapido al dia marca la diferencia. Vamos!' },
      { title: 'Tu perro te necesita', body: 'Hoy es un gran dia para aprender algo nuevo juntos.' },
      { title: 'Entrenamiento pendiente', body: 'Solo 5 minutos de practica pueden hacer magia. Entra!' },
    ],
    en: [
      { title: 'Time to train!', body: 'Your pet is waiting to practice. Every session counts!' },
      { title: "Today's session", body: 'A quick daily exercise makes all the difference. Let\'s go!' },
      { title: 'Your pet needs you', body: 'Today is a great day to learn something new together.' },
      { title: 'Training pending', body: 'Just 5 minutes of practice can work wonders. Come on in!' },
    ],
    it: [
      { title: 'Ora di allenarsi!', body: 'Il tuo animale ti aspetta per esercitarsi. Ogni sessione conta!' },
      { title: 'Sessione di oggi', body: 'Un esercizio veloce al giorno fa la differenza. Andiamo!' },
      { title: 'Il tuo animale ha bisogno di te', body: 'Oggi e un ottimo giorno per imparare qualcosa di nuovo insieme.' },
      { title: 'Allenamento in sospeso', body: 'Solo 5 minuti di pratica possono fare magia. Entra!' },
    ],
  },
  emotion: {
    es: [
      { title: 'Como estais hoy?', body: 'Registra como os sentis tu y tu perro en el diario.' },
      { title: 'Diario de emociones', body: 'No olvides registrar vuestro dia. Heimdall analiza los patrones!' },
    ],
    en: [
      { title: 'How are you today?', body: 'Log how you and your pet are feeling in the diary.' },
      { title: 'Emotion diary', body: "Don't forget to log your day. Heimdall analyzes patterns!" },
    ],
    it: [
      { title: 'Come state oggi?', body: 'Registra come vi sentite tu e il tuo animale nel diario.' },
      { title: 'Diario delle emozioni', body: 'Non dimenticare di registrare la giornata. Heimdall analizza i pattern!' },
    ],
  },
  streak: {
    es: [
      { title: 'Tu racha esta en peligro!', body: 'Entra hoy para mantener tu racha. No la pierdas!' },
      { title: 'No rompas la cadena!', body: 'Has avanzado mucho. Un ejercicio rapido y tu racha sigue viva.' },
    ],
    en: [
      { title: 'Your streak is in danger!', body: 'Log in today to keep your streak. Don\'t lose it!' },
      { title: "Don't break the chain!", body: "You've come so far. A quick exercise and your streak stays alive." },
    ],
    it: [
      { title: 'La tua serie e in pericolo!', body: 'Entra oggi per mantenere la tua serie. Non perderla!' },
      { title: 'Non spezzare la catena!', body: 'Hai fatto tanta strada. Un esercizio veloce e la serie continua.' },
    ],
  },
  miss_you: {
    es: [
      { title: 'Te echamos de menos', body: 'Hace dias que no entrenas. Tu perro y Heimdall te esperan!' },
      { title: 'Heimdall te espera', body: 'Vuelve cuando quieras, aqui seguimos para ayudarte.' },
    ],
    en: [
      { title: 'We miss you', body: "It's been days since you trained. Your pet and Heimdall are waiting!" },
      { title: 'Heimdall is waiting', body: 'Come back whenever you want, we are here to help.' },
    ],
    it: [
      { title: 'Ci manchi', body: 'Sono giorni che non ti alleni. Il tuo animale e Heimdall ti aspettano!' },
      { title: 'Heimdall ti aspetta', body: 'Torna quando vuoi, siamo qui per aiutarti.' },
    ],
  },
};

function getRandom(msgs: { title: string; body: string }[]) {
  return msgs[Math.floor(Math.random() * msgs.length)];
}

class NotificationService {
  private async getLang(): Promise<Lang> {
    try {
      const lang = await SecureStore.getItemAsync('app_language');
      if (lang === 'en' || lang === 'it') return lang;
      return 'es';
    } catch {
      return 'es';
    }
  }

  async init() {
    if (Platform.OS === 'web') return;

    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
        shouldShowBanner: true,
        shouldShowList: true,
      }),
    });

    const { status } = await Notifications.requestPermissionsAsync();
    if (status !== 'granted') {
      console.log('Notification permissions not granted');
      return false;
    }

    if (Platform.OS === 'android') {
      const lang = await this.getLang();
      const channelNames: Record<Lang, { training: string; reminders: string }> = {
        es: { training: 'Entrenamiento', reminders: 'Recordatorios' },
        en: { training: 'Training', reminders: 'Reminders' },
        it: { training: 'Allenamento', reminders: 'Promemoria' },
      };
      await Notifications.setNotificationChannelAsync('training', {
        name: channelNames[lang].training,
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#4CAF50',
      });
      await Notifications.setNotificationChannelAsync('reminders', {
        name: channelNames[lang].reminders,
        importance: Notifications.AndroidImportance.DEFAULT,
        lightColor: '#2196F3',
      });
    }

    return true;
  }

  async getPrefs(): Promise<NotificationPrefs> {
    try {
      const stored = await AsyncStorage.getItem(PREFS_KEY);
      return stored ? { ...DEFAULT_PREFS, ...JSON.parse(stored) } : DEFAULT_PREFS;
    } catch {
      return DEFAULT_PREFS;
    }
  }

  async savePrefs(prefs: NotificationPrefs) {
    await AsyncStorage.setItem(PREFS_KEY, JSON.stringify(prefs));
    await this.scheduleAll(prefs);
  }

  async scheduleAll(prefs?: NotificationPrefs) {
    if (Platform.OS === 'web') return;

    const p = prefs || await this.getPrefs();
    const lang = await this.getLang();

    await Notifications.cancelAllScheduledNotificationsAsync();

    if (p.training_reminder) {
      const msg = getRandom(MESSAGES.training[lang]);
      await Notifications.scheduleNotificationAsync({
        content: {
          title: msg.title,
          body: msg.body,
          data: { screen: '/educacion' },
          ...(Platform.OS === 'android' ? { channelId: 'training' } : {}),
        },
        trigger: { type: Notifications.SchedulableTriggerInputTypes.DAILY, hour: 10, minute: 0 },
      });
    }

    if (p.emotion_diary) {
      const msg = getRandom(MESSAGES.emotion[lang]);
      await Notifications.scheduleNotificationAsync({
        content: {
          title: msg.title,
          body: msg.body,
          data: { screen: '/diario' },
          ...(Platform.OS === 'android' ? { channelId: 'reminders' } : {}),
        },
        trigger: { type: Notifications.SchedulableTriggerInputTypes.DAILY, hour: 20, minute: 0 },
      });
    }

    if (p.streak_warning) {
      const msg = getRandom(MESSAGES.streak[lang]);
      await Notifications.scheduleNotificationAsync({
        content: {
          title: msg.title,
          body: msg.body,
          data: { screen: '/educacion' },
          ...(Platform.OS === 'android' ? { channelId: 'training' } : {}),
        },
        trigger: { type: Notifications.SchedulableTriggerInputTypes.DAILY, hour: 21, minute: 0 },
      });
    }

    if (p.miss_you) {
      const msg = getRandom(MESSAGES.miss_you[lang]);
      await Notifications.scheduleNotificationAsync({
        content: {
          title: msg.title,
          body: msg.body,
          data: { screen: '/' },
          ...(Platform.OS === 'android' ? { channelId: 'reminders' } : {}),
        },
        trigger: { type: Notifications.SchedulableTriggerInputTypes.WEEKLY, weekday: 4, hour: 18, minute: 0 },
      });
    }
  }

  async sendAchievementNotification(title: string, body: string) {
    if (Platform.OS === 'web') return;
    const prefs = await this.getPrefs();
    if (!prefs.achievements) return;

    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data: { screen: '/perfil' },
        ...(Platform.OS === 'android' ? { channelId: 'training' } : {}),
      },
      trigger: null,
    });
  }
}

const notificationService = new NotificationService();
export default notificationService;
