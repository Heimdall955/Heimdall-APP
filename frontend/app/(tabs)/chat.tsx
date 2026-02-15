import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TextInput, 
  TouchableOpacity, 
  KeyboardAvoidingView, 
  Platform,
  ActivityIndicator,
  Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { useAuth } from '../../contexts/AuthContext';
import { Card } from '../../components/ui';
import { Colors, Spacing, BorderRadius, FontSizes, Shadows } from '../../constants/theme';
import { ChatMessage } from '../../types';

const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL || '';

const suggestedQuestions = [
  '¿Por qué mi perro ladra tanto?',
  'Juegos para días de lluvia',
  '¿Cuánto debe comer mi perro?',
];

export default function ChatScreen() {
  const { currentDog, user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    loadChatHistory();
  }, []);

  const loadChatHistory = async () => {
    try {
      const token = await SecureStore.getItemAsync('session_token');
      const response = await axios.get(
        `${BACKEND_URL}/api/chat/history`,
        {
          headers: { Authorization: `Bearer ${token}` },
          params: { dog_id: currentDog?.id, limit: 50 }
        }
      );
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
      id: `temp_${Date.now()}`,
      user_id: user?.user_id || '',
      dog_id: currentDog?.id,
      role: 'user',
      content: text.trim(),
      created_at: new Date().toISOString(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);

    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);

    try {
      const token = await SecureStore.getItemAsync('session_token');
      const response = await axios.post(
        `${BACKEND_URL}/api/chat`,
        {
          content: text.trim(),
          dog_id: currentDog?.id,
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      setMessages(prev => [...prev, response.data]);
    } catch (error: any) {
      Alert.alert('Error', 'No se pudo enviar el mensaje. Inténtalo de nuevo.');
      // Remove the user message if failed
      setMessages(prev => prev.filter(m => m.id !== userMessage.id));
    } finally {
      setIsLoading(false);
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  };

  const rateMessage = async (messageId: string, rating: 'up' | 'down') => {
    try {
      const token = await SecureStore.getItemAsync('session_token');
      await axios.post(
        `${BACKEND_URL}/api/chat/${messageId}/rate`,
        { rating },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setMessages(prev => prev.map(m => 
        m.id === messageId ? { ...m, rating } : m
      ));
    } catch (error) {
      console.log('Error rating message:', error);
    }
  };

  const renderMessage = (message: ChatMessage) => {
    const isUser = message.role === 'user';
    
    return (
      <View 
        key={message.id} 
        style={[styles.messageContainer, isUser ? styles.userMessage : styles.assistantMessage]}
      >
        {!isUser && (
          <View style={styles.avatarContainer}>
            <Ionicons name="paw" size={20} color={Colors.white} />
          </View>
        )}
        <View style={[styles.messageBubble, isUser ? styles.userBubble : styles.assistantBubble]}>
          <Text style={[styles.messageText, isUser && styles.userMessageText]}>
            {message.content}
          </Text>
          {!isUser && (
            <View style={styles.ratingContainer}>
              <TouchableOpacity 
                onPress={() => rateMessage(message.id, 'up')}
                style={[styles.ratingButton, message.rating === 'up' && styles.ratingActive]}
              >
                <Ionicons 
                  name={message.rating === 'up' ? 'thumbs-up' : 'thumbs-up-outline'} 
                  size={16} 
                  color={message.rating === 'up' ? Colors.primary : Colors.gray} 
                />
              </TouchableOpacity>
              <TouchableOpacity 
                onPress={() => rateMessage(message.id, 'down')}
                style={[styles.ratingButton, message.rating === 'down' && styles.ratingActive]}
              >
                <Ionicons 
                  name={message.rating === 'down' ? 'thumbs-down' : 'thumbs-down-outline'} 
                  size={16} 
                  color={message.rating === 'down' ? Colors.error : Colors.gray} 
                />
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <KeyboardAvoidingView 
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <View style={styles.haniAvatar}>
              <Ionicons name="paw" size={24} color={Colors.white} />
            </View>
            <View>
              <Text style={styles.headerTitle}>Hani</Text>
              <Text style={styles.headerSubtitle}>Tu asistente Heimdall</Text>
            </View>
          </View>
        </View>

        {/* Chat Messages */}
        <ScrollView 
          ref={scrollViewRef}
          style={styles.messagesContainer}
          contentContainerStyle={styles.messagesContent}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: false })}
        >
          {isLoadingHistory ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={Colors.primary} />
            </View>
          ) : messages.length === 0 ? (
            <View style={styles.welcomeContainer}>
              <View style={styles.welcomeAvatar}>
                <Ionicons name="paw" size={48} color={Colors.white} />
              </View>
              <Text style={styles.welcomeTitle}>¡Hola! Soy Hani 🐕</Text>
              <Text style={styles.welcomeText}>
                Hoy vengo en modo cachorro curioso... pero si hablamos de salud animal, me pongo serio. ¿Qué necesitas?
              </Text>
              
              <Text style={styles.suggestionsTitle}>Prueba preguntar:</Text>
              <View style={styles.suggestionsContainer}>
                {suggestedQuestions.map((question, index) => (
                  <TouchableOpacity 
                    key={index}
                    style={styles.suggestionChip}
                    onPress={() => sendMessage(question)}
                  >
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
                <Ionicons name="paw" size={20} color={Colors.white} />
              </View>
              <View style={[styles.messageBubble, styles.assistantBubble, styles.typingBubble]}>
                <ActivityIndicator size="small" color={Colors.primary} />
                <Text style={styles.typingText}>Hani está escribiendo...</Text>
              </View>
            </View>
          )}
        </ScrollView>

        {/* Input Area */}
        <View style={styles.inputContainer}>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.textInput}
              placeholder="Escribe tu mensaje..."
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
            >
              <Ionicons 
                name="send" 
                size={20} 
                color={inputText.trim() && !isLoading ? Colors.white : Colors.gray} 
              />
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  keyboardView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.md,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.grayLight,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  haniAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: FontSizes.lg,
    fontWeight: '700',
    color: Colors.text,
  },
  headerSubtitle: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    padding: Spacing.md,
    paddingBottom: Spacing.lg,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  welcomeContainer: {
    alignItems: 'center',
    paddingTop: Spacing.xl,
    paddingHorizontal: Spacing.md,
  },
  welcomeAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.lg,
  },
  welcomeTitle: {
    fontSize: FontSizes.xl,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: Spacing.sm,
  },
  welcomeText: {
    fontSize: FontSizes.md,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: Spacing.xl,
  },
  suggestionsTitle: {
    fontSize: FontSizes.sm,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: Spacing.md,
  },
  suggestionsContainer: {
    width: '100%',
    gap: Spacing.sm,
  },
  suggestionChip: {
    backgroundColor: Colors.white,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.primary + '40',
    ...Shadows.sm,
  },
  suggestionText: {
    fontSize: FontSizes.md,
    color: Colors.primary,
    textAlign: 'center',
  },
  messageContainer: {
    flexDirection: 'row',
    marginBottom: Spacing.md,
    alignItems: 'flex-end',
  },
  userMessage: {
    justifyContent: 'flex-end',
  },
  assistantMessage: {
    justifyContent: 'flex-start',
  },
  avatarContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.sm,
  },
  messageBubble: {
    maxWidth: '75%',
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
  },
  userBubble: {
    backgroundColor: Colors.primary,
    borderBottomRightRadius: 4,
  },
  assistantBubble: {
    backgroundColor: Colors.white,
    borderBottomLeftRadius: 4,
    ...Shadows.sm,
  },
  messageText: {
    fontSize: FontSizes.md,
    color: Colors.text,
    lineHeight: 22,
  },
  userMessageText: {
    color: Colors.white,
  },
  ratingContainer: {
    flexDirection: 'row',
    marginTop: Spacing.sm,
    gap: Spacing.sm,
  },
  ratingButton: {
    padding: Spacing.xs,
  },
  ratingActive: {
    opacity: 1,
  },
  typingBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  typingText: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
    fontStyle: 'italic',
  },
  inputContainer: {
    padding: Spacing.md,
    backgroundColor: Colors.white,
    borderTopWidth: 1,
    borderTopColor: Colors.grayLight,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.lg,
    paddingLeft: Spacing.md,
    paddingRight: Spacing.xs,
    paddingVertical: Spacing.xs,
  },
  textInput: {
    flex: 1,
    fontSize: FontSizes.md,
    color: Colors.text,
    maxHeight: 100,
    paddingVertical: Spacing.sm,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: Colors.grayLight,
  },
});
