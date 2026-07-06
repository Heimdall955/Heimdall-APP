import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { SecureStore } from '../utils/secureStore';
import * as Linking from 'expo-linking';
import * as WebBrowser from 'expo-web-browser';
import { Platform } from 'react-native';
import axios from 'axios';
import { User, Dog, Language } from '../types';

import { BACKEND_URL } from '../config/backend';

interface AuthContextType {
  user: User | null;
  currentDog: Dog | null;
  dogs: Dog[];
  isLoading: boolean;
  isAuthenticated: boolean;
  language: Language;
  setLanguage: (lang: Language) => void;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  setCurrentDog: (dog: Dog) => void;
  refreshDogs: () => Promise<void>;
  onboardingCompleted: boolean;
  setOnboardingCompleted: (value: boolean) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [currentDog, setCurrentDog] = useState<Dog | null>(null);
  const [dogs, setDogs] = useState<Dog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [language, setLanguageState] = useState<Language>('es');
  const [onboardingCompleted, setOnboardingCompletedState] = useState(false);

  const api = axios.create({
    baseURL: `${BACKEND_URL}/api`,
    headers: { 'Content-Type': 'application/json' },
  });

  // Add auth token to requests
  api.interceptors.request.use(async (config) => {
    const token = await SecureStore.getItemAsync('session_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  const setLanguage = async (lang: Language) => {
    setLanguageState(lang);
    await SecureStore.setItemAsync('language', lang);
  };

  const setOnboardingCompleted = async (value: boolean) => {
    setOnboardingCompletedState(value);
    await SecureStore.setItemAsync('onboarding_completed', value ? 'true' : 'false');
  };

  const checkAuth = async () => {
    try {
      const token = await SecureStore.getItemAsync('session_token');
      const savedLang = await SecureStore.getItemAsync('language');
      const savedOnboarding = await SecureStore.getItemAsync('onboarding_completed');
      
      if (savedLang) setLanguageState(savedLang as Language);
      if (savedOnboarding === 'true') setOnboardingCompletedState(true);

      if (token) {
        const response = await api.get('/auth/me');
        setUser(response.data);
        await refreshDogs();
      }
    } catch (error) {
      console.log('Auth check failed:', error);
      await SecureStore.deleteItemAsync('session_token');
    } finally {
      setIsLoading(false);
    }
  };

  const processSessionId = async (sessionId: string) => {
    try {
      setIsLoading(true);
      const response = await api.post('/auth/session', { session_id: sessionId });
      const { session_token, user: userData } = response.data;
      
      await SecureStore.setItemAsync('session_token', session_token);
      setUser(userData);
      await refreshDogs();
    } catch (error) {
      console.error('Session processing failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const init = async () => {
      // Check for session_id in URL (Google OAuth callback)
      if (Platform.OS === 'web') {
        const hash = window.location.hash;
        if (hash.includes('session_id=')) {
          const sessionId = hash.split('session_id=')[1]?.split('&')[0];
          if (sessionId) {
            window.location.hash = '';
            await processSessionId(sessionId);
            return;
          }
        }
      } else {
        const url = await Linking.getInitialURL();
        if (url && url.includes('session_id=')) {
          const sessionId = url.split('session_id=')[1]?.split('&')[0];
          if (sessionId) {
            await processSessionId(sessionId);
            return;
          }
        }
      }
      
      await checkAuth();
    };
    
    init();
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await api.post('/auth/login', { email, password });
      const { session_token, user: userData } = response.data;
      
      await SecureStore.setItemAsync('session_token', session_token);
      setUser(userData);
      await refreshDogs();
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (email: string, password: string, name: string) => {
    setIsLoading(true);
    try {
      const response = await api.post('/auth/register', { email, password, name });
      const { session_token, user: userData } = response.data;
      
      await SecureStore.setItemAsync('session_token', session_token);
      setUser(userData);
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithGoogle = async () => {
    let redirectUrl: string;
    if (Platform.OS === 'web') {
      redirectUrl = window.location.origin + '/';
    } else {
      redirectUrl = Linking.createURL('/');
    }
    
    const authUrl = `https://auth.emergentagent.com/?redirect=${encodeURIComponent(redirectUrl)}`;
    
    if (Platform.OS === 'web') {
      window.location.href = authUrl;
    } else {
      const result = await WebBrowser.openAuthSessionAsync(authUrl, redirectUrl);
      if (result.type === 'success' && result.url) {
        const url = result.url;
        let sessionId: string | null = null;
        
        if (url.includes('#session_id=')) {
          sessionId = url.split('#session_id=')[1]?.split('&')[0];
        } else if (url.includes('?session_id=')) {
          sessionId = url.split('?session_id=')[1]?.split('&')[0];
        }
        
        if (sessionId) {
          await processSessionId(sessionId);
        }
      }
    }
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      console.log('Logout error:', error);
    }
    await SecureStore.deleteItemAsync('session_token');
    setUser(null);
    setDogs([]);
    setCurrentDog(null);
    setOnboardingCompletedState(false);
  };

  const refreshDogs = async () => {
    try {
      const response = await api.get('/dogs');
      setDogs(response.data);
      if (response.data.length > 0) {
        // Si hay perros, el onboarding está completado
        if (!currentDog) {
          setCurrentDog(response.data[0]);
        }
        // Marcar onboarding como completado si hay perros
        if (!onboardingCompleted) {
          setOnboardingCompletedState(true);
          await SecureStore.setItemAsync('onboarding_completed', 'true');
        }
      }
    } catch (error) {
      console.log('Failed to fetch dogs:', error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        currentDog,
        dogs,
        isLoading,
        isAuthenticated: !!user,
        language,
        setLanguage,
        login,
        register,
        loginWithGoogle,
        logout,
        setCurrentDog,
        refreshDogs,
        onboardingCompleted,
        setOnboardingCompleted,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
