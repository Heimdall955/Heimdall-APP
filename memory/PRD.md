# Heimdall (HANI) - PRD

## Descripcion
App premium para monitoreo de salud canina, educacion y conexion con chaleco inteligente.

## Stack Tecnico
- **Frontend:** React Native / Expo SDK 54 / Expo Router
- **Backend:** FastAPI + Supabase (PostgreSQL + Storage)
- **AI:** OpenAI GPT-4o-mini
- **Integraciones:** Google Wallet, react-native-ble-plx, RevenueCat (pendiente config)

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
- **Rutas GPS mejoradas** (Feb 2026):
  - Permiso de ubicacion con UI dedicada
  - Podometro integrado (expo-sensors)
  - Sugerencias de rutas de senderismo con dificultad y Dog-friendly
  - Diseno moderno con tabs, animaciones, estadisticas en vivo
  - Fix: data mismatch corregido (distance_km, duration_minutes, coordinates)

## Build Fixes (Feb 2026)
- Fix critico: @expo/config-plugins ELIMINADO de dependencies (build system lo cambiaba a v55 incompatible con SDK 54)
- overrides cambiado de "$@expo/config-plugins" a version explicita "54.0.4"
- resolutions de yarn: ~54.0.4
- @types/react movido a dependencies
- eslint-config-expo movido a dependencies
- .easignore creado para excluir cache dirs
- package-lock.json eliminado (conflicto con yarn.lock)
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
