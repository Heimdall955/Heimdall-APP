from fastapi import FastAPI, APIRouter, HTTPException, Depends, Request
from fastapi.security import HTTPBearer
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from supabase import create_client, Client
import os
import logging
import json
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Optional
import uuid
from datetime import datetime, timezone, timedelta
import bcrypt
import httpx
import jwt
from google.oauth2 import service_account
from google.auth.transport.requests import Request as GoogleRequest
from google.auth import jwt as google_jwt

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# Supabase connection
SUPABASE_URL = os.environ.get('SUPABASE_URL')
SUPABASE_KEY = os.environ.get('SUPABASE_SERVICE_KEY')
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

# LLM Key
EMERGENT_LLM_KEY = os.environ.get('EMERGENT_LLM_KEY', '')

# Google Wallet Configuration
GOOGLE_WALLET_ISSUER_ID = "3388000000023044726"
GOOGLE_WALLET_CLASS_ID = "3388000000023044726.HANI_PASSPORT"
GOOGLE_WALLET_CREDENTIALS_PATH = ROOT_DIR / "google_wallet_credentials.json"

app = FastAPI()
api_router = APIRouter(prefix="/api")
security = HTTPBearer(auto_error=False)

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# ==================== MODELS ====================

class UserCreate(BaseModel):
    email: str
    password: str
    name: str

class UserLogin(BaseModel):
    email: str
    password: str

class User(BaseModel):
    user_id: str
    email: str
    name: str
    picture: Optional[str] = None
    language: Optional[str] = 'es'
    created_at: datetime

class SessionExchange(BaseModel):
    session_id: str

class DogCreate(BaseModel):
    name: str
    age: int  # in months
    weight: float  # in kg
    sex: Optional[str] = None
    breed: Optional[str] = None
    chip_id: Optional[str] = None
    avatar: Optional[str] = None

class DogUpdate(BaseModel):
    name: Optional[str] = None
    age: Optional[int] = None
    weight: Optional[float] = None
    sex: Optional[str] = None
    breed: Optional[str] = None
    chip_id: Optional[str] = None
    avatar: Optional[str] = None

class Dog(BaseModel):
    id: str
    user_id: str
    name: str
    age: int
    weight: float
    sex: Optional[str] = None
    breed: Optional[str] = None
    chip_id: Optional[str] = None
    avatar: Optional[str] = None
    created_at: datetime
    updated_at: datetime

class ChatMessageCreate(BaseModel):
    content: str
    dog_id: Optional[str] = None
    language: Optional[str] = "Spanish"

class ChatMessage(BaseModel):
    id: str
    user_id: str
    dog_id: Optional[str] = None
    role: str
    content: str
    rating: Optional[str] = None
    created_at: datetime

class ChatRating(BaseModel):
    rating: str

class MedicalEventCreate(BaseModel):
    dog_id: str
    type: str
    title: str
    description: Optional[str] = None
    date: str
    next_date: Optional[str] = None

class MedicalEvent(BaseModel):
    id: str
    dog_id: str
    type: str
    title: str
    description: Optional[str] = None
    date: str
    next_date: Optional[str] = None
    created_at: datetime

class RouteCreate(BaseModel):
    dog_id: str
    name: Optional[str] = None
    distance_km: float
    duration_minutes: int
    coordinates: Optional[List[dict]] = None

class GamificationStats(BaseModel):
    bones: int = 0
    xp: int = 0
    level: int = 1
    streak_days: int = 0
    exercises_completed: int = 0
    practice_minutes: int = 0

# ==================== AUTH HELPERS ====================

def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def verify_password(password: str, hashed: str) -> bool:
    return bcrypt.checkpw(password.encode('utf-8'), hashed.encode('utf-8'))

def generate_session_token() -> str:
    return f"session_{uuid.uuid4().hex}"

# In-memory session store (for simplicity, in production use Redis or DB)
sessions = {}

async def get_current_user(request: Request) -> Optional[User]:
    auth_header = request.headers.get("Authorization")
    session_token = None
    
    if auth_header and auth_header.startswith("Bearer "):
        session_token = auth_header.split(" ")[1]
    
    if not session_token:
        session_token = request.cookies.get("session_token")
    
    if not session_token or session_token not in sessions:
        return None
    
    session = sessions[session_token]
    
    # Check expiry
    if session.get("expires_at") and session["expires_at"] < datetime.now(timezone.utc):
        del sessions[session_token]
        return None
    
    user_id = session["user_id"]
    
    # Get user from Supabase
    try:
        result = supabase.table("users").select("*").eq("id", user_id).execute()
        if result.data and len(result.data) > 0:
            user_data = result.data[0]
            return User(
                user_id=str(user_data["id"]),
                email=user_data["email"],
                name=user_data.get("name", ""),
                picture=user_data.get("profile_image"),
                language=user_data.get("language", "es"),
                created_at=datetime.fromisoformat(user_data["created_at"].replace("Z", "+00:00")) if user_data.get("created_at") else datetime.now(timezone.utc)
            )
    except Exception as e:
        logger.error(f"Error getting user: {e}")
    
    return None

