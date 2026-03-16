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
- Chat IA (Heimdall) con analisis de archivos
- Sistema de gamificacion (Huesos/XP/Achievements)
- Google Wallet (HANI Passport)
- Leaderboard global / Weekly Summary
- Historial clinico
- Suscripcion PRO (MOCKED payments)
- Seguridad: rate limiting, CORS, sanitizacion, proteccion IDOR
- Modo Oscuro/Claro con persistencia
- Sistema FREE/PRO: PRO solo para fotos, videos y PDFs. Chat ILIMITADO para todos
- Rutas GPS v3: GDPR, podometro, senderos reales OSM, mapa Leaflet, favoritos
- Autenticacion Biometrica: Face ID/Touch ID/Huella, auto-login, toggle en Perfil
- Fix teclado movil: KeyboardAvoidingView en todas las pantallas
- Progreso de lecciones persistente: Endpoints POST/GET /api/lessons/progress (14 Mar 2026)
- Pantalla "Mi Progreso": Vista completa con anillo global, stats, barras por programa (14 Mar 2026)
- Chat mejorado: Markdown renderer (negritas), emojis, botones like/dislike con feedback visual (16 Mar 2026)
- **Chat ilimitado**: Eliminado limite de 5 mensajes/dia. PRO solo para archivos multimedia (16 Mar 2026)
- **Heimdall companero fiel**: System prompt con personalidad de companero cercano y empatico (Sec 20) (16 Mar 2026)
- **Aprendizaje adaptativo**: Heimdall analiza feedback (like/dislike) del usuario y ajusta estilo/tono/extension (Sec 21) (16 Mar 2026)

## SQL Migrations Pendientes (para ejecutar en Supabase)
```sql
-- Columna rating para chat_messages (para persistir like/dislike entre sesiones)
ALTER TABLE chat_messages ADD COLUMN IF NOT EXISTS rating TEXT;
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
- Rating de chat: funciona visualmente, persistencia DB pendiente de columna rating
