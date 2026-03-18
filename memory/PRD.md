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
- Onboarding Mascota Multi-tipo sin duplicados (verifica existencia antes de crear)
- Navegacion de 5 tabs (Inicio, Salud, Educacion, Chat, Perfil)
- Chat IA con upload de fotos via base64 (fix Android multipart) (18 Mar 2026)
- Upload fotos en chat sin recortador de sistema (ImageManipulator)
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
- Delete dog con cascade de datos relacionados (18 Mar 2026)

## Archivos Clave
- frontend/services/NotificationService.ts (notificaciones i18n)
- frontend/components/CalendarPicker.tsx (selector de fecha con calendario)
- frontend/app/historial-medico.tsx (historial medico con CalendarPicker)
- frontend/app/diario.tsx (diario de emociones con historial visible)
- frontend/app/(tabs)/perfil.tsx (image picker fix, perfil optimizado, eventos medicos)
- frontend/app/(tabs)/chat.tsx (upload base64, ImageManipulator)
- frontend/app/(tabs)/index.tsx (home con llamadas paralelas)
- frontend/app/onboarding-mascota.tsx (onboarding sin duplicados)
- frontend/app/pro.tsx (diseno dorado premium)
- backend/server.py (upload-base64, cache sesion, cascade delete)

## Tareas Pendientes
- P1: EAS Development Build (Bluetooth real)
- P2: RevenueCat produccion
- P2: Google Play Store publicacion
