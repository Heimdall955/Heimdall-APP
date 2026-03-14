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
- Sistema FREE/PRO con limites diarios
- **Rutas GPS v3** (Mar 2026):
  - Consentimiento GDPR/RGPD (Art. 6(1)(a)) con pantalla legal completa
  - Permiso de ubicacion con UI dedicada (conceder/denegado/ajustes)
  - Podometro integrado (expo-sensors)
  - Rutas de senderismo REALES via OpenStreetMap Overpass API
  - **Mapa interactivo** con Leaflet.js via WebView (dark theme, marcadores por dificultad)
  - **Favoritos** guardados localmente con SecureStore
  - Leyenda del mapa + estadisticas rapidas (senderos, dog-friendly, favoritos)
  - Seleccion de sendero en el mapa con detalle expandible
  - Distancia al usuario, dificultad, Dog-friendly, superficie, duracion estimada
  - Fix: data mismatch corregido (distance_km, duration_minutes, coordinates)
  - Diseno moderno con 4 tabs (Paseo, Mapa, Senderos, Historial)

## Archivos nuevos creados
- `/app/frontend/components/TrailMap.tsx` - Componente mapa Leaflet via WebView
- Backend: endpoints /api/trails/nearby, /api/trails/favorites (CRUD)

## Tareas Pendientes
### P1 - Migracion SQL Weekly Summary
### P1 - Traduccion Contenido Educativo
### P2 - Bluetooth Development Build
### P2 - Configurar RevenueCat con Google Play

## Mocked Features
- Real BLE connectivity
- Google Play Store / RevenueCat payment processing
- Favoritos: almacenados localmente (pendiente tabla Supabase `favorite_trails`)

## API Endpoints
- GET /api/trails/nearby?lat=X&lng=X&radius=15000
- POST/GET/DELETE /api/trails/favorites (requiere tabla Supabase)