async def require_auth(request: Request) -> User:
    user = await get_current_user(request)
    if not user:
        raise HTTPException(status_code=401, detail="No autenticado")
    return user

# ==================== AUTH ENDPOINTS ====================

@api_router.post("/auth/register")
async def register(data: UserCreate):
    # Check if user exists
    try:
        result = supabase.table("users").select("id").eq("email", data.email).execute()
        if result.data and len(result.data) > 0:
            raise HTTPException(status_code=400, detail="El email ya está registrado")
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error checking user: {e}")
    
    now = datetime.now(timezone.utc).isoformat()
    
    user_doc = {
        "email": data.email,
        "name": data.name,
        "password_hash": hash_password(data.password),
        "created_at": now,
        "updated_at": now
    }
    
    try:
        result = supabase.table("users").insert(user_doc).execute()
        user_id = result.data[0]["id"]
    except Exception as e:
        logger.error(f"Error creating user: {e}")
        raise HTTPException(status_code=500, detail="Error al crear usuario")
    
    # Create session
    session_token = generate_session_token()
    sessions[session_token] = {
        "user_id": user_id,
        "expires_at": datetime.now(timezone.utc) + timedelta(days=30)
    }
    
    # Initialize gamification
    try:
        supabase.table("gamification").insert({
            "user_id": user_id,
            "bones": 0,
            "xp": 0,
            "level": 1,
            "streak_days": 0,
            "exercises_completed": 0,
            "practice_minutes": 0,
            "created_at": now,
            "updated_at": now
        }).execute()
    except Exception as e:
        logger.error(f"Error creating gamification: {e}")
    
    return {
        "session_token": session_token,
        "user": {
            "user_id": str(user_id),
            "email": data.email,
            "name": data.name
        }
    }

