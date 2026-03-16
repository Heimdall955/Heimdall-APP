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

## Traduccion i18n COMPLETA (16 Mar 2026)
- Programas guiados: educacion-basica, calma-control, socializacion, mundo-cachorro (programsContent.ts)
- Ejercicios: 5 tipos (exercisesContent.ts)
- Juegos: 2 tipos (gamesContent.ts)
- Diario de Emociones: labels, textos, placeholders
- Pantalla PRO, Privacidad, Ayuda

## Pantalla PRO Premium (16 Mar 2026)
- Diseno dorado premium sobre fondo negro (#0D0D0D)
- 2 planes: Heimdall Basico / Heimdall Guardian (Recomendado)
- 7 features exclusivas del Guardian
- Precios: 4,90 EUR/mes o 39,90 EUR/ano (ahorra 32%)
- 7 dias gratis de prueba
- Timeline visual del proceso de suscripcion
- Cita motivacional: "Heimdall ilumina lo que no siempre sabemos ver"
- Todo traducido en es/en/it
- Integrado con RevenueCat (modo demo hasta configurar claves reales)

## Tareas Pendientes
### P2 - EAS Development Build (Bluetooth real)
### P2 - RevenueCat produccion (configurar claves reales)
### P2 - Google Play Store publicacion
### P2 - Crear tablas user_settings, pack_friends, clinical_files en Supabase
