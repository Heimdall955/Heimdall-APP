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
- Accesos rapidos actualizados: Chaleco, Subir analisis, Describir sintoma, Historial, Salud, Ficha Clinica - reubicados debajo del banner (24 Mar 2026)
- Seccion "Actividad de salud" reemplaza "Tu Progreso": ultima consulta IA, ultimo evento medico, estado emocional con datos reales (24 Mar 2026)
- Seccion "Que hace Heimdall?" reemplaza Ranking/Leaderboard: 3 tarjetas de propuesta de valor (24 Mar 2026)
- Eliminado todo el sistema PRO/Premium: sin badges, sin gates, sin pagos, todo abierto y gratuito (29 May 2026)
- API key OpenAI actualizada y respuesta multiidioma mejorada: secciones de salud traducidas correctamente en EN/IT (29 May 2026)
- Limpieza codigo residual PRO: eliminados pro.tsx, useSubscription.ts, ProBadge, ProModal, FREE_LIMITS, UsageCounter, tarjeta PRO en perfil (29 May 2026)
- Recuperacion de contraseña: enlace "Olvidaste tu contraseña?" en login con flujo de codigo de 6 digitos (29 May 2026)
- Google Login verificado: flujo completo con Emergent Auth (29 May 2026)
- Google Play compliance: orientation=default, eliminado edgeToEdgeEnabled obsoleto, eliminado expo-location plugin, eliminados permisos GPS contradictorios (29 May 2026)

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
