# Heimdall (HANI) - PRD

## Descripcion
App premium para monitoreo de salud canina, educacion y conexion con chaleco inteligente ESP32.

## Stack Tecnico
- **Frontend:** React Native / Expo SDK 54 / Expo Router
- **Backend:** FastAPI + Supabase (PostgreSQL + Storage)
- **AI:** OpenAI GPT-4o-mini
- **Hardware:** ESP32 BLE (chaleco inteligente)

## Funcionalidades Implementadas
- Onboarding usuario/perro con seleccion de idioma (es/en/it)
- Navegacion de 5 tabs (Inicio, Salud, Educacion, Chat, Perfil)
- Chat IA ilimitado con aprendizaje adaptativo
- Sistema de gamificacion (Huesos/XP/Achievements)
- Google Wallet (HANI Passport)
- Leaderboard global / Weekly Summary
- Historial clinico
- Suscripcion PRO (RevenueCat - actualmente en modo demo)
- Modo Oscuro/Claro con persistencia
- Rutas GPS v4: mapa claro, tabs rediseñados, podometro, senderos OSM
- Autenticacion Biometrica
- Progreso lecciones + Mi Progreso
- Diario de Emociones
- Chaleco BLE ESP32 sin simulacion (pendiente EAS Build)
- Ejercicios UI rediseñada
- Notificaciones push locales con toggles individuales
- Traduccion completa i18n: ejercicio, juego, diario, PRO, privacidad, ayuda (es/en/it) (16 Mar 2026)
- Pantalla de Privacidad y Datos (privacidad.tsx) (16 Mar 2026)
- Pantalla de Centro de Ayuda con FAQ (ayuda.tsx) (16 Mar 2026)
- Pantalla PRO traducida con i18n (16 Mar 2026)
- Todos los endpoints de DB verificados funcionando (weekly-summary, diary, lessons, subscription) (16 Mar 2026)

## Bases de Datos - Estado
- emotion_diary: CREADA y FUNCIONANDO
- chat_messages (rating column): CREADA y FUNCIONANDO
- gamification (weekly columns): CREADA y FUNCIONANDO
- lesson_progress: CREADA y FUNCIONANDO

## Tareas Pendientes
### P2 - EAS Development Build (Bluetooth real)
### P2 - RevenueCat produccion (reemplazar modo demo)
### P2 - Integrar Google Play Store

## Archivos Clave
- frontend/app/privacidad.tsx (pantalla de privacidad)
- frontend/app/ayuda.tsx (pantalla de ayuda con FAQ)
- frontend/app/pro.tsx (pantalla PRO con i18n)
- frontend/app/(tabs)/perfil.tsx (menu con navegacion a privacidad/ayuda)
- frontend/contexts/LanguageContext.tsx (traducciones completas es/en/it)
- frontend/data/exercisesContent.ts (traducciones ejercicios)
- frontend/data/gamesContent.ts (traducciones juegos)
- backend/server.py (todos los endpoints)
