import React, { useState, useEffect, useRef } from 'react';
import { 
  View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, 
  KeyboardAvoidingView, Platform, ActivityIndicator, Alert, Image, Modal
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import { SecureStore } from '../../utils/secureStore';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage, getLanguageName } from '../../contexts/LanguageContext';
import { Colors, Spacing, BorderRadius, FontSizes, Shadows } from '../../constants/theme';

const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL || '';

interface ChatMessage {
  id: string;
  user_id: string;
  dog_id?: string;
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
  rating?: 'up' | 'down';
  file_url?: string;
  file_type?: string;
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
  es: { photo: 'Foto', video: 'Vídeo', bloodTest: 'Análisis', attachTitle: 'Adjuntar archivo', photoDesc: 'Foto de tu mascota', videoDesc: 'Vídeo corto (máx 4s)', bloodDesc: 'Análisis de sangre (PDF)' },
  en: { photo: 'Photo', video: 'Video', bloodTest: 'Analysis', attachTitle: 'Attach file', photoDesc: 'Photo of your pet', videoDesc: 'Short video (max 4s)', bloodDesc: 'Blood test (PDF)' },
  it: { photo: 'Foto', video: 'Video', bloodTest: 'Analisi', attachTitle: 'Allega file', photoDesc: 'Foto del tuo animale', videoDesc: 'Video breve (max 4s)', bloodDesc: 'Analisi del sangue (PDF)' },
};

