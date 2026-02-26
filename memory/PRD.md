# Heimdall (HANI) - PRD

## Descripcion
App premium para monitoreo de salud canina, educacion y conexion con chaleco inteligente.

## Stack Tecnico
- **Frontend:** React Native / Expo / Expo Router
- **Backend:** FastAPI + Supabase (PostgreSQL + Storage)
- **AI:** OpenAI GPT-4o-mini
- **Integraciones:** Google Wallet, react-native-ble-plx

## Funcionalidades Implementadas
- Onboarding usuario/perro con seleccion de idioma (es/en/it)
- Navegacion de 5 tabs (Inicio, Salud, Educacion, Chat, Perfil)
- Chat IA (Heimdall) con analisis de archivos
- Sistema de gamificacion (Huesos/XP/Achievements)
- Google Wallet (HANI Passport)
- Leaderboard global
- Weekly Summary
- Historial clinico
- Suscripcion PRO
- Seguridad: rate limiting, CORS, sanitizacion, proteccion IDOR
- **Modo Oscuro/Claro** (Feb 2026): Toggle en header y perfil, persistencia via SecureStore, tema completo en todos los screens

## Tareas Pendientes

### P0 - Migracion SQL Weekly Summary
- Proporcionar script ALTER TABLE al usuario para columnas weekly_bones, weekly_xp, etc.

### P1 - Traduccion Contenido Educativo
- lessonsContent.ts: COMPLETADO
- exercisesContent.ts: PENDIENTE
- gamesContent.ts: PENDIENTE
- Refactorizar leccion.tsx, ejercicio.tsx, juego.tsx para usar archivos de datos

### P2 - Bluetooth Development Build
- Guiar al usuario para crear un EAS Development Build

## Arquitectura de Tema (Dark/Light Mode)
- `/app/frontend/contexts/ThemeContext.tsx` - Contexto principal con LightColors/DarkColors
- Todos los screens usan `useTheme()` hook para colores dinamicos
- StyleSheets convertidos a factory pattern `createStyles(colors, shadows)`
- Persistencia en SecureStore
- Toggle: Header (sol/luna) + Perfil (menu "Apariencia")
