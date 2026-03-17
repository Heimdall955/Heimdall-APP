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
- Onboarding Mascota Multi-tipo (perro/gato/roedor/pajaro)
- Navegacion de 5 tabs (Inicio, Salud, Educacion, Chat, Perfil)
- Chat IA ilimitado con aprendizaje adaptativo
- Sistema de gamificacion (Huesos/XP/Achievements)
- Google Wallet (HANI Passport)
- Leaderboard global / Weekly Summary
- Historial clinico con selector de fecha calendario (17 Mar 2026)
- Eventos medicos visibles en perfil sin entrar al detalle (17 Mar 2026)
- Suscripcion PRO con diseno dorado premium
- Modo Oscuro/Claro con persistencia
- Rutas GPS v4
- Autenticacion Biometrica
- Progreso lecciones + Mi Progreso
- Diario de Emociones con historial visible de notas (17 Mar 2026)
- Chaleco BLE ESP32 (pendiente EAS Build)
- Notificaciones push locales
- Pantalla de Privacidad (enlace real: heimdall-ai.tech)
- Pantalla de Ayuda con FAQ
- Banner "Pack Chaleco" en salud cuando no esta conectado
- Traduccion completa i18n (es/en/it) en todo el contenido
- Modal Editar Mascota completo con campos: tipo, sexo, esterilizado, alergias (17 Mar 2026)
- Componente CalendarPicker personalizado para seleccion de fechas (17 Mar 2026)

## Archivos Clave
- frontend/components/CalendarPicker.tsx (selector de fecha con calendario)
- frontend/app/historial-medico.tsx (historial medico con CalendarPicker)
- frontend/app/diario.tsx (diario de emociones con historial visible)
- frontend/app/(tabs)/perfil.tsx (perfil con eventos medicos y modal editar mascota)
- frontend/app/onboarding-mascota.tsx (onboarding multi-mascota)
- frontend/app/pro.tsx (diseno dorado premium)
- backend/server.py (endpoints con fallback graceful)

## Tareas Pendientes
- P1: EAS Development Build (Bluetooth real)
- P2: RevenueCat produccion
- P2: Google Play Store publicacion
