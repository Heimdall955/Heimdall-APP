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
- **rutas.tsx**: useMemo colocado dentro de useEffect - movido al nivel del componente
- **leaderboard.tsx**: useMemo colocado dentro de renderPodium() - movido al nivel del componente
- **salud.tsx**: referencia a `eventTypeConfig` en vez de `EVENT_TYPE_CONFIG` corregida

## Estado de Testing (Feb 2026)
- Backend: 11/11 tests PASS (100%)
- Frontend: Todas las 5 pestanas + 3 bug fixes verificados (100%)
- Test report: /app/test_reports/iteration_3.json

## Tareas Pendientes
### P1 - Migracion SQL Weekly Summary
- Columnas faltantes en tabla gamification: weekly_bones, weekly_xp, weekly_lessons, weekly_exercises, weekly_games
- Requiere que el usuario ejecute un ALTER TABLE en Supabase SQL Editor

### P1 - Traduccion Contenido Educativo
- lessonsContent.ts completado
- Falta: exercisesContent.ts, gamesContent.ts
- Refactorizar leccion.tsx, ejercicio.tsx, juego.tsx para usar datos centralizados

### P2 - Bluetooth Development Build
- BLE esta mocked en web y Expo Go
- Requiere Development Build con EAS para testing real
