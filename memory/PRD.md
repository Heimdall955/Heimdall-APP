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
- Pantalla de Privacidad y Datos
- Pantalla de Centro de Ayuda con FAQ
- Pantalla PRO traducida con i18n

## Traduccion i18n COMPLETA (16 Mar 2026)
Todos los contenidos educativos y pantallas traducidos a es/en/it:
- **Programas guiados**: educacion-basica, calma-control, socializacion, mundo-cachorro (titulos, descripciones, lecciones, objetivos) via `programsContent.ts`
- **Ejercicios**: senales-basicas, control-impulsos, socializacion, paseos, trucos via `exercisesContent.ts`
- **Juegos**: puzzle-mental, tira-afloja via `gamesContent.ts`
- **Diario de Emociones**: labels, textos, placeholders via LanguageContext
- **Pantalla PRO**: features, planes, CTA, garantia via LanguageContext
- **Privacidad y Ayuda**: contenido completo via LanguageContext

## Archivos de datos multilenguaje
- frontend/data/programsContent.ts (4 programas x 3 idiomas con lecciones)
- frontend/data/exercisesContent.ts (5 ejercicios x 3 idiomas)
- frontend/data/gamesContent.ts (2 juegos x 3 idiomas)
- frontend/data/educationContent.ts (listados de la tab educacion)
- frontend/data/lessonContent.ts (contenido detallado de lecciones)

## Tareas Pendientes
### P2 - EAS Development Build (Bluetooth real)
### P2 - RevenueCat produccion (reemplazar modo demo)
### P2 - Google Play Store publicacion
### P2 - Crear tablas user_settings, pack_friends, clinical_files en Supabase
