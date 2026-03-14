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
- Rutas GPS v3: GDPR, podometro, senderos reales OSM, mapa Leaflet, favoritos
- Autenticacion Biometrica: Face ID/Touch ID/Huella, auto-login, toggle en Perfil
- Fix teclado movil: KeyboardAvoidingView en todas las pantallas
- Progreso de lecciones persistente: Endpoints POST/GET /api/lessons/progress (14 Mar 2026)
- **Pantalla "Mi Progreso"**: Vista completa del progreso educativo con anillo global, stats, barras de progreso por programa, lecciones recientes y mensajes motivacionales. Accesible desde tab Educacion (14 Mar 2026)

## Tareas Pendientes
### P1 - Migracion SQL Weekly Summary
### P1 - Traduccion Contenido Educativo
### P2 - Bluetooth Development Build
### P2 - Configurar RevenueCat con Google Play

## Mocked Features
- Real BLE connectivity
- Google Play Store / RevenueCat payment processing
- Favoritos trails: almacenados localmente (pendiente tabla Supabase)

## Archivos Clave
- backend/server.py (endpoints /api/lessons/progress)
- frontend/app/progreso.tsx (pantalla Mi Progreso)
- frontend/app/programa.tsx (carga progreso desde API)
- frontend/app/leccion.tsx (guarda progreso al completar)
- frontend/app/(tabs)/educacion.tsx (boton navegacion a Mi Progreso)
- frontend/app/_layout.tsx (ruta progreso registrada)