export default function ChatScreen() {
  const { currentDog, user } = useAuth();
  const { language, t } = useLanguage();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const [showAttachMenu, setShowAttachMenu] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string | null>(null);
  const scrollViewRef = useRef<ScrollView>(null);

  const suggestedQuestions = SUGGESTED_QUESTIONS[language];
  const welcomeMessage = WELCOME_MESSAGES[language];
  const attachLabels = ATTACHMENT_LABELS[language];

  useEffect(() => { loadChatHistory(); }, []);

  const loadChatHistory = async () => {
    try {
      const token = await SecureStore.getItemAsync('session_token');
      const response = await axios.get(`${BACKEND_URL}/api/chat/history`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { dog_id: currentDog?.id, limit: 50 }
      });
      setMessages(response.data);
    } catch (error) {
      console.log('Error loading chat history:', error);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const sendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;
    const userMessage: ChatMessage = {
      id: `temp_${Date.now()}`, user_id: user?.user_id || '', dog_id: currentDog?.id,
      role: 'user', content: text.trim(), created_at: new Date().toISOString(),
    };
    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);
    setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: true }), 100);

    try {
      const token = await SecureStore.getItemAsync('session_token');
      const response = await axios.post(`${BACKEND_URL}/api/chat`, {
        content: text.trim(), dog_id: currentDog?.id, language: getLanguageName(language),
      }, { headers: { Authorization: `Bearer ${token}` } });
      setMessages(prev => [...prev, response.data]);
    } catch (error: any) {
      Alert.alert(t('error'), t('error'));
      setMessages(prev => prev.filter(m => m.id !== userMessage.id));
    } finally {
      setIsLoading(false);
      setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: true }), 100);
    }
  };

  const pickImage = async () => {
    setShowAttachMenu(false);
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      quality: 0.7,
    });
    if (!result.canceled && result.assets[0]) {
      await uploadFile(result.assets[0].uri, 'image', result.assets[0].fileName || 'photo.jpg');
    }
  };

  const pickVideo = async () => {
    setShowAttachMenu(false);
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['videos'],
      allowsEditing: true,
      videoMaxDuration: 4,
      quality: 0.5,
    });
    if (!result.canceled && result.assets[0]) {
      await uploadFile(result.assets[0].uri, 'video', result.assets[0].fileName || 'video.mp4');
    }
  };

  const pickPDF = async () => {
    setShowAttachMenu(false);
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/pdf',
        copyToCacheDirectory: true,
      });
      if (!result.canceled && result.assets && result.assets[0]) {
        await uploadFile(result.assets[0].uri, 'pdf', result.assets[0].name || 'document.pdf');
      }
    } catch (error) {
      console.log('Error picking PDF:', error);
    }
  };

  const uploadFile = async (uri: string, fileType: string, fileName: string) => {
    const userMsg: ChatMessage = {
      id: `temp_${Date.now()}`, user_id: user?.user_id || '', dog_id: currentDog?.id,
      role: 'user', content: `[${fileType === 'pdf' ? 'PDF' : fileType === 'video' ? 'VIDEO' : 'FOTO'}] ${fileName}${inputText ? '\n' + inputText : ''}`,
      created_at: new Date().toISOString(), file_type: fileType,
    };
    setMessages(prev => [...prev, userMsg]);
    setIsLoading(true);
    setUploadProgress(fileType === 'image' ? '📸' : fileType === 'video' ? '🎥' : '📄');
    setInputText('');
    setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: true }), 100);

    try {
      const token = await SecureStore.getItemAsync('session_token');
      const formData = new FormData();
      
      const fileExtension = fileName.split('.').pop() || (fileType === 'pdf' ? 'pdf' : fileType === 'video' ? 'mp4' : 'jpg');
      const mimeType = fileType === 'pdf' ? 'application/pdf' : fileType === 'video' ? 'video/mp4' : 'image/jpeg';
      
      formData.append('file', {
        uri: Platform.OS === 'web' ? uri : uri,
        name: fileName,
        type: mimeType,
      } as any);
      formData.append('dog_id', currentDog?.id || '');
      formData.append('message', inputText || '');
      formData.append('file_type', fileType);
      formData.append('language', getLanguageName(language));

      const response = await axios.post(`${BACKEND_URL}/api/chat/upload`, formData, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' },
        timeout: 60000,
      });

      setMessages(prev => [...prev, response.data]);
    } catch (error: any) {
      console.log('Upload error:', error?.response?.data || error.message);
      Alert.alert(t('error'), error?.response?.data?.detail || 'Error uploading file');
      setMessages(prev => prev.filter(m => m.id !== userMsg.id));
    } finally {
      setIsLoading(false);
      setUploadProgress(null);
      setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: true }), 100);
    }
  };

  const rateMessage = async (messageId: string, rating: 'up' | 'down') => {
    try {
      const token = await SecureStore.getItemAsync('session_token');
      await axios.post(`${BACKEND_URL}/api/chat/${messageId}/rate`, { rating }, { headers: { Authorization: `Bearer ${token}` } });
      setMessages(prev => prev.map(m => m.id === messageId ? { ...m, rating } : m));
    } catch (error) { console.log('Error rating message:', error); }
  };

  const renderMessage = (message: ChatMessage) => {
    const isUser = message.role === 'user';
    const hasAttachment = message.file_type || (message.content && message.content.startsWith('['));
    
    return (
      <View key={message.id} style={[styles.messageContainer, isUser ? styles.userMessage : styles.assistantMessage]}>
        {!isUser && (
          <View style={styles.avatarContainer}>
            <Image source={require('../../assets/images/heimdall-logo.png')} style={styles.avatarImage} resizeMode="cover" />
          </View>
        )}
        <View style={[styles.messageBubble, isUser ? styles.userBubble : styles.assistantBubble]}>
          {isUser && hasAttachment && (
            <View style={styles.attachmentBadge} data-testid="attachment-badge">
              <Ionicons 
                name={message.file_type === 'pdf' || message.content?.includes('[PDF]') ? 'document-text' : message.file_type === 'video' || message.content?.includes('[VIDEO]') ? 'videocam' : 'camera'} 
                size={16} color={Colors.white} 
              />
            </View>
          )}
          <Text style={[styles.messageText, isUser && styles.userMessageText]}>{message.content}</Text>
          {!isUser && (
            <View style={styles.ratingContainer}>
              <TouchableOpacity onPress={() => rateMessage(message.id, 'up')} style={[styles.ratingButton, message.rating === 'up' && styles.ratingActive]}>
                <Ionicons name={message.rating === 'up' ? 'thumbs-up' : 'thumbs-up-outline'} size={16} color={message.rating === 'up' ? Colors.primary : Colors.gray} />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => rateMessage(message.id, 'down')} style={[styles.ratingButton, message.rating === 'down' && styles.ratingActive]}>
                <Ionicons name={message.rating === 'down' ? 'thumbs-down' : 'thumbs-down-outline'} size={16} color={message.rating === 'down' ? Colors.error : Colors.gray} />
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <KeyboardAvoidingView style={styles.keyboardView} behavior={Platform.OS === 'ios' ? 'padding' : 'height'} keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <View style={styles.haniAvatar}>
              <Image source={require('../../assets/images/heimdall-logo.png')} style={styles.haniAvatarImage} resizeMode="cover" />
            </View>
            <View>
              <Text style={styles.headerTitle}>Heimdall</Text>
              <Text style={styles.headerSubtitle}>{t('guardianChat') || 'Tu guardián'}</Text>
            </View>
          </View>
        </View>

        {/* Chat Messages */}
        <ScrollView ref={scrollViewRef} style={styles.messagesContainer} contentContainerStyle={styles.messagesContent}
          showsVerticalScrollIndicator={false} onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: false })}>
          {isLoadingHistory ? (
            <View style={styles.loadingContainer}><ActivityIndicator size="large" color={Colors.primary} /></View>
          ) : messages.length === 0 ? (
            <View style={styles.welcomeContainer}>
              <View style={styles.welcomeAvatar}>
                <Image source={require('../../assets/images/heimdall-logo.png')} style={styles.welcomeAvatarImage} resizeMode="cover" />
              </View>
              <Text style={styles.welcomeTitle}>{welcomeMessage.title}</Text>
              <Text style={styles.welcomeText}>{welcomeMessage.text}</Text>
              
              {/* Quick Action Cards */}
              <View style={styles.quickActionsRow} data-testid="quick-actions">
                <TouchableOpacity style={styles.quickActionCard} onPress={pickImage} data-testid="quick-action-photo">
                  <Ionicons name="camera" size={28} color={Colors.primary} />
                  <Text style={styles.quickActionLabel}>{attachLabels.photo}</Text>
                  <Text style={styles.quickActionDesc}>{attachLabels.photoDesc}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.quickActionCard} onPress={pickVideo} data-testid="quick-action-video">
                  <Ionicons name="videocam" size={28} color={Colors.accentOrange} />
                  <Text style={styles.quickActionLabel}>{attachLabels.video}</Text>
                  <Text style={styles.quickActionDesc}>{attachLabels.videoDesc}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.quickActionCard} onPress={pickPDF} data-testid="quick-action-pdf">
                  <Ionicons name="document-text" size={28} color={Colors.accentPurple} />
                  <Text style={styles.quickActionLabel}>{attachLabels.bloodTest}</Text>
                  <Text style={styles.quickActionDesc}>{attachLabels.bloodDesc}</Text>
                </TouchableOpacity>
              </View>

              <Text style={styles.suggestionsTitle}>{welcomeMessage.suggestions}</Text>
              <View style={styles.suggestionsContainer}>
                {suggestedQuestions.map((question, index) => (
                  <TouchableOpacity key={index} style={styles.suggestionChip} onPress={() => sendMessage(question)}>
                    <Text style={styles.suggestionText}>{question}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          ) : (
            messages.map(renderMessage)
          )}
          
          {isLoading && (
            <View style={[styles.messageContainer, styles.assistantMessage]}>
              <View style={styles.avatarContainer}>
                <Image source={require('../../assets/images/heimdall-logo.png')} style={styles.avatarImage} resizeMode="cover" />
              </View>
              <View style={[styles.messageBubble, styles.assistantBubble, styles.typingBubble]}>
                <ActivityIndicator size="small" color={Colors.primary} />
                <Text style={styles.typingText}>{uploadProgress ? `${uploadProgress} ${t('analyzing')}...` : t('thinking')}</Text>
              </View>
            </View>
          )}
        </ScrollView>

        {/* Attachment Menu Modal */}
        <Modal visible={showAttachMenu} transparent animationType="slide" onRequestClose={() => setShowAttachMenu(false)}>
          <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setShowAttachMenu(false)}>
            <View style={styles.attachMenu} data-testid="attach-menu">
              <Text style={styles.attachMenuTitle}>{attachLabels.attachTitle}</Text>
              <View style={styles.attachOptions}>
                <TouchableOpacity style={styles.attachOption} onPress={pickImage} data-testid="attach-photo-btn">
                  <View style={[styles.attachIconCircle, { backgroundColor: Colors.primaryLight }]}>
                    <Ionicons name="camera" size={24} color={Colors.primary} />
                  </View>
                  <Text style={styles.attachOptionLabel}>{attachLabels.photo}</Text>
                  <Text style={styles.attachOptionDesc}>{attachLabels.photoDesc}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.attachOption} onPress={pickVideo} data-testid="attach-video-btn">
                  <View style={[styles.attachIconCircle, { backgroundColor: '#FFF0E0' }]}>
                    <Ionicons name="videocam" size={24} color={Colors.accentOrange} />
                  </View>
                  <Text style={styles.attachOptionLabel}>{attachLabels.video}</Text>
                  <Text style={styles.attachOptionDesc}>{attachLabels.videoDesc}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.attachOption} onPress={pickPDF} data-testid="attach-pdf-btn">
                  <View style={[styles.attachIconCircle, { backgroundColor: '#F0E8FF' }]}>
                    <Ionicons name="document-text" size={24} color={Colors.accentPurple} />
                  </View>
                  <Text style={styles.attachOptionLabel}>{attachLabels.bloodTest}</Text>
                  <Text style={styles.attachOptionDesc}>{attachLabels.bloodDesc}</Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableOpacity>
        </Modal>

        {/* Quick Actions Bar - Always visible */}
        {!isLoading && (
          <View style={styles.quickBar} data-testid="quick-bar">
            <TouchableOpacity style={styles.quickBarBtn} onPress={pickImage} data-testid="quick-photo-btn">
              <Ionicons name="camera" size={20} color={Colors.primary} />
              <Text style={styles.quickBarLabel}>{attachLabels.photo}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.quickBarBtn} onPress={pickVideo} data-testid="quick-video-btn">
              <Ionicons name="videocam" size={20} color={Colors.accentOrange} />
              <Text style={styles.quickBarLabel}>{attachLabels.video}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.quickBarBtn} onPress={pickPDF} data-testid="quick-pdf-btn">
              <Ionicons name="document-text" size={20} color={Colors.accentPurple} />
              <Text style={styles.quickBarLabel}>{attachLabels.bloodTest}</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Input Area */}
        <View style={styles.inputContainer}>
          <View style={styles.inputWrapper}>
            <TouchableOpacity style={styles.attachButton} onPress={() => setShowAttachMenu(true)} data-testid="attach-button">
              <Ionicons name="add-circle" size={28} color={Colors.primary} />
            </TouchableOpacity>
            <TextInput
              style={styles.textInput}
              placeholder={t('typeMessage')}
              placeholderTextColor={Colors.gray}
              value={inputText}
              onChangeText={setInputText}
              multiline
              maxLength={1000}
            />
            <TouchableOpacity 
              style={[styles.sendButton, (!inputText.trim() || isLoading) && styles.sendButtonDisabled]}
              onPress={() => sendMessage(inputText)}
              disabled={!inputText.trim() || isLoading}
              data-testid="send-button"
            >
              <Ionicons name="send" size={20} color={inputText.trim() && !isLoading ? Colors.white : Colors.gray} />
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  keyboardView: { flex: 1 },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    padding: Spacing.md, backgroundColor: Colors.white, borderBottomWidth: 1, borderBottomColor: Colors.grayLight,
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  haniAvatar: { width: 48, height: 48, borderRadius: 24, backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  haniAvatarImage: { width: 48, height: 48 },
  headerTitle: { fontSize: FontSizes.lg, fontWeight: '700', color: Colors.text },
  headerSubtitle: { fontSize: FontSizes.sm, color: Colors.textSecondary },
  messagesContainer: { flex: 1 },
  messagesContent: { padding: Spacing.md, paddingBottom: Spacing.lg },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: 100 },
  welcomeContainer: { alignItems: 'center', paddingTop: Spacing.xl, paddingHorizontal: Spacing.md },
  welcomeAvatar: { width: 80, height: 80, borderRadius: 40, backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center', marginBottom: Spacing.lg, overflow: 'hidden' },
  welcomeAvatarImage: { width: 80, height: 80 },
  welcomeTitle: { fontSize: FontSizes.xl, fontWeight: '700', color: Colors.text, marginBottom: Spacing.sm },
  welcomeText: { fontSize: FontSizes.md, color: Colors.textSecondary, textAlign: 'center', lineHeight: 24, marginBottom: Spacing.lg },
  quickActionsRow: { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.xl, width: '100%' },
  quickActionCard: {
    flex: 1, backgroundColor: Colors.white, borderRadius: BorderRadius.lg, padding: Spacing.md,
    alignItems: 'center', gap: 4, ...Shadows.sm, borderWidth: 1, borderColor: Colors.grayLight,
  },
  quickActionLabel: { fontSize: FontSizes.sm, fontWeight: '700', color: Colors.text },
  quickActionDesc: { fontSize: 10, color: Colors.textSecondary, textAlign: 'center' },
  suggestionsTitle: { fontSize: FontSizes.sm, fontWeight: '600', color: Colors.text, marginBottom: Spacing.md },
  suggestionsContainer: { width: '100%', gap: Spacing.sm },
  suggestionChip: {
    backgroundColor: Colors.white, paddingVertical: Spacing.md, paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.lg, borderWidth: 1, borderColor: Colors.primary + '40', ...Shadows.sm,
  },
  suggestionText: { fontSize: FontSizes.md, color: Colors.primary, textAlign: 'center' },
  messageContainer: { flexDirection: 'row', marginBottom: Spacing.md, alignItems: 'flex-end' },
  userMessage: { justifyContent: 'flex-end' },
  assistantMessage: { justifyContent: 'flex-start' },
  avatarContainer: { width: 32, height: 32, borderRadius: 16, backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center', marginRight: Spacing.sm, overflow: 'hidden' },
  avatarImage: { width: 32, height: 32 },
  messageBubble: { maxWidth: '75%', padding: Spacing.md, borderRadius: BorderRadius.lg },
  userBubble: { backgroundColor: Colors.primary, borderBottomRightRadius: 4 },
  assistantBubble: { backgroundColor: Colors.white, borderBottomLeftRadius: 4, ...Shadows.sm },
  messageText: { fontSize: FontSizes.md, color: Colors.text, lineHeight: 22 },
  userMessageText: { color: Colors.white },
  attachmentBadge: { marginBottom: 4 },
  ratingContainer: { flexDirection: 'row', marginTop: Spacing.sm, gap: Spacing.sm },
  ratingButton: { padding: Spacing.xs },
  ratingActive: { opacity: 1 },
  typingBubble: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  typingText: { fontSize: FontSizes.sm, color: Colors.textSecondary, fontStyle: 'italic' },
  inputContainer: { padding: Spacing.md, backgroundColor: Colors.white, borderTopWidth: 1, borderTopColor: Colors.grayLight },
  inputWrapper: { flexDirection: 'row', alignItems: 'flex-end', backgroundColor: Colors.background, borderRadius: BorderRadius.lg, paddingLeft: Spacing.xs, paddingRight: Spacing.xs, paddingVertical: Spacing.xs },
  attachButton: { padding: Spacing.sm, justifyContent: 'center' },
  textInput: { flex: 1, fontSize: FontSizes.md, color: Colors.text, maxHeight: 100, paddingVertical: Spacing.sm, paddingHorizontal: Spacing.sm },
  sendButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center' },
  sendButtonDisabled: { backgroundColor: Colors.grayLight },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  attachMenu: { backgroundColor: Colors.white, borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: Spacing.lg, paddingBottom: 40 },
  attachMenuTitle: { fontSize: FontSizes.lg, fontWeight: '700', color: Colors.text, textAlign: 'center', marginBottom: Spacing.lg },
  attachOptions: { flexDirection: 'row', justifyContent: 'space-around' },
  attachOption: { alignItems: 'center', gap: Spacing.sm, width: 90 },
  attachIconCircle: { width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center' },
  attachOptionLabel: { fontSize: FontSizes.sm, fontWeight: '700', color: Colors.text },
  attachOptionDesc: { fontSize: 10, color: Colors.textSecondary, textAlign: 'center' },
});
