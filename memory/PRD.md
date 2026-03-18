# Heimdall (HANI) - PRD

## Descripcion
App premium para monitoreo de salud animal, educacion y conexion con chaleco inteligente ESP32.

## Stack Tecnico
- **Frontend:** React Native / Expo SDK 54 / Expo Router
- **Backend:** FastAPI + Supabase (PostgreSQL + Storage)
- **AI:** OpenAI GPT-4o-mini
- **Hardware:** ESP32 BLE (chaleco inteligente)

## Funcionalidades Implementadas
- Onboarding usuario/mascota con seleccion de idioma (es/en/it)
- Onboarding Mascota Multi-tipo (perro/gato/roedor/pajaro) - sin duplicados
- Navegacion de 5 tabs (Inicio, Salud, Educacion, Chat, Perfil)
- Chat IA ilimitado con aprendizaje adaptativo
- Upload fotos en chat con ImageManipulator (sin crop de Android)
- Sistema de gamificacion (Huesos/XP/Achievements)
- Google Wallet (HANI Passport)
- Leaderboard global / Weekly Summary
- Historial clinico con selector de fecha calendario
- Eventos medicos visibles en perfil sin entrar al detalle
- Suscripcion PRO con diseno dorado premium
- Modo Oscuro/Claro con persistencia
- Rutas GPS v4
- Autenticacion Biometrica
- Progreso lecciones + Mi Progreso
- Diario de Emociones con historial visible de notas
- Chaleco BLE ESP32 (pendiente EAS Build)
- Notificaciones push locales traducidas (es/en/it)
- Pantalla de Privacidad (enlace real: heimdall-ai.tech)
- Pantalla de Ayuda con FAQ
- Banner "Pack Chaleco" en salud cuando no esta conectado
- Traduccion completa i18n (es/en/it) en todo el contenido
- Modal Editar Mascota completo con campos: tipo, sexo, esterilizado, alergias
- Componente CalendarPicker personalizado para seleccion de fechas
- Optimizacion rendimiento: cache sesion backend + llamadas paralelas frontend
- Fix image picker Android en perfil y chat (18 Mar 2026)
- Fix onboarding sin duplicados (18 Mar 2026)
- Fix delete dog con cascade de datos relacionados (18 Mar 2026)

## Archivos Clave
- frontend/services/NotificationService.ts (notificaciones i18n)
- frontend/components/CalendarPicker.tsx (selector de fecha con calendario)
- frontend/app/historial-medico.tsx (historial medico con CalendarPicker)
- frontend/app/diario.tsx (diario de emociones con historial visible)
- frontend/app/(tabs)/perfil.tsx (image picker fix, perfil optimizado, eventos medicos)
- frontend/app/(tabs)/chat.tsx (image picker fix, upload con ImageManipulator)
- frontend/app/(tabs)/index.tsx (home con llamadas paralelas)
- frontend/app/onboarding-mascota.tsx (onboarding sin duplicados)
- frontend/app/pro.tsx (diseno dorado premium)
- backend/server.py (cache sesion, cascade delete, endpoints con fallback graceful)

## Tareas Pendientes
- P1: EAS Development Build (Bluetooth real)
- P2: RevenueCat produccion
- P2: Google Play Store publicacion
