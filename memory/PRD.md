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
- Leaderboard global
- Weekly Summary
- Historial clinico
- Suscripcion PRO
- Seguridad: rate limiting, CORS, sanitizacion, proteccion IDOR
- Modo Oscuro/Claro: Toggle en header y perfil, persistencia via SecureStore
- **Sistema FREE/PRO con limites diarios** (Feb 2026):
  - Chat: 5 mensajes/dia FREE, ilimitado PRO
  - Foto: 1/dia FREE, ilimitado PRO
  - Video: Solo PRO
  - Analisis PDF: Solo PRO
  - Contador de uso visible en header del chat
  - Modal de upgrade PRO al alcanzar limites
  - Badges PRO en botones bloqueados
  - Backend: enforcement de limites + endpoint de activacion
  - Precios: 4,90 EUR/mes, 39,90 EUR/ano

## Bugs corregidos (Feb 2026)
- `styles is not defined`: useMemo dentro de if blocks en leccion, juego, pro, programa
- `styles is not defined`: useMemo dentro del JSX return en 8 pantallas secundarias
- `colors is not defined` a nivel de modulo en salud, perfil, ejercicio, historial-medico, pro
- `shadows is not defined` en perfil y pro
- **rutas.tsx**: useMemo colocado dentro de useEffect - movido al nivel del componente
- **leaderboard.tsx**: useMemo colocado dentro de renderPodium() - movido al nivel del componente
- **salud.tsx**: referencia a `eventTypeConfig` en vez de `EVENT_TYPE_CONFIG` corregida

## Build Fixes (Feb 2026)
- Fix critico EAS: @expo/config-plugins version ~54.0.4 + overrides/resolutions
- Eliminado package-lock.json (conflicto con yarn.lock en EAS)
- Iconos redimensionados: icon.png, adaptive-icon.png, favicon.png a 512x512
- Creado splash-icon.png (referenciado en app.json pero no existia)
- Agregado resolutions de yarn para @expo/config-plugins
- TypeScript: 0 errores (corregidos duplicados en LanguageContext, tipos en bluetooth/rutas/purchases/ejercicio/Card)
- **@types/react movido de devDependencies a dependencies** (npm build omite devDeps)
- **Creado .easignore** para excluir cache dirs y archivos corruptos del tarball de EAS
- **Actualizado .gitignore** con .metro-cache/ y .ruff_cache/
- **Limpieza de cache dirs**: .metro-cache, .ruff_cache, dist, .expo, __pycache__
- **eas.json**: Agregado appVersionSource: "local"

## Estado de Testing (Feb 2026)
- Backend: 10/10 tests PASS sistema PRO (100%)
- Frontend: Chat con limites, pantalla PRO, 5 tabs verificados (100%)
- TypeScript: 0 errores con --noEmit
- expo-doctor: 16/17 checks pass (1 advisory warning sobre @expo/config-plugins)

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

### P2 - Configurar RevenueCat con Google Play
- Crear cuenta RevenueCat
- Configurar productos en Google Play Console
- Reemplazar simulacion por RevenueCat real

## Mocked Features
- Real BLE connectivity (simulado en web/Expo Go)
- Google Play Store / RevenueCat payment processing en pro.tsx
