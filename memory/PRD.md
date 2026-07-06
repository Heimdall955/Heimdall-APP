# Heimdall (HANI) - PRD

## Producto
App móvil (React Native/Expo) + Backend (FastAPI/Supabase) para monitoreo de salud canina con IA.

## Stack
- **Frontend**: React Native (Expo SDK 54), TypeScript
- **Backend**: FastAPI (Python), Supabase (PostgreSQL)
- **IA**: OpenAI GPT-4o-mini
- **Email**: Resend (transactional emails)
- **Hosting Backend**: Hostinger VPS (Ubuntu 24.04) con Caddy reverse proxy
- **URL Backend Producción**: https://heimdall.escudolegado.com
- **App Store**: Google Play (com.heimdall.app)

## Modelo de negocio
App 100% GRATUITA. Sin PRO/Premium/paywalls.

## Funcionalidades implementadas
- Chat IA veterinario (GPT-4o-mini, multi-idioma)
- Registro/Login con auth por sesión
- Recuperación de contraseña con envío de código por email (Resend)
- Perfil de mascota con historial médico
- Diario de actividad
- Gamificación (puntos, leaderboard)
- Pantalla inicio: Hero Banner, Quick Access, Actividad de Salud
- Google Wallet pass para mascotas
- Onboarding completo

## Hosting Backend (Hostinger VPS)
- **IP**: 187.124.178.219
- **Usuario SSH**: heimdall-app
- **Puerto interno backend**: 8001
- **Caddy proxy**: heimdall.escudolegado.com/api/* -> 127.0.0.1:8001
- **Script arranque**: ~/heimdall-backend/start.sh
- **Cron reboot**: Configurado para arranque automático
- **Archivos en VPS**: ~/heimdall-backend/ (server.py, requirements.txt, .env)

## Cambios recientes (6 Jul 2026)
- SECURITY FIX: Endpoint /api/auth/request-reset ya NO devuelve el PIN de recuperación en la respuesta JSON
- Integración Resend para envío real de emails de recuperación de contraseña
- Resend instalado en VPS y .env actualizado con RESEND_API_KEY y SENDER_EMAIL
- server.py desplegado en VPS con la corrección de seguridad

## Cambios anteriores (19 Jun 2026)
- Home Screen revamp completo
- Eliminación total de PRO/Premium/paywalls
- OpenAI multi-idioma corregido
- Flujo recuperación contraseña añadido
- Google Play compliance (orientation, edge-to-edge)
- Logo transparente + splash oscuro
- EAS Build: limpieza .gitignore, dependencias, resolución @react-navigation/core duplicado
- Config plugin withAndroidFeatures (bluetooth/camera required=false)
- Deploy backend en Hostinger VPS con Caddy reverse proxy
- Frontend actualizado: EXPO_PUBLIC_BACKEND_URL=https://heimdall.escudolegado.com

## Tareas Pendientes
- P1: Generar nuevo APK/AAB con EAS build (versionCode 117 y URL backend actualizada)
- P2: Verificar dominio remitente en Resend para enviar desde @escudolegado.com (actualmente usa onboarding@resend.dev)
- P2: Decidir tecnología del chaleco (Bluetooth vs WiFi) e implementar conectividad real
- P2: Google Play Store - subir nueva versión con backend permanente
