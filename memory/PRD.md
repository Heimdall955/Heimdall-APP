# Heimdall (HANI) - PRD

## Producto
App móvil (React Native/Expo) + Backend (FastAPI/Supabase) para monitoreo de salud canina con IA.

## Stack
- **Frontend**: React Native (Expo SDK 54), TypeScript
- **Backend**: FastAPI (Python), Supabase (PostgreSQL)
- **IA**: OpenAI GPT-4o-mini
- **Hosting Backend**: Hostinger VPS (Ubuntu 24.04) con Caddy reverse proxy
- **URL Backend Producción**: https://heimdall.escudolegado.com
- **App Store**: Google Play (com.heimdall.app)

## Modelo de negocio
App 100% GRATUITA. Sin PRO/Premium/paywalls.

## Funcionalidades implementadas
- Chat IA veterinario (GPT-4o-mini, multi-idioma)
- Registro/Login con auth por sesión
- Recuperación de contraseña (MOCKED - código devuelto en JSON, sin email real)
- Perfil de mascota con historial médico
- Diario de actividad
- Gamificación (puntos, leaderboard)
- Pantalla inicio: Hero Banner, Quick Access, Actividad de Salud, ¿Qué hace Heimdall?
- Google Wallet pass para mascotas
- Onboarding completo

## Hosting Backend (Hostinger VPS)
- **IP**: 187.124.178.219
- **Usuario SSH**: heimdall-app
- **Puerto interno backend**: 8001
- **Caddy proxy**: heimdall.escudolegado.com/api/* → 127.0.0.1:8001 (sin basic_auth)
- **Script arranque**: ~/heimdall-backend/start.sh
- **Cron reboot**: Configurado para arranque automático
- **Archivos en VPS**: ~/heimdall-backend/ (server.py, requirements.txt, .env)

## Cambios recientes (19 Jun 2026)
- Home Screen revamp completo
- Eliminación total de PRO/Premium/paywalls
- OpenAI multi-idioma corregido
- Flujo recuperación contraseña añadido
- Google Play compliance (orientation, edge-to-edge)
- Logo transparente + splash oscuro
- EAS Build: limpieza .gitignore, dependencias (react-native-purchases, expo-location, react-native-dotenv eliminados), resolución @react-navigation/core duplicado
- Config plugin withAndroidFeatures (bluetooth/camera required=false)
- Deploy backend en Hostinger VPS con Caddy reverse proxy
- Frontend actualizado: EXPO_PUBLIC_BACKEND_URL=https://heimdall.escudolegado.com

## Tareas Pendientes
- P0: Hacer nuevo build EAS con versionCode 117 y URL backend actualizada (heimdall.escudolegado.com)
- P2: Integrar envío real de emails para recuperación de contraseña (actualmente MOCKED)
- P2: Decidir tecnología del chaleco (Bluetooth vs WiFi) e implementar conectividad real
- P2: Google Play Store - subir nueva versión con backend permanente
