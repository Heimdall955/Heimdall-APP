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
- **Onboarding Mascota Multi-tipo** (perro/gato/roedor/pajaro) - 3 pasos con datos completos (17 Mar 2026)
- Navegacion de 5 tabs (Inicio, Salud, Educacion, Chat, Perfil)
- Chat IA ilimitado con aprendizaje adaptativo
- Sistema de gamificacion (Huesos/XP/Achievements)
- Google Wallet (HANI Passport)
- Leaderboard global / Weekly Summary
- Historial clinico
- Suscripcion PRO con diseno dorado premium
- Modo Oscuro/Claro con persistencia
- Rutas GPS v4
- Autenticacion Biometrica
- Progreso lecciones + Mi Progreso
- Diario de Emociones
- Chaleco BLE ESP32 (pendiente EAS Build)
- Notificaciones push locales
- Pantalla de Privacidad (enlace real: heimdall-ai.tech)
- Pantalla de Ayuda con FAQ
- Banner "Pack Chaleco" en salud cuando no esta conectado
- Traduccion completa i18n (es/en/it) en todo el contenido

## SQL Pendiente para Supabase
```sql
ALTER TABLE dogs ADD COLUMN IF NOT EXISTS pet_type VARCHAR DEFAULT 'dog';
ALTER TABLE dogs ADD COLUMN IF NOT EXISTS sex VARCHAR DEFAULT '';
ALTER TABLE dogs ADD COLUMN IF NOT EXISTS neutered BOOLEAN DEFAULT false;
ALTER TABLE dogs ADD COLUMN IF NOT EXISTS allergies TEXT DEFAULT '';
```

## Archivos Clave
- frontend/app/onboarding-mascota.tsx (nuevo - onboarding multi-mascota)
- frontend/app/pro.tsx (diseno dorado premium)
- frontend/app/privacidad.tsx (enlace heimdall-ai.tech)
- frontend/app/ayuda.tsx (FAQ)
- frontend/data/programsContent.ts (programas traducidos)
- backend/server.py (endpoints con fallback graceful)

## Tareas Pendientes
- P2: EAS Development Build (Bluetooth real)
- P2: RevenueCat produccion
- P2: Google Play Store publicacion
