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

## Arquitectura de Tema (Dark/Light Mode)
- `/app/frontend/contexts/ThemeContext.tsx` - Contexto con LightColors/DarkColors
- Todos los screens usan `useTheme()` hook + `createStyles(colors, shadows)` factory
- Persistencia en SecureStore
- Toggle: Header (sol/luna) + Perfil (menu "Apariencia")

## Bugs corregidos (Feb 2026)
- `styles is not defined` en historial-medico, leccion, ejercicio, juego, pro, rutas, programa, leaderboard: useMemo estaba dentro del JSX return en vez de antes
- `colors is not defined` a nivel de modulo en salud, perfil, ejercicio, historial-medico, pro: constantes movidas dentro del componente
- `shadows is not defined` en perfil y pro: faltaba destructurar shadows de useTheme

## Tareas Pendientes

### P0 - Migracion SQL Weekly Summary
- Script ALTER TABLE para columnas weekly_bones, weekly_xp, etc.

### P1 - Traduccion Contenido Educativo
- lessonsContent.ts: COMPLETADO
- exercisesContent.ts: PENDIENTE
- gamesContent.ts: PENDIENTE
- Refactorizar leccion.tsx, ejercicio.tsx, juego.tsx para usar archivos de datos

### P2 - Bluetooth Development Build
- Guiar al usuario para crear un EAS Development Build
