# Heimdall (HANI) - PRD

## Descripcion
App premium para monitoreo de salud canina, educacion y conexion con chaleco inteligente.

## Stack Tecnico
- **Frontend:** React Native / Expo SDK 54 / Expo Router
- **Backend:** FastAPI + Supabase (PostgreSQL + Storage)
- **AI:** OpenAI GPT-4o-mini
- **Integraciones:** Google Wallet, react-native-ble-plx, RevenueCat (pendiente), OpenStreetMap Overpass API, Leaflet.js

## Funcionalidades Implementadas
- Onboarding usuario/perro con seleccion de idioma (es/en/it)
- Navegacion de 5 tabs (Inicio, Salud, Educacion, Chat, Perfil)
- Chat IA (Heimdall) con analisis de archivos - ILIMITADO para todos
- Sistema de gamificacion (Huesos/XP/Achievements)
- Google Wallet (HANI Passport)
- Leaderboard global / Weekly Summary
- Historial clinico
- Suscripcion PRO (MOCKED payments) - solo para archivos multimedia
- Seguridad: rate limiting, CORS, sanitizacion, proteccion IDOR
- Modo Oscuro/Claro con persistencia
- Rutas GPS v3: GDPR, podometro, senderos reales OSM, mapa Leaflet, favoritos
- Autenticacion Biometrica: Face ID/Touch ID/Huella, auto-login, toggle en Perfil
- Progreso de lecciones persistente
- Pantalla "Mi Progreso"
- Chat mejorado: Markdown renderer, emojis, like/dislike con feedback visual
- Heimdall companero fiel con aprendizaje adaptativo por feedback
- **Diario de Emociones**: Tarjeta en Home + pantalla dedicada con selector de emociones, notas, resumen semanal, historial y insights IA (16 Mar 2026)

## SQL Migrations Pendientes (para ejecutar en Supabase)
```sql
-- 1) Columna rating para chat_messages
ALTER TABLE chat_messages ADD COLUMN IF NOT EXISTS rating TEXT;

-- 2) Tabla emotion_diary
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
### P1 - Migracion SQL Weekly Summary (columnas en gamification)
### P1 - Traduccion Contenido Educativo (exercisesContent.ts, gamesContent.ts)
### P2 - Bluetooth Development Build
### P2 - Configurar RevenueCat con Google Play

## Mocked/Parcial
- Real BLE connectivity (MOCKED)
- Google Play Store / RevenueCat (MOCKED)
- Favoritos trails: local storage
- Rating chat: visual ok, persistencia pendiente columna
- Diario emociones: pendiente tabla emotion_diary en Supabase
