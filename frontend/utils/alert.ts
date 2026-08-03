import { Alert, Platform } from 'react-native';

type AlertButton = { text?: string; style?: string; onPress?: () => void };

// Alert compatible con web (react-native-web convierte Alert.alert en no-op)
export const showAlert = (title: string, message?: string, buttons?: AlertButton[]) => {
  if (Platform.OS === 'web') {
    const text = [title, message].filter(Boolean).join('\n\n');
    if (buttons && buttons.length > 1) {
      const ok = window.confirm(text);
      if (ok) {
        buttons.find((b) => b.style !== 'cancel')?.onPress?.();
      } else {
        buttons.find((b) => b.style === 'cancel')?.onPress?.();
      }
    } else {
      window.alert(text);
      buttons?.[0]?.onPress?.();
    }
  } else {
    Alert.alert(title, message, buttons as any);
  }
};
