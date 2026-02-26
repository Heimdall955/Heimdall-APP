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
- Modo Oscuro/Claro: Toggle en header y perfil, persistencia via SecureStore

## Bugs corregidos (Feb 2026)
- `styles is not defined`: useMemo dentro de if blocks en leccion, juego, pro, programa
- `styles is not defined`: useMemo dentro del JSX return en 8 pantallas secundarias
- `colors is not defined` a nivel de modulo en salud, perfil, ejercicio, historial-medico, pro
- `shadows is not defined` en perfil y pro

## Tareas Pendientes
### P0 - Migracion SQL Weekly Summary
### P1 - Traduccion Contenido Educativo
### P2 - Bluetooth Development Build
