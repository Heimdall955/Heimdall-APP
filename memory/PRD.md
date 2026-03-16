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
- **Ejercicios UI rediseñada**: Sin banner verde, header limpio, SafeAreaView bottom, barra progreso, cards coloreadas por tema (16 Mar 2026)

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
### P1 - Traduccion Contenido Educativo
### P2 - EAS Development Build
### P2 - RevenueCat + Google Play
