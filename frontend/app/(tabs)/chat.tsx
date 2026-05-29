import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { 
  View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, 
  KeyboardAvoidingView, Platform, ActivityIndicator, Alert, Image, Modal
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import axios from 'axios';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import * as DocumentPicker from 'expo-document-picker';
import { SecureStore } from '../../utils/secureStore';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage, getLanguageName } from '../../contexts/LanguageContext';
import { useTheme } from '../../contexts/ThemeContext';
import { Spacing, BorderRadius, FontSizes } from '../../constants/theme';

const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL || '';

interface ChatMessage {
  id: string; user_id: string; dog_id?: string; role: 'user' | 'assistant';
  content: string; created_at: string; rating?: 'up' | 'down'; file_url?: string; file_type?: string;
}

interface DailyUsage {
  messages: number; photos: number; videos: number; pdfs: number;
}

const SUGGESTED_QUESTIONS = {
  es: ['¿Por qué mi perro ladra tanto?', 'Juegos para días de lluvia', '¿Cuánto debe comer mi perro?'],
  en: ['Why does my dog bark so much?', 'Games for rainy days', 'How much should my dog eat?'],
  it: ['Perché il mio cane abbaia così tanto?', 'Giochi per i giorni di pioggia', 'Quanto dovrebbe mangiare il mio cane?'],
};
const WELCOME_MESSAGES = {
  es: { title: '¡Hola! Soy Heimdall', text: 'Soy tu guardián conversacional. Estoy aquí para acompañarte, orientarte y proteger a tu mejor amigo. ¿En qué puedo ayudarte?', suggestions: 'Prueba preguntar:' },
  en: { title: "Hello! I'm Heimdall", text: "I'm your conversational guardian. I'm here to accompany you, guide you and protect your best friend. How can I help you?", suggestions: 'Try asking:' },
  it: { title: 'Ciao! Sono Heimdall', text: 'Sono il tuo guardiano conversazionale. Sono qui per accompagnarti, guidarti e proteggere il tuo migliore amico. Come posso aiutarti?', suggestions: 'Prova a chiedere:' },
};
const ATTACHMENT_LABELS = {
  es: { photo: 'Foto', video: 'Video', bloodTest: 'Analisis', attachTitle: 'Adjuntar archivo', photoDesc: 'Foto de tu mascota', videoDesc: 'Video corto (max 4s)', bloodDesc: 'Analisis de sangre (PDF)', proOnly: 'Solo PRO', limitReached: 'Limite alcanzado', upgradeToPro: 'Hazte PRO', messagesLeft: 'mensajes restantes hoy', photosLeft: 'foto restante hoy', unlimited: 'Ilimitado', limitTitle: 'Limite alcanzado', limitMsg: 'Has alcanzado el limite diario de mensajes gratuitos. Hazte PRO para chatear sin limites.', photoLimitMsg: 'Has alcanzado el limite diario de fotos gratuitas. Hazte PRO para enviar fotos ilimitadas.', videoProMsg: 'El analisis de video es una funcion PRO exclusiva.', pdfProMsg: 'El analisis de documentos es una funcion PRO exclusiva.' },
  en: { photo: 'Photo', video: 'Video', bloodTest: 'Analysis', attachTitle: 'Attach file', photoDesc: 'Photo of your pet', videoDesc: 'Short video (max 4s)', bloodDesc: 'Blood test (PDF)', proOnly: 'PRO Only', limitReached: 'Limit reached', upgradeToPro: 'Go PRO', messagesLeft: 'messages left today', photosLeft: 'photo left today', unlimited: 'Unlimited', limitTitle: 'Limit reached', limitMsg: 'You have reached your daily free message limit. Go PRO for unlimited chat.', photoLimitMsg: 'You have reached your daily free photo limit. Go PRO for unlimited photos.', videoProMsg: 'Video analysis is a PRO exclusive feature.', pdfProMsg: 'Document analysis is a PRO exclusive feature.' },
  it: { photo: 'Foto', video: 'Video', bloodTest: 'Analisi', attachTitle: 'Allega file', photoDesc: 'Foto del tuo animale', videoDesc: 'Video breve (max 4s)', bloodDesc: 'Analisi del sangue (PDF)', proOnly: 'Solo PRO', limitReached: 'Limite raggiunto', upgradeToPro: 'Passa a PRO', messagesLeft: 'messaggi rimasti oggi', photosLeft: 'foto rimasta oggi', unlimited: 'Illimitato', limitTitle: 'Limite raggiunto', limitMsg: 'Hai raggiunto il limite giornaliero di messaggi gratuiti. Passa a PRO per chattare senza limiti.', photoLimitMsg: 'Hai raggiunto il limite giornaliero di foto gratuite. Passa a PRO per foto illimitate.', videoProMsg: "L'analisi video è una funzione PRO esclusiva.", pdfProMsg: "L'analisi dei documenti è una funzione PRO esclusiva." },
};

