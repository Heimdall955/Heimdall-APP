# Heimdall (HANI) - PRD

## Descripcion
App premium para monitoreo de salud canina, educacion y conexion con chaleco inteligente ESP32.

## Stack Tecnico
- **Frontend:** React Native / Expo SDK 54 / Expo Router
- **Backend:** FastAPI + Supabase (PostgreSQL + Storage)
- **AI:** OpenAI GPT-4o-mini
- **Hardware:** ESP32 BLE (chaleco inteligente)
- **Integraciones:** Google Wallet, react-native-ble-plx, RevenueCat (pendiente), OpenStreetMap Overpass API, Leaflet.js

## Funcionalidades Implementadas
- Onboarding usuario/perro con seleccion de idioma (es/en/it)
- Navegacion de 5 tabs (Inicio, Salud, Educacion, Chat, Perfil)
- Chat IA (Heimdall) ilimitado con aprendizaje adaptativo
- Sistema de gamificacion (Huesos/XP/Achievements)
- Google Wallet (HANI Passport)
- Leaderboard global / Weekly Summary
- Historial clinico
- Suscripcion PRO solo para archivos multimedia
- Modo Oscuro/Claro con persistencia
- Rutas GPS v4: mapa claro, tabs rediseñados, podometro, senderos OSM
- Autenticacion Biometrica
- Progreso lecciones + Pantalla Mi Progreso
- Diario de Emociones (pendiente tabla en Supabase)
- **Chaleco BLE real (ESP32)**: UI completamente rediseñada sin simulacion. Escaneo BLE real, dashboard de vitales (FC, temp, actividad, bateria), guia de conexion. Salud redirige a pantalla de chaleco. Funciona con EAS Build (16 Mar 2026)

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
### P2 - Crear EAS Development Build (para activar BLE real en movil)
### P2 - Configurar RevenueCat con Google Play

## Archivos Clave BLE
- frontend/app/chaleco.tsx (pantalla principal chaleco)
- frontend/services/bluetooth.ts (servicio BLE con react-native-ble-plx)
- frontend/contexts/BluetoothContext.tsx (contexto BLE global)
- frontend/app/(tabs)/salud.tsx (boton conectar -> navega a /chaleco)
