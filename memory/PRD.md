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
  - GDPR/RGPD, podometro, senderos reales via OSM, mapa Leaflet, favoritos locales
- **Autenticacion Biometrica** (Mar 2026):
  - Face ID / Touch ID / Huella dactilar via expo-local-authentication
  - Tras primer login exitoso: oferta activar biometria con Alert
  - Auto-login biometrico al iniciar app (index.tsx)
  - Toggle activar/desactivar en Perfil (menu items)
  - Credenciales cifradas en SecureStore
  - Compatible Android (huella, Face Unlock) e iOS (Face ID, Touch ID)

## Archivos nuevos/modificados
- `/app/frontend/utils/biometricAuth.ts` - Servicio biometria (check, auth, save, disable)
- `/app/frontend/app/index.tsx` - Auto-login biometrico al inicio
- `/app/frontend/app/onboarding/registro.tsx` - Oferta activar biometria tras login
- `/app/frontend/app/(tabs)/perfil.tsx` - Toggle biometria en menu

## Tareas Pendientes
### P1 - Migracion SQL Weekly Summary
### P1 - Traduccion Contenido Educativo
### P2 - Bluetooth Development Build
### P2 - Configurar RevenueCat con Google Play

## Mocked Features
- Real BLE connectivity
- Google Play Store / RevenueCat payment processing
- Favoritos trails: almacenados localmente (pendiente tabla Supabase)
