# Heimdall (HANI) - Product Requirements Document

## Original Problem Statement
Premium mobile app for monitoring dog health, providing education, and connecting to a smart vest (ESP32 via BLE).

## Core Architecture
- **Frontend**: React Native (Expo), Expo Router
- **Backend**: Python, FastAPI
- **Database**: Supabase (PostgreSQL)
- **AI Chat**: OpenAI GPT-4o-mini (user's own API key)
- **i18n**: Custom LanguageContext (es, en, it)
- **Hardware**: react-native-ble-plx (requires EAS Development Build)

## Key Files
- `/app/backend/server.py` - Backend API
- `/app/frontend/app/(tabs)/perfil.tsx` - Profile with gamification UI
- `/app/frontend/app/(tabs)/index.tsx` - Home with real gamification stats
- `/app/frontend/app/leccion.tsx` - Lessons with reward submission
- `/app/frontend/contexts/LanguageContext.tsx` - i18n translations
- `/app/frontend/data/educationContent.ts` - Multilingual education content

## Completed Features
- ✅ User/Dog Onboarding
- ✅ 5-tab Navigation
- ✅ AI Chat (Heimdall) with custom prompt
- ✅ i18n (es, en, it) - main UI
- ✅ Education section (list multilingual)
- ✅ Profile management
- ✅ BLE workaround (Expo Go warning)
- ✅ Branded splash screen
- ✅ **Gamification System (Feb 25, 2026)**: Bones, XP, Levels, Achievements, Streak tracking - Backend + Frontend

## P0 - Done
- Gamification system fully operational (Feb 25, 2026)
  - `POST /api/gamification/add-bones` awards points, checks achievements, tracks streak
  - `GET /api/gamification/stats` returns all stats
  - `GET /api/gamification/achievements` returns all 9 achievements with unlock status
  - Profile screen shows rewards, level, bones, streak, and achievements grid
  - Home screen uses real data from API (no hardcoded values)
  - Home banner shows actual bones count, "Ver premios" navigates to profile
  - Lesson completion calls backend to award points with achievement notifications
  - Achievements derived from stats (no extra DB table needed)
  - Level-up detection and notifications on lesson completion screen

- Heimdall prompt updated (Feb 25, 2026) - 18 sections
- Chat file upload & analysis (Feb 25, 2026)
  - Photo upload: GPT-4o-mini vision analysis of pet images
  - Video upload: frame extraction via ffmpeg + vision analysis (max 4s)
  - PDF upload: Blood test / medical report analysis via PyMuPDF text extraction
  - All stored in Supabase (chat_attachments table + Storage bucket)
  - Frontend: 3 quick action cards + attachment menu modal + file picker
  - Multi-language detection with langdetect library
  - Validated: 7/7 backend tests passed

- Profile overhaul (Feb 25, 2026)
  - Photo upload: Fixed crop with aspect [1,1] and base64 storage
  - Pack/Friends: Invite via Share (WhatsApp etc.) + 5 bones reward + friend circles with empty slots
  - Clinical file: Full editable modal (country, vet, allergies, medication, neutered, insurance) → Supabase
  - Settings: Weight unit (kg/lb), temperature (°C/°F), language
  - Notifications: Toggle panel (daily reminder, health alerts, achievements, pack activity)
  - All save to Supabase tables: clinical_files, pack_friends, user_settings
  - **REQUIRES**: User to create 3 tables in Supabase SQL Editor (SQL provided)

## P0 - Google Wallet Fix (Feb 2026)
- ✅ Fixed `get_wallet_pass` endpoint: corrected `age` → `age_months` DB column mapping
- ✅ Added clinical data fetch from `clinical_files` table (resilient if table doesn't exist)
- ✅ Fixed `create_wallet_pass_jwt`: now uses dynamic `text_modules` list (includes clinical data) instead of hardcoded list
- ✅ Added `genericClasses` to JWT payload so Google Wallet can auto-create the pass class
- ✅ Backend tested via curl: JWT generated correctly with all dog data

## P0 - Education & Gamification Complete Fix (Feb 2026)
- ✅ Added 8 missing lessons: presentaciones-perros, interaccion-humanos, nuevos-entornos, sonidos-estimulos, parque-canino, rutina-cachorro, socializacion-temprana, juego-apropiado
- ✅ Fixed ejercicio.tsx: now calls /api/gamification/add-bones on completion
- ✅ Fixed juego.tsx: now calls /api/gamification/add-bones on completion
- ✅ Fixed educacion.tsx session card: added onPress navigation
- ✅ Added useFocusEffect to Home and Education screens for stat refresh
- ✅ All 24 lessons, 5 exercises, 2 games verified (14/14 tests passed)

## P1 - Pending
- Translate detailed education content (lesson internals still in Spanish)

## P2 - Pending  
- Refine chat multilingual detection (English detection weak)
- Guide user through EAS Development Build for real BLE
- Social leaderboard for gamification system

## Future/Backlog
- Push notifications for level-ups
- More achievements
- Real BLE connection testing with physical device
