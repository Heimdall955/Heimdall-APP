// Type definitions for Heimdall app

export interface User {
  user_id: string;
  email: string;
  name: string;
  picture?: string;
  created_at: string;
  language?: 'es' | 'en' | 'it';
}

export interface Dog {
  id: string;
  user_id: string;
  name: string;
  age: number; // in months
  weight: number; // in kg
  pet_type?: 'dog' | 'cat' | 'rodent' | 'bird';
  sex?: 'male' | 'female';
  breed?: string;
  chip_id?: string;
  avatar?: string;
  neutered?: boolean;
  allergies?: string;
  created_at: string;
  updated_at: string;
}

export interface ChatMessage {
  id: string;
  user_id: string;
  dog_id?: string;
  role: 'user' | 'assistant';
  content: string;
  rating?: 'up' | 'down';
  created_at: string;
}

export interface HealthStatus {
  physical: number;
  sleep: number;
  mental: number;
  nutrition: number;
}

export interface DogStatus {
  status: 'calm' | 'active' | 'anxious' | 'sleeping' | 'playing';
  bones: number;
  level_progress: number;
  level_target: number;
}

export interface MedicalEvent {
  id: string;
  dog_id: string;
  type: 'vaccine' | 'checkup' | 'deworming' | 'note' | 'medication';
  title: string;
  description?: string;
  date: string;
  next_date?: string;
  created_at: string;
}

export type Language = 'es' | 'en' | 'it';

export interface OnboardingState {
  language: Language;
  user?: User;
  dog?: Dog;
  completed: boolean;
}
