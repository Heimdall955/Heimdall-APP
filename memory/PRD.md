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
- Integración Resend para envío real de emails de recuperación (remitente: heimdall@escudolegado.com)
- FIX: Chat Heimdall ahora lee tabla medical_events (vacunas, desparasitaciones, cirugías) al construir contexto
- FIX: Query clinical_files corregida (columnas inexistentes eliminadas, datos clínicos parseados desde JSON en campo notes)
- FEATURE: Campo edad en formularios ahora tiene toggle Meses/Años (onboarding-mascota, onboarding/perro, perfil editar)
  - Cuando edad >= 12 meses, se muestra automáticamente en años
  - Al guardar siempre se convierte a meses para la DB
  - Al editar, se convierte automáticamente entre unidades
- BUGFIX: Ejercicios 'Clicker' y 'Olfato' en Biblioteca de Ejercicios - añadido contenido completo (4 ejercicios cada uno, 3 idiomas)
- BUILD: Package name cambiado a app.emergent.hanigpsfixf4b1b81d, versionCode 118
- BUILD: Plugin withAndroidFeatures actualizado para resolver conflictos de content provider authorities (com.heimdall.app -> app.emergent.hanigpsfixf4b1b81d)
- BUGFIX: Eliminado botón "Iniciar sesión con Google" que no funcionaba (usaba auth de Emergent, no compatible con producción)
- server.py desplegado en VPS con todas las correcciones
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

## Cambios 6 Jul 2026 (fork actual)
- ROOT CAUSE del fallo en producción v118: el fork del entorno reescribió frontend/.env con la URL de preview de Emergent, y el AAB compilado incrustó esa URL efímera → chat, recuperar contraseña y guardar perro fallaban en la app de Google Play.
- FIX PERMANENTE: creado frontend/config/backend.ts — en builds de producción (release) BACKEND_URL es SIEMPRE https://heimdall.escudolegado.com (hardcodeado con __DEV__); en desarrollo usa EXPO_PUBLIC_BACKEND_URL. Los 19 archivos que leían process.env ahora importan de config/backend.
- eas.json: perfil production ahora define env EXPO_PUBLIC_BACKEND_URL=https://heimdall.escudolegado.com (cinturón y tirantes).
- app.json: versionCode 118 → 119 (necesario para re-subir a Google Play).
- Verificado contra el VPS: login ✅, /api/auth/request-reset ✅ (email Resend), /api/chat ✅ (respuesta LLM OK). El backend del VPS estaba correcto todo el tiempo.
- IMPORTANTE PARA FUTUROS AGENTES: nunca depender de frontend/.env para la URL de producción; los forks lo reescriben. config/backend.ts es la fuente de verdad.

## Rediseño visual completo (18 Jul 2026)
- Nuevo branding basado en mockup del usuario: fondo crema #F6F4EE, esmeralda #128C67, verde pino #0C4A3E (tarjetas hero), dorado #B98A1D, títulos serif (Georgia/serif nativa vía Fonts.serif en constants/theme.ts).
- Paleta global cambiada en contexts/ThemeContext.tsx (Light y Dark) — rebrandea todas las pantallas automáticamente.
- Home (index.tsx) rehecho: header con avatar mascota, tarjeta recompensa (trofeo + hueso dorado), hero "Analiza y entiende la salud de tu animal" con ilustración mascota veterinaria y CTA pill "Empezar análisis" → Chat, accesos rápidos en tarjetas con chevron (todos conectados), resto de secciones restyled.
- Tab bar (_layout.tsx): esquinas redondeadas, avatar mascota en botón central (Educación).
- Ilustraciones nuevas generadas (Gemini, estilo del mockup) en assets/images: heimdall-vet-hero.png, heimdall-avatar.png, golden-bone.png, trophy-badge.png, tree-of-life.png (fondo blanco eliminado por flood-fill PIL, optimizadas).
- data-testid → testID en todos los componentes RN (estándar React Native Web).
- Testing agent iteración 20: TODOS los flujos PASS (login, home, 5 tabs, chat IA e2e, modo oscuro).

## Ajustes de branding (18 Jul 2026, 2ª ronda)
- Logo oficial Heimdall (H dorada con huella, fondo negro) sustituye al avatar del perro en: círculo del header del Home y botón central del tab bar (asset: heimdall-logo-gold.png + heimdall-logo-round.png con máscara circular PIL).
- Hero "Analiza y entiende": nueva ilustración heimdall-vet-clinic.png (perro veterinario con fondo de clínica/oficina desenfocada, como el mockup) en panel redondeado a la derecha de la tarjeta. Patrón RN-web: View absoluto con overflow hidden + Image 100%x100% cover.

## Sección Actividad de salud + Diario emocional según mockup 2 (18 Jul 2026)
- Tarjetas Actividad de salud: iconos cuadrados redondeados (chat verde, asterisco naranja, pause morado) + ilustraciones a la derecha (perro con tablet recortado de heimdall-vet-hero, shield-vial.png, gold-feather.png).
- Banner "¿Cómo os sentís hoy?": fondo lavanda #EDE9F7, título serif, 5 emociones en cuadrados blancos, botón pill morado #7E57C2 "Empezar diario emocional" (clave i18n nueva startEmotionDiary es/en/it), perro escribiendo (dog-writing.png, mismo personaje).

## Multi-mascota + Aviso de actualización (18 Jul 2026)
- MULTI-MASCOTA: sección "Mis mascotas" en Perfil (chips horizontales + botón Añadir mascota), pantalla nueva app/agregar-mascota.tsx (POST /api/dogs), AuthContext.selectDog persiste current_dog_id en SecureStore y refreshDogs lo respeta. Perfil refresca lista con useFocusEffect. i18n es/en/it (claves myPets, addPet, savePet, petAdded, etc.).
- AVISO ACTUALIZACIÓN: GET /api/app/version (lee LATEST_ANDROID_VERSION_CODE y PLAY_STORE_URL del .env) + components/UpdateChecker.tsx montado en app/_layout.tsx — modal "Nueva versión disponible" solo en Android release cuando versionCode instalado < publicado. Abre market://details.
- WORKFLOW DE RELEASE: tras publicar una nueva versión en Google Play, actualizar LATEST_ANDROID_VERSION_CODE en el .env del VPS y reiniciar uvicorn para que los usuarios antiguos vean el aviso. Actualmente = 118.
- Deploy VPS hecho (server.py + .env) y verificado. Testing agent iteración 21: backend 4/4, frontend OK (2 fixes aplicados: navegación tras guardar en web, refreshDogs en focus). Testing agent arregló Button.tsx para reenviar testID.
- Email de recuperación FUNCIONANDO: dominio verificado en Resend era el subdominio heimdall.escudolegado.com → SENDER_EMAIL cambiado a no-reply@heimdall.escudolegado.com en VPS. Usuario confirmó recepción.

## Tareas Pendientes
- P0: Usuario debe Save to Github + Build AAB (versionCode 119) desde la plataforma y subirlo a Google Play
- P1: Ejecutar EAS build con la nueva configuración (eas build --platform android --profile production)
- P2: Decidir tecnología del chaleco (Bluetooth vs WiFi) e implementar conectividad real
- P2: Google Play Store - subir nueva versión con backend permanente