const FREE_LIMITS = { photos: 999, videos: 999, pdfs: 999 };

export default function ChatScreen() {
  const { currentDog, user } = useAuth();
  const { language, t } = useLanguage();
  const { colors, shadows } = useTheme();
  const router = useRouter();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const [showAttachMenu, setShowAttachMenu] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string | null>(null);
  const [showProModal, setShowProModal] = useState(false);
  const [proModalMessage, setProModalMessage] = useState('');
  const isPro = true;
  const [usage, setUsage] = useState<DailyUsage>({ messages: 0, photos: 0, videos: 0, pdfs: 0 });
  const scrollViewRef = useRef<ScrollView>(null);

  const suggestedQuestions = SUGGESTED_QUESTIONS[language];
  const welcomeMessage = WELCOME_MESSAGES[language];
  const labels = ATTACHMENT_LABELS[language];

  const photosRemaining = isPro ? -1 : Math.max(0, FREE_LIMITS.photos - usage.photos);

  const fetchUsage = useCallback(async () => {
    try {
      const token = await SecureStore.getItemAsync('session_token');
      const res = await axios.get(`${BACKEND_URL}/api/chat/daily-usage`, { headers: { Authorization: `Bearer ${token}` } });
      setUsage(res.data.usage);
    } catch (e) { console.log('Error fetching usage:', e); }
  }, []);

  useEffect(() => { loadChatHistory(); fetchUsage(); }, []);

  const loadChatHistory = async () => {
    try {
      const token = await SecureStore.getItemAsync('session_token');
      const response = await axios.get(`${BACKEND_URL}/api/chat/history`, { headers: { Authorization: `Bearer ${token}` }, params: { dog_id: currentDog?.id, limit: 50 } });
      setMessages(response.data);
    } catch (error) { console.log('Error loading chat history:', error); }
    finally { setIsLoadingHistory(false); }
  };

  const showProGate = (msg: string) => { setProModalMessage(msg); setShowProModal(true); };

  const sendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;
    const userMessage: ChatMessage = { id: `temp_${Date.now()}`, user_id: user?.user_id || '', dog_id: currentDog?.id, role: 'user', content: text.trim(), created_at: new Date().toISOString() };
    setMessages(prev => [...prev, userMessage]); setInputText(''); setIsLoading(true);
    setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: true }), 100);
    try {
      const token = await SecureStore.getItemAsync('session_token');
      const response = await axios.post(`${BACKEND_URL}/api/chat`, { content: text.trim(), dog_id: currentDog?.id, language: getLanguageName(language) }, { headers: { Authorization: `Bearer ${token}` } });
      setMessages(prev => [...prev, response.data]);
    } catch (error: any) {
      Alert.alert(t('error'), t('error'));
      setMessages(prev => prev.filter(m => m.id !== userMessage.id));
    }
    finally { setIsLoading(false); setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: true }), 100); }
  };

  const pickImage = async () => {
    setShowAttachMenu(false);
    if (!isPro && usage.photos >= FREE_LIMITS.photos) { return; }
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], allowsEditing: false, quality: 0.7 });
    if (!result.canceled && result.assets[0]) {
      const userMsg: ChatMessage = { id: `temp_${Date.now()}`, user_id: user?.user_id || '', dog_id: currentDog?.id, role: 'user', content: `[FOTO] ${result.assets[0].fileName || 'foto.jpg'}${inputText ? '\n' + inputText : ''}`, created_at: new Date().toISOString(), file_type: 'image' };
      setMessages(prev => [...prev, userMsg]); setIsLoading(true); setUploadProgress('Foto'); const msgText = inputText; setInputText('');
      setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: true }), 100);
      try {
        const asset = result.assets[0];
        const w = asset.width || 800; const h = asset.height || 800;
        const size = Math.min(w, h);
        const manipulated = await ImageManipulator.manipulateAsync(
          asset.uri,
          [{ crop: { originX: Math.floor((w - size) / 2), originY: Math.floor((h - size) / 2), width: size, height: size } }, { resize: { width: 800 } }],
          { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG, base64: true }
        );
        const token = await SecureStore.getItemAsync('session_token');
        const response = await axios.post(`${BACKEND_URL}/api/chat/upload-base64`, {
          image_base64: manipulated.base64,
          dog_id: currentDog?.id || '',
          message: msgText || '',
          language: getLanguageName(language),
        }, { headers: { Authorization: `Bearer ${token}` }, timeout: 60000 });
        setMessages(prev => [...prev, response.data]);
        setUsage(prev => ({ ...prev, photos: prev.photos + 1 }));
      } catch (error: any) {
        if (error?.response?.status === 403) { showProGate(labels.photoLimitMsg); }
        else { Alert.alert(t('error'), error?.response?.data?.detail || 'Error al enviar foto'); }
        setMessages(prev => prev.filter(m => m.id !== userMsg.id));
      } finally { setIsLoading(false); setUploadProgress(null); setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: true }), 100); }
    }
  };
  const pickVideo = async () => {
    setShowAttachMenu(false);
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['videos'], allowsEditing: false, videoMaxDuration: 4, quality: 0.5 });
    if (!result.canceled && result.assets[0]) await uploadFile(result.assets[0].uri, 'video', result.assets[0].fileName || 'video.mp4');
  };
  const pickPDF = async () => {
    setShowAttachMenu(false);
    try { const result = await DocumentPicker.getDocumentAsync({ type: 'application/pdf', copyToCacheDirectory: true }); if (!result.canceled && result.assets && result.assets[0]) await uploadFile(result.assets[0].uri, 'pdf', result.assets[0].name || 'document.pdf'); } catch (error) { console.log('Error picking PDF:', error); }
  };

  const uploadFile = async (uri: string, fileType: string, fileName: string) => {
    const userMsg: ChatMessage = { id: `temp_${Date.now()}`, user_id: user?.user_id || '', dog_id: currentDog?.id, role: 'user', content: `[${fileType === 'pdf' ? 'PDF' : fileType === 'video' ? 'VIDEO' : 'FOTO'}] ${fileName}${inputText ? '\n' + inputText : ''}`, created_at: new Date().toISOString(), file_type: fileType };
    setMessages(prev => [...prev, userMsg]); setIsLoading(true); setUploadProgress(fileType === 'image' ? 'Foto' : fileType === 'video' ? 'Video' : 'PDF'); setInputText('');
    setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: true }), 100);
    try {
      const token = await SecureStore.getItemAsync('session_token');
      const formData = new FormData();
      const mimeType = fileType === 'pdf' ? 'application/pdf' : fileType === 'video' ? 'video/mp4' : 'image/jpeg';
      formData.append('file', { uri, name: fileName, type: mimeType } as any);
      formData.append('dog_id', currentDog?.id || ''); formData.append('message', inputText || ''); formData.append('file_type', fileType); formData.append('language', getLanguageName(language));
      const response = await axios.post(`${BACKEND_URL}/api/chat/upload`, formData, { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' }, timeout: 60000 });
      setMessages(prev => [...prev, response.data]);
    } catch (error: any) {
      if (error?.response?.status === 403) { const detail = error?.response?.data?.detail || ''; if (detail.includes('PHOTO')) showProGate(labels.photoLimitMsg); else if (detail.includes('VIDEO')) showProGate(labels.videoProMsg); else if (detail.includes('PDF')) showProGate(labels.pdfProMsg); else showProGate(labels.limitMsg); }
      else { Alert.alert(t('error'), error?.response?.data?.detail || 'Error uploading file'); }
      setMessages(prev => prev.filter(m => m.id !== userMsg.id));
    }
    finally { setIsLoading(false); setUploadProgress(null); setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: true }), 100); }
  };

  const rateMessage = async (messageId: string, rating: 'up' | 'down') => {
    // Toggle: if same rating clicked again, do nothing (keep it)
    const current = messages.find(m => m.id === messageId)?.rating;
    const newRating = current === rating ? rating : rating;
    // Optimistic update
    setMessages(prev => prev.map(m => m.id === messageId ? { ...m, rating: newRating } : m));
    try {
      const token = await SecureStore.getItemAsync('session_token');
      await axios.post(`${BACKEND_URL}/api/chat/${messageId}/rate`, { rating: newRating }, { headers: { Authorization: `Bearer ${token}` } });
    } catch (error) {
      console.log('Error rating:', error);
    }
  };

  // Simple markdown-like renderer for assistant messages
  const renderFormattedText = (text: string, textColor: string) => {
    // Split into paragraphs by double newline or single newline
    const paragraphs = text.split(/\n\n+/);
    return paragraphs.map((paragraph, pIdx) => {
      // Handle lines within a paragraph
      const lines = paragraph.split('\n');
      return (
        <View key={pIdx} style={pIdx > 0 ? { marginTop: 10 } : undefined}>
          {lines.map((line, lIdx) => {
            // Parse bold **text** within each line
            const parts = line.split(/(\*\*[^*]+\*\*)/g);
            return (
              <Text key={`${pIdx}-${lIdx}`} style={[s.messageText, { color: textColor }, lIdx > 0 ? { marginTop: 3 } : undefined]}>
                {parts.map((part, partIdx) => {
                  if (part.startsWith('**') && part.endsWith('**')) {
                    return <Text key={partIdx} style={{ fontWeight: '700' }}>{part.slice(2, -2)}</Text>;
                  }
                  return <Text key={partIdx}>{part}</Text>;
                })}
              </Text>
            );
          })}
        </View>
      );
    });
  };

  const s = useMemo(() => cs(colors, shadows), [colors, shadows]);

  const renderMessage = (message: ChatMessage) => {
    const isUser = message.role === 'user';
    const hasAttachment = message.file_type || (message.content && message.content.startsWith('['));
    return (
      <View key={message.id} style={[s.messageContainer, isUser ? s.userMessage : s.assistantMessage]} data-testid={`message-${message.id}`}>
        {!isUser && <View style={s.avatarContainer}><Image source={require('../../assets/images/heimdall-logo.png')} style={{ width: 32, height: 32 }} resizeMode="cover" /></View>}
        <View style={[s.messageBubble, isUser ? s.userBubble : s.assistantBubble]}>
          {isUser && hasAttachment && <View style={{ marginBottom: 4 }}><Ionicons name={message.file_type === 'pdf' || message.content?.includes('[PDF]') ? 'document-text' : message.file_type === 'video' || message.content?.includes('[VIDEO]') ? 'videocam' : 'camera'} size={16} color="#FFF" /></View>}
          {isUser ? (
            <Text style={[s.messageText, { color: '#FFF' }]}>{message.content}</Text>
          ) : (
            renderFormattedText(message.content, colors.text)
          )}
          {!isUser && (
            <View style={s.ratingRow} data-testid={`rating-${message.id}`}>
              <TouchableOpacity
                onPress={() => rateMessage(message.id, 'up')}
                style={[s.ratingBtn, message.rating === 'up' && { backgroundColor: colors.primary + '20' }]}
                data-testid={`rate-up-${message.id}`}
              >
                <Ionicons name={message.rating === 'up' ? 'thumbs-up' : 'thumbs-up-outline'} size={15} color={message.rating === 'up' ? colors.primary : colors.gray} />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => rateMessage(message.id, 'down')}
                style={[s.ratingBtn, message.rating === 'down' && { backgroundColor: colors.error + '20' }]}
                data-testid={`rate-down-${message.id}`}
              >
                <Ionicons name={message.rating === 'down' ? 'thumbs-down' : 'thumbs-down-outline'} size={15} color={message.rating === 'down' ? colors.error : colors.gray} />
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    );
  };

  const UsageCounter = () => null;

  const ProBadge = ({ small }: { small?: boolean }) => (
    <View style={[s.proBadgeInline, small && { paddingHorizontal: 4, paddingVertical: 1 }]}>
      <Ionicons name="diamond" size={small ? 8 : 10} color="#FFF" />
      <Text style={[s.proBadgeText, small && { fontSize: 8 }]}>PRO</Text>
    </View>
  );

  return (
    <SafeAreaView style={s.container} edges={['top']}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'padding'} keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}>
        {/* Header */}
        <View style={s.header}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.md }}>
            <View style={s.haniAvatar}><Image source={require('../../assets/images/heimdall-logo.png')} style={{ width: 48, height: 48 }} resizeMode="cover" /></View>
            <View><Text style={s.headerTitle}>Heimdall</Text><Text style={s.headerSub}>{t('guardianChat') || 'Tu guardian'}</Text></View>
          </View>
          <UsageCounter />
        </View>

        <ScrollView ref={scrollViewRef} style={{ flex: 1 }} contentContainerStyle={{ padding: Spacing.md, paddingBottom: Spacing.lg }}
          showsVerticalScrollIndicator={false} onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: false })}>
          {isLoadingHistory ? (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: 100 }}><ActivityIndicator size="large" color={colors.primary} /></View>
          ) : messages.length === 0 ? (
            <View style={{ alignItems: 'center', paddingTop: Spacing.xl, paddingHorizontal: Spacing.md }}>
              <View style={s.welcomeAvatar}><Image source={require('../../assets/images/heimdall-logo.png')} style={{ width: 80, height: 80 }} resizeMode="cover" /></View>
              <Text style={{ fontSize: FontSizes.xl, fontWeight: '700', color: colors.text, marginBottom: Spacing.sm }}>{welcomeMessage.title}</Text>
              <Text style={{ fontSize: FontSizes.md, color: colors.textSecondary, textAlign: 'center', lineHeight: 24, marginBottom: Spacing.lg }}>{welcomeMessage.text}</Text>

              {/* Quick Actions */}
              <View style={{ flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.xl, width: '100%' }} data-testid="quick-actions">
                <TouchableOpacity style={s.quickActionCard} onPress={pickImage}>
                  <Ionicons name="camera" size={28} color={colors.primary} />
                  <Text style={{ fontSize: FontSizes.sm, fontWeight: '700', color: colors.text }}>{labels.photo}</Text>
                  <Text style={{ fontSize: 10, color: colors.textSecondary, textAlign: 'center' }}>{labels.photoDesc}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={s.quickActionCard} onPress={pickVideo}>
                  <Ionicons name="videocam" size={28} color={colors.accentOrange} />
                  <Text style={{ fontSize: FontSizes.sm, fontWeight: '700', color: colors.text }}>{labels.video}</Text>
                  <Text style={{ fontSize: 10, color: colors.textSecondary, textAlign: 'center' }}>{labels.videoDesc}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={s.quickActionCard} onPress={pickPDF}>
                  <Ionicons name="document-text" size={28} color={colors.accentPurple} />
                  <Text style={{ fontSize: FontSizes.sm, fontWeight: '700', color: colors.text }}>{labels.bloodTest}</Text>
                  <Text style={{ fontSize: 10, color: colors.textSecondary, textAlign: 'center' }}>{labels.bloodDesc}</Text>
                </TouchableOpacity>
              </View>

              <Text style={{ fontSize: FontSizes.sm, fontWeight: '600', color: colors.text, marginBottom: Spacing.md }}>{welcomeMessage.suggestions}</Text>
              <View style={{ width: '100%', gap: Spacing.sm }}>
                {suggestedQuestions.map((q, i) => (
                  <TouchableOpacity key={i} style={s.suggestionChip} onPress={() => sendMessage(q)}>
                    <Text style={{ fontSize: FontSizes.md, color: colors.primary, textAlign: 'center' }}>{q}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          ) : messages.map(renderMessage)}

          {isLoading && (
            <View style={[s.messageContainer, s.assistantMessage]}>
              <View style={s.avatarContainer}><Image source={require('../../assets/images/heimdall-logo.png')} style={{ width: 32, height: 32 }} resizeMode="cover" /></View>
              <View style={[s.messageBubble, s.assistantBubble, { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm }]}>
                <ActivityIndicator size="small" color={colors.primary} />
                <Text style={{ fontSize: FontSizes.sm, color: colors.textSecondary, fontStyle: 'italic' }}>{uploadProgress ? `${uploadProgress} ${t('analyzing')}...` : t('thinking')}</Text>
              </View>
            </View>
          )}
        </ScrollView>


        {/* Quick Bar */}
        {!isLoading && (
          <View style={s.quickBar} data-testid="quick-bar">
            <TouchableOpacity style={s.quickBarBtn} onPress={pickImage}>
              <Ionicons name="camera" size={20} color={colors.primary} />
              <Text style={{ fontSize: FontSizes.xs, fontWeight: '600', color: colors.text }}>{labels.photo}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={s.quickBarBtn} onPress={pickVideo}>
              <Ionicons name="videocam" size={20} color={colors.accentOrange} />
              <Text style={{ fontSize: FontSizes.xs, fontWeight: '600', color: colors.text }}>{labels.video}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={s.quickBarBtn} onPress={pickPDF}>
              <Ionicons name="document-text" size={20} color={colors.accentPurple} />
              <Text style={{ fontSize: FontSizes.xs, fontWeight: '600', color: colors.text }}>{labels.bloodTest}</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Input */}
        <View style={s.inputContainer}>
          <View style={s.inputWrapper}>
            <TouchableOpacity style={{ padding: Spacing.sm, justifyContent: 'center' }} onPress={() => setShowAttachMenu(true)} data-testid="attach-button">
              <Ionicons name="add-circle" size={28} color={colors.primary} />
            </TouchableOpacity>
            <TextInput style={s.textInput} placeholder={t('typeMessage') || 'Escribe tu mensaje...'} placeholderTextColor={colors.gray} value={inputText} onChangeText={setInputText} multiline maxLength={1000} />
            <TouchableOpacity style={[s.sendButton, (!inputText.trim() || isLoading) && { backgroundColor: colors.grayLight }]} onPress={() => sendMessage(inputText)} disabled={!inputText.trim() || isLoading} data-testid="send-button">
              <Ionicons name="send" size={20} color={inputText.trim() && !isLoading ? '#FFF' : colors.gray} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Attach Modal */}
        <Modal visible={showAttachMenu} transparent animationType="slide" onRequestClose={() => setShowAttachMenu(false)}>
          <TouchableOpacity style={s.modalOverlay} activeOpacity={1} onPress={() => setShowAttachMenu(false)}>
            <View style={s.attachMenu} data-testid="attach-menu">
              <Text style={{ fontSize: FontSizes.lg, fontWeight: '700', color: colors.text, textAlign: 'center', marginBottom: Spacing.lg }}>{labels.attachTitle}</Text>
              <View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
                {[{ icon: 'camera', color: colors.primary, bg: colors.primaryLight, label: labels.photo, desc: labels.photoDesc, fn: pickImage },
                  { icon: 'videocam', color: colors.accentOrange, bg: '#FFF0E0', label: labels.video, desc: labels.videoDesc, fn: pickVideo },
                  { icon: 'document-text', color: colors.accentPurple, bg: '#F0E8FF', label: labels.bloodTest, desc: labels.bloodDesc, fn: pickPDF }].map((a, i) => (
                  <TouchableOpacity key={i} style={{ alignItems: 'center', gap: Spacing.sm, width: 90 }} onPress={a.fn}>
                    <View style={{ width: 56, height: 56, borderRadius: 28, backgroundColor: a.bg, alignItems: 'center', justifyContent: 'center' }}>
                      <Ionicons name={a.icon as any} size={24} color={a.color} />
                    </View>
                    <Text style={{ fontSize: FontSizes.sm, fontWeight: '700', color: colors.text }}>{a.label}</Text>
                    <Text style={{ fontSize: 10, color: colors.textSecondary, textAlign: 'center' }}>{a.desc}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </TouchableOpacity>
        </Modal>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const cs = (C: any, S: any) => StyleSheet.create({
  container: { flex: 1, backgroundColor: C.background },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: Spacing.md, backgroundColor: C.cardBg, borderBottomWidth: 1, borderBottomColor: C.grayLight },
  haniAvatar: { width: 48, height: 48, borderRadius: 24, backgroundColor: C.primary, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  headerTitle: { fontSize: FontSizes.lg, fontWeight: '700', color: C.text },
  headerSub: { fontSize: FontSizes.sm, color: C.textSecondary },
  usageBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: Spacing.md, paddingVertical: Spacing.xs, borderRadius: BorderRadius.lg, borderWidth: 1, borderColor: C.primary + '40', backgroundColor: C.primary + '08' },
  usageBadgePro: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: Spacing.md, paddingVertical: Spacing.xs, borderRadius: BorderRadius.lg, backgroundColor: C.accent + '15', borderWidth: 1, borderColor: C.accent + '40' },
  usageBadgeText: { fontSize: FontSizes.sm, fontWeight: '700', color: C.primary },
  usageBarBg: { width: 40, height: 4, borderRadius: 2, backgroundColor: C.grayLight, overflow: 'hidden' },
  usageBarFill: { height: '100%', borderRadius: 2 },
  welcomeAvatar: { width: 80, height: 80, borderRadius: 40, backgroundColor: C.primary, alignItems: 'center', justifyContent: 'center', marginBottom: Spacing.lg, overflow: 'hidden' },
  quickActionCard: { flex: 1, backgroundColor: C.cardBg, borderRadius: BorderRadius.lg, padding: Spacing.md, alignItems: 'center', gap: 4, ...S.sm, borderWidth: 1, borderColor: C.grayLight, position: 'relative' },
  suggestionChip: { backgroundColor: C.cardBg, paddingVertical: Spacing.md, paddingHorizontal: Spacing.lg, borderRadius: BorderRadius.lg, borderWidth: 1, borderColor: C.primary + '40', ...S.sm },
  messageContainer: { flexDirection: 'row', marginBottom: Spacing.md, alignItems: 'flex-end' },
  userMessage: { justifyContent: 'flex-end' },
  assistantMessage: { justifyContent: 'flex-start' },
  avatarContainer: { width: 32, height: 32, borderRadius: 16, backgroundColor: C.primary, alignItems: 'center', justifyContent: 'center', marginRight: Spacing.sm, overflow: 'hidden' },
  messageBubble: { maxWidth: '75%', padding: Spacing.md, borderRadius: BorderRadius.lg },
  userBubble: { backgroundColor: C.primary, borderBottomRightRadius: 4 },
  assistantBubble: { backgroundColor: C.cardBg, borderBottomLeftRadius: 4, ...S.sm },
  messageText: { fontSize: FontSizes.md, color: C.text, lineHeight: 22 },
  ratingRow: { flexDirection: 'row', marginTop: Spacing.sm, gap: Spacing.sm, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: C.grayLight, paddingTop: Spacing.sm },
  ratingBtn: { padding: 6, borderRadius: BorderRadius.sm },
  inputContainer: { padding: Spacing.md, backgroundColor: C.cardBg, borderTopWidth: 1, borderTopColor: C.grayLight },
  inputWrapper: { flexDirection: 'row', alignItems: 'flex-end', backgroundColor: C.background, borderRadius: BorderRadius.lg, paddingLeft: Spacing.xs, paddingRight: Spacing.xs, paddingVertical: Spacing.xs },
  textInput: { flex: 1, fontSize: FontSizes.md, color: C.text, maxHeight: 100, paddingVertical: Spacing.sm, paddingHorizontal: Spacing.sm },
  sendButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: C.primary, alignItems: 'center', justifyContent: 'center' },
  quickBar: { flexDirection: 'row', justifyContent: 'center', gap: Spacing.md, paddingVertical: Spacing.sm, paddingHorizontal: Spacing.md, backgroundColor: C.cardBg, borderTopWidth: 1, borderTopColor: C.grayLight },
  quickBarBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: Spacing.md, paddingVertical: Spacing.xs, borderRadius: BorderRadius.lg, backgroundColor: C.background, borderWidth: 1, borderColor: C.grayLight },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  attachMenu: { backgroundColor: C.cardBg, borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: Spacing.lg, paddingBottom: 40 },
  proModal: { backgroundColor: C.cardBg, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: Spacing.xl, paddingBottom: 40, alignItems: 'center' },
  proModalIcon: { width: 72, height: 72, borderRadius: 36, backgroundColor: C.accent + '15', alignItems: 'center', justifyContent: 'center', marginBottom: Spacing.lg },
  proModalTitle: { fontSize: FontSizes.xl, fontWeight: '800', color: C.text, marginBottom: Spacing.sm },
  proModalText: { fontSize: FontSizes.md, color: C.textSecondary, textAlign: 'center', lineHeight: 22, marginBottom: Spacing.lg },
  proModalButton: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, backgroundColor: C.accent, paddingVertical: Spacing.md, paddingHorizontal: Spacing.xl, borderRadius: BorderRadius.lg },
  proModalButtonText: { fontSize: FontSizes.md, fontWeight: '700', color: '#FFF' },
  proBadgeInline: { flexDirection: 'row', alignItems: 'center', gap: 2, backgroundColor: C.accent, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 8, position: 'absolute', top: -4, right: -4 },
  proBadgeText: { fontSize: 9, fontWeight: '800', color: '#FFF' },
  limitWarning: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs, paddingHorizontal: Spacing.sm, paddingVertical: 4, marginBottom: Spacing.xs },
});