@api_router.post("/auth/login")
async def login(data: UserLogin):
    try:
        result = supabase.table("users").select("*").eq("email", data.email).execute()
        if not result.data or len(result.data) == 0:
            raise HTTPException(status_code=401, detail="Email o contraseña incorrectos")
        
        user_data = result.data[0]
        
        if not user_data.get("password_hash") or not verify_password(data.password, user_data["password_hash"]):
            raise HTTPException(status_code=401, detail="Email o contraseña incorrectos")
        
        session_token = generate_session_token()
        sessions[session_token] = {
            "user_id": user_data["id"],
            "expires_at": datetime.now(timezone.utc) + timedelta(days=30)
        }
        
        return {
            "session_token": session_token,
            "user": {
                "user_id": str(user_data["id"]),
                "email": user_data["email"],
                "name": user_data.get("name", "")
            }
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Login error: {e}")
        raise HTTPException(status_code=500, detail="Error de autenticación")

@api_router.post("/auth/session")
async def exchange_session(data: SessionExchange):
    """Exchange Emergent OAuth session for app session"""
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(
                "https://demobackend.emergentagent.com/auth/v1/env/oauth/session-data",
                params={"session_id": data.session_id}
            )
            
            if response.status_code != 200:
                raise HTTPException(status_code=401, detail="Sesión inválida")
            
            oauth_data = response.json()
            email = oauth_data.get("email")
            name = oauth_data.get("name", email.split("@")[0] if email else "Usuario")
            picture = oauth_data.get("picture")
            
            if not email:
                raise HTTPException(status_code=400, detail="No se pudo obtener el email")
            
            # Check if user exists
            result = supabase.table("users").select("*").eq("email", email).execute()
            
            now = datetime.now(timezone.utc).isoformat()
            
            if result.data and len(result.data) > 0:
                user_data = result.data[0]
                user_id = user_data["id"]
            else:
                # Create new user
                new_user = {
                    "email": email,
                    "name": name,
                    "profile_image": picture,
                    "google_id": oauth_data.get("sub"),
                    "created_at": now,
                    "updated_at": now
                }
                result = supabase.table("users").insert(new_user).execute()
                user_id = result.data[0]["id"]
                
                # Initialize gamification
                supabase.table("gamification").insert({
                    "user_id": user_id,
                    "bones": 0,
                    "xp": 0,
                    "level": 1,
                    "created_at": now,
                    "updated_at": now
                }).execute()
            
            session_token = generate_session_token()
            sessions[session_token] = {
                "user_id": user_id,
                "expires_at": datetime.now(timezone.utc) + timedelta(days=30)
            }
            
            return {
                "session_token": session_token,
                "user": {
                    "user_id": str(user_id),
                    "email": email,
                    "name": name,
                    "picture": picture
                }
            }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Session exchange error: {e}")
        raise HTTPException(status_code=500, detail="Error de autenticación")

@api_router.get("/auth/me")
async def get_me(user: User = Depends(require_auth)):
    return {
        "user_id": user.user_id,
        "email": user.email,
        "name": user.name,
        "picture": user.picture,
        "language": user.language
    }

@api_router.post("/auth/logout")
async def logout(request: Request):
    auth_header = request.headers.get("Authorization")
    if auth_header and auth_header.startswith("Bearer "):
        session_token = auth_header.split(" ")[1]
        if session_token in sessions:
            del sessions[session_token]
    return {"message": "Sesión cerrada"}

# ==================== DOGS ENDPOINTS ====================

@api_router.post("/dogs")
async def create_dog(data: DogCreate, user: User = Depends(require_auth)):
    now = datetime.now(timezone.utc).isoformat()
    
    dog_doc = {
        "user_id": user.user_id,
        "name": data.name,
        "age_months": data.age,
        "weight": data.weight,
        "breed": data.breed,
        "chip_id": data.chip_id,
        "photo_url": data.avatar,
        "created_at": now,
        "updated_at": now
    }
    
    try:
        result = supabase.table("dogs").insert(dog_doc).execute()
        dog_id = result.data[0]["id"]
        
        return {
            "id": str(dog_id),
            "user_id": user.user_id,
            "name": data.name,
            "age": data.age,
            "weight": data.weight,
            "breed": data.breed,
            "chip_id": data.chip_id,
            "avatar": data.avatar
        }
    except Exception as e:
        logger.error(f"Error creating dog: {e}")
        raise HTTPException(status_code=500, detail="Error al crear perro")

@api_router.get("/dogs")
async def get_dogs(user: User = Depends(require_auth)):
    try:
        result = supabase.table("dogs").select("*").eq("user_id", user.user_id).execute()
        
        dogs = []
        for dog in result.data:
            dogs.append({
                "id": str(dog["id"]),
                "user_id": user.user_id,
                "name": dog["name"],
                "age": dog.get("age_months", 0),
                "weight": float(dog.get("weight", 0)),
                "breed": dog.get("breed"),
                "chip_id": dog.get("chip_id"),
                "avatar": dog.get("photo_url"),
                "created_at": dog.get("created_at"),
                "updated_at": dog.get("updated_at")
            })
        
        return dogs
    except Exception as e:
        logger.error(f"Error getting dogs: {e}")
        raise HTTPException(status_code=500, detail="Error al obtener perros")

@api_router.get("/dogs/{dog_id}")
async def get_dog(dog_id: str, user: User = Depends(require_auth)):
    try:
        result = supabase.table("dogs").select("*").eq("id", dog_id).eq("user_id", user.user_id).execute()
        
        if not result.data or len(result.data) == 0:
            raise HTTPException(status_code=404, detail="Perro no encontrado")
        
        dog = result.data[0]
        return {
            "id": str(dog["id"]),
            "user_id": user.user_id,
            "name": dog["name"],
            "age": dog.get("age_months", 0),
            "weight": float(dog.get("weight", 0)),
            "breed": dog.get("breed"),
            "chip_id": dog.get("chip_id"),
            "avatar": dog.get("photo_url")
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting dog: {e}")
        raise HTTPException(status_code=500, detail="Error al obtener perro")

@api_router.put("/dogs/{dog_id}")
async def update_dog(dog_id: str, data: DogUpdate, user: User = Depends(require_auth)):
    update_data = {"updated_at": datetime.now(timezone.utc).isoformat()}
    
    if data.name is not None:
        update_data["name"] = data.name
    if data.age is not None:
        update_data["age_months"] = data.age
    if data.weight is not None:
        update_data["weight"] = data.weight
    if data.breed is not None:
        update_data["breed"] = data.breed
    if data.chip_id is not None:
        update_data["chip_id"] = data.chip_id
    if data.avatar is not None:
        update_data["photo_url"] = data.avatar
    
    try:
        result = supabase.table("dogs").update(update_data).eq("id", dog_id).eq("user_id", user.user_id).execute()
        
        if not result.data:
            raise HTTPException(status_code=404, detail="Perro no encontrado")
        
        return {"message": "Perro actualizado"}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating dog: {e}")
        raise HTTPException(status_code=500, detail="Error al actualizar perro")

@api_router.delete("/dogs/{dog_id}")
async def delete_dog(dog_id: str, user: User = Depends(require_auth)):
    try:
        supabase.table("dogs").delete().eq("id", dog_id).eq("user_id", user.user_id).execute()
        return {"message": "Perro eliminado"}
    except Exception as e:
        logger.error(f"Error deleting dog: {e}")
        raise HTTPException(status_code=500, detail="Error al eliminar perro")

# ==================== CHAT ENDPOINTS ====================

# System prompt for HANI - The Heimdall AI Assistant
HANI_SYSTEM_PROMPT = """# HANI - Heimdall AI Natural Intelligence

## Tu Identidad
Eres HANI (Heimdall AI Natural Intelligence), el asistente de inteligencia artificial de la app Heimdall. Tu nombre está inspirado en Heimdall, el guardián de los dioses nórdicos, porque tu misión es proteger y cuidar el bienestar de los perros.

## Tu Personalidad
- **Cálido y empático**: Entiendes que los perros son familia. Tratas a cada dueño con comprensión y cariño.
- **Profesional pero accesible**: Tienes conocimiento de veterinario pero lo explicas de forma sencilla.
- **Entusiasta**: Amas a los perros y se nota en cada respuesta.
- **Precavido**: Cuando detectas síntomas graves, siempre recomiendas visitar al veterinario.
- **Divertido**: Puedes usar analogías caninas y hacer que la conversación sea agradable.

## Áreas de Expertise

### 1. SALUD CANINA
- **Síntomas y enfermedades comunes**: Conoces los signos de alerta de enfermedades como parvovirosis, moquillo, displasia de cadera, problemas digestivos, alergias, infecciones de oído, problemas dentales, etc.
- **Primeros auxilios**: Puedes guiar en emergencias básicas hasta llegar al veterinario.
- **Prevención**: Vacunación, desparasitación, chequeos regulares.
- **Señales de alerta**: Sabes identificar cuándo algo puede ser grave y requiere atención veterinaria urgente.

### 2. NUTRICIÓN
- **Dietas por edad**: Cachorro, adulto, senior - necesidades nutricionales específicas.
- **Dietas por condición**: Perros con sobrepeso, problemas renales, alergias alimentarias.
- **Alimentos peligrosos**: Chocolate, uvas, cebolla, xilitol, etc.
- **Porciones recomendadas**: Según peso, actividad física y edad.
- **Snacks saludables**: Frutas y verduras seguras para perros.

### 3. COMPORTAMIENTO Y EDUCACIÓN
- **Problemas de conducta**: Ansiedad por separación, ladridos excesivos, agresividad, miedos.
- **Entrenamiento básico**: Sentado, quieto, ven, caminar con correa.
- **Socialización**: Cómo y cuándo socializar cachorros y perros adultos.
- **Refuerzo positivo**: Técnicas de entrenamiento modernas y éticas.
- **Lenguaje canino**: Interpretar señales corporales y comunicación.

### 4. EJERCICIO Y ACTIVIDAD
- **Necesidades por raza**: Razas de alta energía vs razas calmadas.
- **Ejercicio por edad**: Cachorros, adultos, seniors.
- **Juegos mentales**: Enriquecimiento cognitivo y juguetes interactivos.
- **Paseos**: Frecuencia, duración, mejores horarios.
- **Deportes caninos**: Agility, canicross, natación.

### 5. CUIDADOS GENERALES
- **Higiene**: Baño, cepillado, corte de uñas, limpieza de oídos.
- **Cuidado dental**: Cepillado, snacks dentales, signos de problemas.
- **Parásitos**: Pulgas, garrapatas, ácaros - prevención y tratamiento.
- **Clima**: Protección en verano (golpe de calor) e invierno (frío).

### 6. RAZAS Y CARACTERÍSTICAS
- Conoces las características de las principales razas de perros.
- Problemas de salud específicos por raza.
- Temperamento y necesidades de cada raza.
- Mestizos y perros rescatados.

## Reglas Importantes

### SIEMPRE:
✅ Responde en el idioma que te indiquen (español, inglés o italiano)
✅ Si tienes información del perro del usuario, personaliza las respuestas
✅ Ante síntomas graves o de emergencia, recomienda ir al veterinario INMEDIATAMENTE
✅ Usa emojis de forma moderada para hacer la conversación más amigable 🐕
✅ Sé conciso pero completo - respuestas de 2-4 párrafos idealmente
✅ Ofrece consejos prácticos y accionables
✅ Si no estás seguro de algo médico, admítelo y recomienda consultar al veterinario

### NUNCA:
❌ NO diagnostiques enfermedades específicas - solo describes síntomas y posibilidades
❌ NO recetes medicamentos ni dosis específicas
❌ NO minimices síntomas que podrían ser graves
❌ NO reemplaces la visita al veterinario
❌ NO uses lenguaje técnico sin explicarlo
❌ NO des información falsa o inventada

## Formato de Respuestas
- Usa **negritas** para destacar puntos importantes
- Usa listas cuando sea útil para organizar información
- Incluye un emoji ocasional para darle calidez 🐾
- Si la pregunta es sobre emergencias, responde de forma directa y clara

## Ejemplos de tu Tono

**Pregunta sobre alimentación:**
"¡Buena pregunta! 🐕 Para [nombre del perro], que pesa [X] kg, recomendaría alrededor de [cantidad] de comida de calidad al día, dividida en 2 comidas. Recuerda que esto puede variar según su nivel de actividad..."

**Síntoma preocupante:**
"⚠️ Lo que describes podría ser importante. El vómito repetido con sangre es una señal de que necesitas llevar a [nombre] al veterinario lo antes posible. Mientras tanto, no le des comida ni agua y mantén la calma..."

**Pregunta sobre comportamiento:**
"¡Qué interesante! 🎾 Los ladridos excesivos pueden tener varias causas. En el caso de [nombre], podría ser aburrimiento, ansiedad, o simplemente que está tratando de comunicarse contigo. Aquí hay algunas estrategias que puedes probar..."
"""

@api_router.post("/chat")
async def chat(data: ChatMessageCreate, user: User = Depends(require_auth)):
    now = datetime.now(timezone.utc).isoformat()
    
    # Save user message
    user_message = {
        "user_id": user.user_id,
        "dog_id": data.dog_id,
        "role": "user",
        "content": data.content,
        "created_at": now
    }
    
    try:
        supabase.table("chat_messages").insert(user_message).execute()
    except Exception as e:
        logger.error(f"Error saving user message: {e}")
    
    # Get dog info for context
    dog_context = ""
    dog_name = "tu perro"
    if data.dog_id:
        try:
            result = supabase.table("dogs").select("*").eq("id", data.dog_id).execute()
            if result.data:
                dog = result.data[0]
                dog_name = dog['name']
                age_months = dog.get('age_months', 0)
                
                # Format age nicely
                if age_months >= 12:
                    age_str = f"{age_months // 12} años"
                    if age_months % 12 > 0:
                        age_str += f" y {age_months % 12} meses"
                else:
                    age_str = f"{age_months} meses"
                
                dog_context = f"""
## Información del Perro del Usuario
- **Nombre**: {dog_name}
- **Edad**: {age_str}
- **Peso**: {dog.get('weight', 0)} kg
- **Raza**: {dog.get('breed', 'No especificada')}
- **Chip ID**: {dog.get('chip_id', 'No registrado')}

Usa esta información para personalizar tus respuestas y mencionar a {dog_name} por su nombre cuando sea apropiado.
"""
        except Exception as e:
            logger.error(f"Error getting dog info: {e}")
    
    # Get recent chat history for context
    history = []
    try:
        result = supabase.table("chat_messages").select("*").eq("user_id", user.user_id)
        if data.dog_id:
            result = result.eq("dog_id", data.dog_id)
        result = result.order("created_at", desc=True).limit(10).execute()
        
        for msg in reversed(result.data):
            history.append({"role": msg["role"], "content": msg["content"]})
    except Exception as e:
        logger.error(f"Error getting chat history: {e}")
    
    # Language instruction
    lang_instructions = {
        "Spanish": "IMPORTANTE: Responde SIEMPRE en español.",
        "English": "IMPORTANT: ALWAYS respond in English.", 
        "Italian": "IMPORTANTE: Rispondi SEMPRE in italiano.",
        "es": "IMPORTANTE: Responde SIEMPRE en español.",
        "en": "IMPORTANT: ALWAYS respond in English.",
        "it": "IMPORTANTE: Rispondi SEMPRE in italiano."
    }
    language_instruction = lang_instructions.get(data.language, "IMPORTANTE: Responde SIEMPRE en español.")
    
    # Build the complete system prompt
    complete_system_prompt = f"""{HANI_SYSTEM_PROMPT}

{dog_context}

{language_instruction}
"""
    
    # Call AI - Using gpt-4o-mini for cost efficiency (fraction of cent per message)
    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(
                "https://api.emergentagent.com/v1/chat/completions",
                headers={
                    "Authorization": f"Bearer {EMERGENT_LLM_KEY}",
                    "Content-Type": "application/json"
                },
                json={
                    "model": "gpt-4o-mini",  # Most cost-effective model (~$0.00015/1K input, ~$0.0006/1K output)
                    "messages": [
                        {"role": "system", "content": complete_system_prompt},
                        *history[-6:],  # Last 6 messages for context
                        {"role": "user", "content": data.content}
                    ],
                    "max_tokens": 800,  # Reasonable limit for cost control
                    "temperature": 0.7  # Good balance between creativity and accuracy
                },
                timeout=30.0
            )
            
            if response.status_code == 200:
                ai_response = response.json()["choices"][0]["message"]["content"]
            else:
                logger.error(f"AI API error: {response.status_code} - {response.text}")
                ai_response = f"Lo siento, hubo un error al procesar tu mensaje. Por favor, intenta de nuevo. 🐕"
    except Exception as e:
        logger.error(f"AI error: {e}")
        ai_response = "Lo siento, hubo un problema técnico. Por favor, intenta de nuevo en unos segundos. 🐕"
    
    # Save assistant message
    assistant_message = {
        "user_id": user.user_id,
        "dog_id": data.dog_id,
        "role": "assistant",
        "content": ai_response,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    message_id = None
    try:
        result = supabase.table("chat_messages").insert(assistant_message).execute()
        message_id = str(result.data[0]["id"])
    except Exception as e:
        logger.error(f"Error saving assistant message: {e}")
    
    return {
        "id": message_id or str(uuid.uuid4()),
        "role": "assistant",
        "content": ai_response,
        "created_at": datetime.now(timezone.utc).isoformat()
    }

@api_router.get("/chat/history")
async def get_chat_history(dog_id: Optional[str] = None, limit: int = 50, user: User = Depends(require_auth)):
    try:
        query = supabase.table("chat_messages").select("*").eq("user_id", user.user_id)
        
        if dog_id:
            query = query.eq("dog_id", dog_id)
        
        result = query.order("created_at", desc=True).limit(limit).execute()
        
        messages = []
        for msg in reversed(result.data):
            messages.append({
                "id": str(msg["id"]),
                "role": msg["role"],
                "content": msg["content"],
                "created_at": msg["created_at"]
            })
        
        return messages
    except Exception as e:
        logger.error(f"Error getting chat history: {e}")
        return []

# ==================== MEDICAL EVENTS ENDPOINTS ====================

@api_router.post("/medical-events")
async def create_medical_event(data: MedicalEventCreate, user: User = Depends(require_auth)):
    now = datetime.now(timezone.utc).isoformat()
    
    event = {
        "dog_id": data.dog_id,
        "event_type": data.type,
        "title": data.title,
        "description": data.description,
        "event_date": data.date,
        "created_at": now
    }
    
    try:
        result = supabase.table("medical_events").insert(event).execute()
        return {
            "id": str(result.data[0]["id"]),
            "dog_id": data.dog_id,
            "type": data.type,
            "title": data.title,
            "date": data.date
        }
    except Exception as e:
        logger.error(f"Error creating medical event: {e}")
        raise HTTPException(status_code=500, detail="Error al crear evento médico")

@api_router.get("/medical-events/{dog_id}")
async def get_medical_events(dog_id: str, user: User = Depends(require_auth)):
    try:
        result = supabase.table("medical_events").select("*").eq("dog_id", dog_id).order("event_date", desc=True).execute()
        
        events = []
        for event in result.data:
            events.append({
                "id": str(event["id"]),
                "dog_id": event["dog_id"],
                "type": event["event_type"],
                "title": event["title"],
                "description": event.get("description"),
                "date": event["event_date"],
                "created_at": event["created_at"]
            })
        
        return events
    except Exception as e:
        logger.error(f"Error getting medical events: {e}")
        return []

@api_router.delete("/medical-events/{event_id}")
async def delete_medical_event(event_id: str, user: User = Depends(require_auth)):
    try:
        supabase.table("medical_events").delete().eq("id", event_id).execute()
        return {"message": "Evento eliminado"}
    except Exception as e:
        logger.error(f"Error deleting medical event: {e}")
        raise HTTPException(status_code=500, detail="Error al eliminar evento")

# ==================== GAMIFICATION ENDPOINTS ====================

@api_router.get("/gamification/stats")
async def get_gamification_stats(user: User = Depends(require_auth)):
    try:
        result = supabase.table("gamification").select("*").eq("user_id", user.user_id).execute()
        
        if result.data and len(result.data) > 0:
            stats = result.data[0]
            return {
                "bones": stats.get("bones", 0),
                "xp": stats.get("xp", 0),
                "level": stats.get("level", 1),
                "level_progress": stats.get("xp", 0) % 500,
                "level_target": 500,
                "streak_days": stats.get("streak_days", 0),
                "exercises_completed": stats.get("exercises_completed", 0),
                "practice_minutes": stats.get("practice_minutes", 0)
            }
        
        # Create default stats
        now = datetime.now(timezone.utc).isoformat()
        supabase.table("gamification").insert({
            "user_id": user.user_id,
            "bones": 0,
            "xp": 0,
            "level": 1,
            "created_at": now,
            "updated_at": now
        }).execute()
        
        return {
            "bones": 0,
            "xp": 0,
            "level": 1,
            "level_progress": 0,
            "level_target": 500,
            "streak_days": 0,
            "exercises_completed": 0,
            "practice_minutes": 0
        }
    except Exception as e:
        logger.error(f"Error getting gamification stats: {e}")
        return {
            "bones": 0,
            "xp": 0,
            "level": 1,
            "level_progress": 0,
            "level_target": 500,
            "streak_days": 0,
            "exercises_completed": 0,
            "practice_minutes": 0
        }

@api_router.post("/gamification/add-bones")
async def add_bones(amount: int = 5, user: User = Depends(require_auth)):
    try:
        # Get current stats
        result = supabase.table("gamification").select("*").eq("user_id", user.user_id).execute()
        
        now = datetime.now(timezone.utc).isoformat()
        
        if result.data and len(result.data) > 0:
            current = result.data[0]
            new_bones = current.get("bones", 0) + amount
            new_xp = current.get("xp", 0) + (amount * 2)
            new_level = 1 + (new_xp // 500)
            
            supabase.table("gamification").update({
                "bones": new_bones,
                "xp": new_xp,
                "level": new_level,
                "exercises_completed": current.get("exercises_completed", 0) + 1,
                "updated_at": now
            }).eq("user_id", user.user_id).execute()
            
            return {"bones": new_bones, "xp": new_xp, "level": new_level}
        else:
            supabase.table("gamification").insert({
                "user_id": user.user_id,
                "bones": amount,
                "xp": amount * 2,
                "level": 1,
                "exercises_completed": 1,
                "created_at": now,
                "updated_at": now
            }).execute()
            
            return {"bones": amount, "xp": amount * 2, "level": 1}
    except Exception as e:
        logger.error(f"Error adding bones: {e}")
        return {"bones": 0, "xp": 0, "level": 1}

# ==================== ROUTES ENDPOINTS ====================

@api_router.post("/routes")
async def create_route(data: RouteCreate, user: User = Depends(require_auth)):
    now = datetime.now(timezone.utc).isoformat()
    
    route = {
        "user_id": user.user_id,
        "dog_id": data.dog_id,
        "name": data.name or f"Paseo {datetime.now().strftime('%d/%m/%Y')}",
        "distance_km": data.distance_km,
        "duration_minutes": data.duration_minutes,
        "coordinates": data.coordinates,
        "start_time": now,
        "created_at": now
    }
    
    try:
        result = supabase.table("routes").insert(route).execute()
        return {"id": str(result.data[0]["id"]), "message": "Ruta guardada"}
    except Exception as e:
        logger.error(f"Error creating route: {e}")
        raise HTTPException(status_code=500, detail="Error al guardar ruta")

@api_router.get("/routes/{dog_id}")
async def get_routes(dog_id: str, user: User = Depends(require_auth)):
    try:
        result = supabase.table("routes").select("*").eq("dog_id", dog_id).order("created_at", desc=True).limit(20).execute()
        
        routes = []
        for route in result.data:
            routes.append({
                "id": str(route["id"]),
                "name": route.get("name", "Paseo"),
                "distance_km": float(route.get("distance_km", 0)),
                "duration_minutes": route.get("duration_minutes", 0),
                "created_at": route.get("created_at")
            })
        
        return routes
    except Exception as e:
        logger.error(f"Error getting routes: {e}")
        return []

# ==================== GOOGLE WALLET ====================

def create_wallet_pass_jwt(dog_data: dict, user_data: dict) -> str:
    """Generate a signed JWT for Google Wallet pass"""
    
    # Load credentials
    with open(GOOGLE_WALLET_CREDENTIALS_PATH, 'r') as f:
        credentials_info = json.load(f)
    
    # Create unique object ID
    object_id = f"{GOOGLE_WALLET_ISSUER_ID}.{dog_data['id'].replace('-', '')}"
    
    # Calculate age display
    age_months = dog_data.get('age', 0)
    if age_months >= 12:
        age_display = f"{age_months // 12} años"
        if age_months % 12 > 0:
            age_display += f" {age_months % 12} meses"
    else:
        age_display = f"{age_months} meses"
    
    # Create the pass object
    generic_object = {
        "id": object_id,
        "classId": GOOGLE_WALLET_CLASS_ID,
        "genericType": "GENERIC_TYPE_UNSPECIFIED",
        "hexBackgroundColor": "#1B4D3E",
        "logo": {
            "sourceUri": {
                "uri": "https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=100&h=100&fit=crop"
            }
        },
        "cardTitle": {
            "defaultValue": {
                "language": "es",
                "value": "HANI Passport"
            }
        },
        "subheader": {
            "defaultValue": {
                "language": "es",
                "value": "Pasaporte Canino"
            }
        },
        "header": {
            "defaultValue": {
                "language": "es",
                "value": dog_data.get('name', 'Mi Perro')
            }
        },
        "barcode": {
            "type": "QR_CODE",
            "value": f"HANI-{dog_data['id'][:8].upper()}",
            "alternateText": f"ID: {dog_data['id'][:8].upper()}"
        },
        "heroImage": {
            "sourceUri": {
                "uri": dog_data.get('avatar') or "https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=600"
            }
        },
        "textModulesData": [
            {
                "id": "breed",
                "header": "RAZA",
                "body": dog_data.get('breed') or "Sin especificar"
            },
            {
                "id": "age",
                "header": "EDAD",
                "body": age_display
            },
            {
                "id": "weight",
                "header": "PESO",
                "body": f"{dog_data.get('weight', 0)} kg"
            },
            {
                "id": "chip",
                "header": "Nº CHIP",
                "body": dog_data.get('chip_id') or "No registrado"
            },
            {
                "id": "owner",
                "header": "TUTOR",
                "body": user_data.get('name', user_data.get('email', 'Usuario'))
            }
        ]
    }
    
    # Create JWT payload
    claims = {
        "iss": credentials_info["client_email"],
        "aud": "google",
        "origins": ["https://pethani.preview.emergentagent.com"],
        "typ": "savetowallet",
        "payload": {
            "genericObjects": [generic_object]
        }
    }
    
    # Sign the JWT
    token = jwt.encode(
        claims,
        credentials_info["private_key"],
        algorithm="RS256"
    )
    
    return token

@api_router.get("/wallet/pass/{dog_id}")
async def get_wallet_pass(dog_id: str, user: User = Depends(require_auth)):
    """Generate Google Wallet pass URL for a dog"""
    try:
        # Get dog data
        result = supabase.table("dogs").select("*").eq("id", dog_id).eq("user_id", user.user_id).execute()
        
        if not result.data or len(result.data) == 0:
            raise HTTPException(status_code=404, detail="Perro no encontrado")
        
        dog_data = result.data[0]
        dog_formatted = {
            "id": str(dog_data["id"]),
            "name": dog_data["name"],
            "breed": dog_data.get("breed"),
            "age": dog_data.get("age_months", 0),
            "weight": float(dog_data.get("weight", 0)),
            "chip_id": dog_data.get("chip_id"),
            "avatar": dog_data.get("photo_url")
        }
        
        user_data = {
            "name": user.name,
            "email": user.email
        }
        
        # Generate JWT
        jwt_token = create_wallet_pass_jwt(dog_formatted, user_data)
        
        # Create save URL
        save_url = f"https://pay.google.com/gp/v/save/{jwt_token}"
        
        return {
            "save_url": save_url,
            "dog_name": dog_data["name"]
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error generating wallet pass: {e}")
        raise HTTPException(status_code=500, detail=f"Error al generar pase: {str(e)}")

# ==================== HEALTH CHECK ====================

@api_router.get("/health")
async def health_check():
    return {"status": "healthy", "database": "supabase"}

# ==================== CORS & APP SETUP ====================

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
