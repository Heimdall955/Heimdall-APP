# Heimdall (HANI) - PRD

## Descripcion
App premium para monitoreo de salud canina, educacion y conexion con chaleco inteligente ESP32.

## Stack Tecnico
- **Frontend:** React Native / Expo SDK 54 / Expo Router
- **Backend:** FastAPI + Supabase (PostgreSQL + Storage)
- **AI:** OpenAI GPT-4o-mini
- **Hardware:** ESP32 BLE (chaleco inteligente)

## Funcionalidades Implementadas
- Onboarding usuario/perro con seleccion de idioma (es/en/it)
- Navegacion de 5 tabs (Inicio, Salud, Educacion, Chat, Perfil)
- Chat IA ilimitado con aprendizaje adaptativo
- Sistema de gamificacion (Huesos/XP/Achievements)
- Google Wallet (HANI Passport)
- Leaderboard global / Weekly Summary
- Historial clinico
- Suscripcion PRO solo para archivos multimedia
- Modo Oscuro/Claro con persistencia
- Rutas GPS v4: mapa claro, tabs rediseñados, podometro, senderos OSM
- Autenticacion Biometrica
- Progreso lecciones + Mi Progreso
- Diario de Emociones (pendiente tabla Supabase)
- Chaleco BLE ESP32 sin simulacion (pendiente EAS Build)
- Ejercicios UI rediseñada sin banner verde
- Notificaciones push locales: 5 tipos con toggles individuales en perfil
- **Traduccion completa i18n**: ejercicio.tsx, juego.tsx, diario.tsx refactorizados para usar archivos de datos centralizados multilenguaje (es/en/it) (16 Mar 2026)

## SQL Migrations Pendientes
```sql
ALTER TABLE chat_messages ADD COLUMN IF NOT EXISTS rating TEXT;
CREATE TABLE IF NOT EXISTS emotion_diary (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  dog_id UUID REFERENCES dogs(id),
  emotion VARCHAR NOT NULL,
  note TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_emotion_diary_user ON emotion_diary(user_id);
CREATE INDEX idx_emotion_diary_created ON emotion_diary(created_at);
```

## Tareas Pendientes
### P1 - Migracion SQL Weekly Summary
### P1 - Confirmar ejecucion script SQL (emotion_diary + chat rating)
### P2 - EAS Development Build
### P2 - RevenueCat + Google Play

## Archivos Clave
- frontend/data/exercisesContent.ts (traducciones ejercicios es/en/it)
- frontend/data/gamesContent.ts (traducciones juegos es/en/it)
- frontend/contexts/LanguageContext.tsx (traducciones UI generales + diario)
- frontend/app/ejercicio.tsx (usa getExerciseData)
- frontend/app/juego.tsx (usa getGameData)
- frontend/app/diario.tsx (usa useLanguage/t())
- frontend/services/NotificationService.ts
- frontend/app/(tabs)/perfil.tsx (modal de ajustes)
- frontend/app/_layout.tsx (inicializacion)
- frontend/app.json (plugin expo-notifications)
