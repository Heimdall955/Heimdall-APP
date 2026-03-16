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
- Heimdall companero fiel con aprendizaje adaptativo por feedback
- Sistema de gamificacion (Huesos/XP/Achievements)
- Google Wallet (HANI Passport)
- Leaderboard global / Weekly Summary
- Historial clinico
- Suscripcion PRO solo para archivos multimedia
- Seguridad: rate limiting, CORS, sanitizacion, proteccion IDOR
- Modo Oscuro/Claro con persistencia
- Rutas GPS v4: mapa claro (voyager tiles), tabs rediseñados, podometro con pasos del dia, mejor manejo de errores GPS
- Autenticacion Biometrica: Face ID/Touch ID/Huella
- Progreso de lecciones persistente + Pantalla "Mi Progreso"
- Diario de Emociones (pendiente tabla en Supabase)

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
### P2 - Bluetooth Development Build
### P2 - Configurar RevenueCat con Google Play
