import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

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

// Notification content templates
const TRAINING_MESSAGES = [
  { title: 'Hora de entrenar!', body: 'Tu perro te espera para practicar. Cada sesion cuenta!' },
  { title: 'Sesion de hoy', body: 'Un ejercicio rapido al dia marca la diferencia. Vamos!' },
  { title: 'Tu perro te necesita', body: 'Hoy es un gran dia para aprender algo nuevo juntos.' },
  { title: 'Entrenamiento pendiente', body: 'Solo 5 minutos de practica pueden hacer magia. Entra!' },
];

const EMOTION_MESSAGES = [
  { title: 'Como estais hoy?', body: 'Registra como os sentis tu y tu perro en el diario.' },
  { title: 'Diario de emociones', body: 'No olvides registrar vuestro dia. Heimdall analiza los patrones!' },
];

const STREAK_MESSAGES = [
  { title: 'Tu racha esta en peligro!', body: 'Entra hoy para mantener tu racha. No la pierdas!' },
  { title: 'No rompas la cadena!', body: 'Has avanzado mucho. Un ejercicio rapido y tu racha sigue viva.' },
];

const MISS_YOU_MESSAGES = [
  { title: 'Te echamos de menos', body: 'Hace dias que no entrenas. Tu perro y Heimdall te esperan!' },
  { title: 'Heimdall te espera', body: 'Vuelve cuando quieras, aqui seguimos para ayudarte.' },
];

function getRandomMessage(messages: { title: string; body: string }[]) {
  return messages[Math.floor(Math.random() * messages.length)];
}

class NotificationService {
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
      await Notifications.setNotificationChannelAsync('training', {
        name: 'Entrenamiento',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#4CAF50',
      });
      await Notifications.setNotificationChannelAsync('reminders', {
        name: 'Recordatorios',
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

    // Cancel all existing scheduled notifications
    await Notifications.cancelAllScheduledNotificationsAsync();

    // 1) Training reminder - daily at 10:00
    if (p.training_reminder) {
      const msg = getRandomMessage(TRAINING_MESSAGES);
      await Notifications.scheduleNotificationAsync({
        content: {
          title: msg.title,
          body: msg.body,
          data: { screen: '/educacion' },
          ...(Platform.OS === 'android' ? { channelId: 'training' } : {}),
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DAILY,
          hour: 10,
          minute: 0,
        },
      });
    }

    // 2) Emotion diary - daily at 20:00
    if (p.emotion_diary) {
      const msg = getRandomMessage(EMOTION_MESSAGES);
      await Notifications.scheduleNotificationAsync({
        content: {
          title: msg.title,
          body: msg.body,
          data: { screen: '/diario' },
          ...(Platform.OS === 'android' ? { channelId: 'reminders' } : {}),
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DAILY,
          hour: 20,
          minute: 0,
        },
      });
    }

    // 3) Streak warning - daily at 21:00
    if (p.streak_warning) {
      const msg = getRandomMessage(STREAK_MESSAGES);
      await Notifications.scheduleNotificationAsync({
        content: {
          title: msg.title,
          body: msg.body,
          data: { screen: '/educacion' },
          ...(Platform.OS === 'android' ? { channelId: 'training' } : {}),
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DAILY,
          hour: 21,
          minute: 0,
        },
      });
    }

    // 4) Miss you - weekly (every 3 days at 18:00)
    if (p.miss_you) {
      const msg = getRandomMessage(MISS_YOU_MESSAGES);
      await Notifications.scheduleNotificationAsync({
        content: {
          title: msg.title,
          body: msg.body,
          data: { screen: '/' },
          ...(Platform.OS === 'android' ? { channelId: 'reminders' } : {}),
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.WEEKLY,
          weekday: 4,
          hour: 18,
          minute: 0,
        },
      });
    }
  }

  // Send instant notification (for achievements)
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
      trigger: null, // immediate
    });
  }
}

const notificationService = new NotificationService();
export default notificationService;
