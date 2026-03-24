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
- Onboarding Mascota Multi-tipo sin duplicados
- Navegacion de 5 tabs (Inicio, Salud, Educacion, Chat, Perfil)
- Chat IA con upload de fotos via base64 (fix Android)
- Paseos con podometro, meta diaria, stats semanales, historial (18 Mar 2026)
- Sistema de gamificacion (Huesos/XP/Achievements)
- Google Wallet (HANI Passport)
- Leaderboard global / Weekly Summary
- Historial clinico con selector de fecha calendario
- Eventos medicos visibles en perfil
- Suscripcion PRO con diseno dorado premium
- Modo Oscuro/Claro con persistencia
- Autenticacion Biometrica
- Progreso lecciones + Mi Progreso
- Diario de Emociones con historial visible de notas
- Chaleco BLE ESP32 (pendiente EAS Build)
- Notificaciones push locales traducidas (es/en/it)
- Pantalla de Privacidad y Ayuda
- Modal Editar Mascota completo
- CalendarPicker para fechas
- Optimizacion rendimiento: cache sesion + llamadas paralelas
- Delete dog con cascade
- Sin permisos GPS/Location (Google Play compatible) (18 Mar 2026)
- Banner principal IA: "Analiza y entiende la salud de tu animal" con CTA al chat (24 Mar 2026)
- Accesos rapidos actualizados: Chaleco, Subir analisis, Describir sintoma, Historial, Salud (24 Mar 2026)

## Archivos Clave
- frontend/app/rutas.tsx (paseos con podometro - reescrito)
- frontend/app/(tabs)/chat.tsx (upload base64)
- frontend/app/(tabs)/perfil.tsx (perfil completo)
- frontend/app/(tabs)/index.tsx (acceso rapido paseos)
- frontend/app/onboarding-mascota.tsx (sin duplicados)
- backend/server.py (walks endpoints, sin routes/trails)

## Permisos Android (app.json)
- CAMERA, BLUETOOTH*, READ/WRITE_EXTERNAL_STORAGE
- Bloqueados: ACTIVITY_RECOGNITION, ACCESS_*_LOCATION

## Tareas Pendientes
- P1: EAS Development Build (Bluetooth real)
- P2: RevenueCat produccion
- P2: Google Play Store publicacion
