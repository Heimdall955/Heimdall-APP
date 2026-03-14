# Heimdall (HANI) - PRD

## Descripcion
App premium para monitoreo de salud canina, educacion y conexion con chaleco inteligente.

## Stack Tecnico
- **Frontend:** React Native / Expo SDK 54 / Expo Router
- **Backend:** FastAPI + Supabase (PostgreSQL + Storage)
- **AI:** OpenAI GPT-4o-mini
- **Integraciones:** Google Wallet, react-native-ble-plx, RevenueCat (pendiente config), OpenStreetMap Overpass API

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
- **Rutas GPS v2** (Mar 2026):
  - Consentimiento GDPR/RGPD antes de pedir ubicacion (Art. 6(1)(a))
  - Permiso de ubicacion con UI dedicada (conceder/denegado/ajustes)
  - Podometro integrado (expo-sensors)
  - Rutas de senderismo REALES via OpenStreetMap Overpass API
  - Distancia al usuario, dificultad, Dog-friendly, superficie, duracion estimada
  - Fix: data mismatch corregido (distance_km, duration_minutes, coordinates)
  - Diseno moderno con tabs, animaciones, estadisticas en vivo

## Build Fixes (Feb 2026)
- Fix critico: @expo/config-plugins ELIMINADO de dependencies
- overrides: version explicita "54.0.4"
- resolutions de yarn: ~54.0.4
- @types/react movido a dependencies
- eslint-config-expo movido a dependencies
- .easignore creado para excluir cache dirs
- package-lock.json eliminado
- Iconos 512x512, splash-icon.png creado
- TypeScript: 0 errores
- appVersionSource: "local" en eas.json

## Tareas Pendientes
### P1 - Migracion SQL Weekly Summary
### P1 - Traduccion Contenido Educativo
### P2 - Bluetooth Development Build
### P2 - Configurar RevenueCat con Google Play

## Mocked Features
- Real BLE connectivity
- Google Play Store / RevenueCat payment processing

## API Endpoints Nuevos
- GET /api/trails/nearby?lat=X&lng=X&radius=15000 - Rutas de senderismo reales via OpenStreetMap
