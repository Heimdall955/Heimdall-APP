from fastapi import FastAPI, APIRouter, HTTPException, Depends, Request
from fastapi.security import HTTPBearer
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Optional
import uuid
from datetime import datetime, timezone, timedelta
import bcrypt
import httpx

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# LLM Key
EMERGENT_LLM_KEY = os.environ.get('EMERGENT_LLM_KEY', '')

app = FastAPI()
api_router = APIRouter(prefix="/api")
security = HTTPBearer(auto_error=False)

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

class ChatMessage(BaseModel):
    id: str
    user_id: str
    dog_id: Optional[str] = None
    role: str
    content: str
    rating: Optional[str] = None
    created_at: datetime

class ChatRating(BaseModel):
    rating: str  # 'up' or 'down'

class MedicalEventCreate(BaseModel):
    dog_id: str
    type: str  # vaccine, checkup, deworming, note, medication
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

# ==================== AUTH HELPERS ====================

def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def verify_password(password: str, hashed: str) -> bool:
    return bcrypt.checkpw(password.encode('utf-8'), hashed.encode('utf-8'))

def generate_session_token() -> str:
    return f"session_{uuid.uuid4().hex}"

async def get_current_user(request: Request) -> Optional[User]:
    # Try Authorization header first
    auth_header = request.headers.get("Authorization")
    session_token = None
    
    if auth_header and auth_header.startswith("Bearer "):
        session_token = auth_header.split(" ")[1]
    
    # Try cookie as fallback
    if not session_token:
        session_token = request.cookies.get("session_token")
    
    if not session_token:
        return None
    
    session = await db.user_sessions.find_one(
        {"session_token": session_token},
        {"_id": 0}
    )
    
    if not session:
        return None
    
    # Check expiry
    expires_at = session.get("expires_at")
    if expires_at:
        if expires_at.tzinfo is None:
            expires_at = expires_at.replace(tzinfo=timezone.utc)
        if expires_at < datetime.now(timezone.utc):
            return None
    
    user_doc = await db.users.find_one(
        {"user_id": session["user_id"]},
        {"_id": 0}
    )
    
    if user_doc:
        return User(**user_doc)
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
    existing = await db.users.find_one({"email": data.email}, {"_id": 0})
    if existing:
        raise HTTPException(status_code=400, detail="El email ya está registrado")
    
    user_id = f"user_{uuid.uuid4().hex[:12]}"
    now = datetime.now(timezone.utc)
    
    user_doc = {
        "user_id": user_id,
        "email": data.email,
        "name": data.name,
        "password_hash": hash_password(data.password),
        "picture": None,
        "language": "es",
        "created_at": now,
    }
    
    await db.users.insert_one(user_doc)
    
    # Create session
    session_token = generate_session_token()
    await db.user_sessions.insert_one({
        "user_id": user_id,
        "session_token": session_token,
        "expires_at": now + timedelta(days=7),
        "created_at": now,
    })
    
    return {
        "session_token": session_token,
        "user": {
            "user_id": user_id,
            "email": data.email,
            "name": data.name,
            "picture": None,
            "language": "es",
            "created_at": now.isoformat(),
        }
    }

@api_router.post("/auth/login")
async def login(data: UserLogin):
    user_doc = await db.users.find_one({"email": data.email}, {"_id": 0})
    if not user_doc:
        raise HTTPException(status_code=401, detail="Credenciales inválidas")
    
    if not verify_password(data.password, user_doc.get("password_hash", "")):
        raise HTTPException(status_code=401, detail="Credenciales inválidas")
    
    now = datetime.now(timezone.utc)
    session_token = generate_session_token()
    
    await db.user_sessions.insert_one({
        "user_id": user_doc["user_id"],
        "session_token": session_token,
        "expires_at": now + timedelta(days=7),
        "created_at": now,
    })
    
    return {
        "session_token": session_token,
        "user": {
            "user_id": user_doc["user_id"],
            "email": user_doc["email"],
            "name": user_doc["name"],
            "picture": user_doc.get("picture"),
            "language": user_doc.get("language", "es"),
            "created_at": user_doc["created_at"].isoformat() if isinstance(user_doc["created_at"], datetime) else user_doc["created_at"],
        }
    }

@api_router.post("/auth/session")
async def exchange_session(data: SessionExchange):
    """Exchange Google OAuth session_id for our session_token"""
    async with httpx.AsyncClient() as client:
        response = await client.get(
            "https://demobackend.emergentagent.com/auth/v1/env/oauth/session-data",
            headers={"X-Session-ID": data.session_id}
        )
        
        if response.status_code != 200:
            raise HTTPException(status_code=401, detail="Sesión inválida")
        
        user_data = response.json()
    
    now = datetime.now(timezone.utc)
    
    # Check if user exists
    existing = await db.users.find_one({"email": user_data["email"]}, {"_id": 0})
    
    if existing:
        user_id = existing["user_id"]
    else:
        user_id = f"user_{uuid.uuid4().hex[:12]}"
        await db.users.insert_one({
            "user_id": user_id,
            "email": user_data["email"],
            "name": user_data["name"],
            "picture": user_data.get("picture"),
            "language": "es",
            "created_at": now,
        })
    
    # Create our session
    session_token = generate_session_token()
    await db.user_sessions.insert_one({
        "user_id": user_id,
        "session_token": session_token,
        "expires_at": now + timedelta(days=7),
        "created_at": now,
    })
    
    user_doc = await db.users.find_one({"user_id": user_id}, {"_id": 0})
    
    return {
        "session_token": session_token,
        "user": {
            "user_id": user_doc["user_id"],
            "email": user_doc["email"],
            "name": user_doc["name"],
            "picture": user_doc.get("picture"),
            "language": user_doc.get("language", "es"),
            "created_at": user_doc["created_at"].isoformat() if isinstance(user_doc["created_at"], datetime) else user_doc["created_at"],
        }
    }

@api_router.get("/auth/me")
async def get_me(user: User = Depends(require_auth)):
    return user

@api_router.post("/auth/logout")
async def logout(request: Request):
    auth_header = request.headers.get("Authorization")
    session_token = None
    
    if auth_header and auth_header.startswith("Bearer "):
        session_token = auth_header.split(" ")[1]
    
    if not session_token:
        session_token = request.cookies.get("session_token")
    
    if session_token:
        await db.user_sessions.delete_one({"session_token": session_token})
    
    return {"message": "Sesión cerrada"}

# ==================== DOGS ENDPOINTS ====================

@api_router.post("/dogs", response_model=Dog)
async def create_dog(data: DogCreate, user: User = Depends(require_auth)):
    now = datetime.now(timezone.utc)
    dog_id = f"dog_{uuid.uuid4().hex[:12]}"
    
    dog_doc = {
        "id": dog_id,
        "user_id": user.user_id,
        "name": data.name,
        "age": data.age,
        "weight": data.weight,
        "sex": data.sex,
        "breed": data.breed,
        "chip_id": data.chip_id,
        "avatar": data.avatar,
        "created_at": now,
        "updated_at": now,
    }
    
    await db.dogs.insert_one(dog_doc)
    return Dog(**dog_doc)

@api_router.get("/dogs", response_model=List[Dog])
async def get_dogs(user: User = Depends(require_auth)):
    dogs = await db.dogs.find(
        {"user_id": user.user_id},
        {"_id": 0}
    ).to_list(100)
    return [Dog(**dog) for dog in dogs]

@api_router.get("/dogs/{dog_id}", response_model=Dog)
async def get_dog(dog_id: str, user: User = Depends(require_auth)):
    dog = await db.dogs.find_one(
        {"id": dog_id, "user_id": user.user_id},
        {"_id": 0}
    )
    if not dog:
        raise HTTPException(status_code=404, detail="Perro no encontrado")
    return Dog(**dog)

@api_router.put("/dogs/{dog_id}", response_model=Dog)
async def update_dog(dog_id: str, data: DogUpdate, user: User = Depends(require_auth)):
    dog = await db.dogs.find_one(
        {"id": dog_id, "user_id": user.user_id},
        {"_id": 0}
    )
    if not dog:
        raise HTTPException(status_code=404, detail="Perro no encontrado")
    
    update_data = {k: v for k, v in data.dict().items() if v is not None}
    update_data["updated_at"] = datetime.now(timezone.utc)
    
    await db.dogs.update_one(
        {"id": dog_id},
        {"$set": update_data}
    )
    
    updated_dog = await db.dogs.find_one({"id": dog_id}, {"_id": 0})
    return Dog(**updated_dog)

@api_router.delete("/dogs/{dog_id}")
async def delete_dog(dog_id: str, user: User = Depends(require_auth)):
    result = await db.dogs.delete_one({"id": dog_id, "user_id": user.user_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Perro no encontrado")
    return {"message": "Perro eliminado"}

# ==================== CHAT ENDPOINTS ====================

@api_router.post("/chat", response_model=ChatMessage)
async def send_chat_message(data: ChatMessageCreate, user: User = Depends(require_auth)):
    from emergentintegrations.llm.chat import LlmChat, UserMessage
    
    now = datetime.now(timezone.utc)
    
    # Save user message
    user_msg_id = f"msg_{uuid.uuid4().hex[:12]}"
    user_msg = {
        "id": user_msg_id,
        "user_id": user.user_id,
        "dog_id": data.dog_id,
        "role": "user",
        "content": data.content,
        "rating": None,
        "created_at": now,
    }
    await db.chat_messages.insert_one(user_msg)
    
    # Get dog info for context
    dog_context = ""
    if data.dog_id:
        dog = await db.dogs.find_one({"id": data.dog_id}, {"_id": 0})
        if dog:
            dog_context = f"El perro del usuario se llama {dog['name']}, tiene {dog['age']} meses de edad y pesa {dog['weight']} kg."
            if dog.get('breed'):
                dog_context += f" Es de raza {dog['breed']}."
    
    # Get recent chat history
    recent_msgs = await db.chat_messages.find(
        {"user_id": user.user_id},
        {"_id": 0}
    ).sort("created_at", -1).limit(10).to_list(10)
    recent_msgs.reverse()
    
    system_message = f"""Eres Hani, el asistente virtual de Heimdall, una app de bienestar canino. 
Tu personalidad es como la de un cachorro curioso y juguetón: amigable, entusiasta y con buen humor.
Sin embargo, cuando se trata de temas de salud animal, te pones serio y profesional.

{dog_context}

Reglas importantes:
- Solo promueves adiestramiento positivo, nunca métodos de castigo
- Si detectas una emergencia de salud, recomienda ir al veterinario inmediatamente
- Habla siempre en español
- Usa emojis de perros 🐕 y patitas 🐾 ocasionalmente
- Sé conciso pero útil"""
    
    try:
        chat = LlmChat(
            api_key=EMERGENT_LLM_KEY,
            session_id=f"heimdall_{user.user_id}",
            system_message=system_message
        ).with_model("gemini", "gemini-3-flash-preview")
        
        user_message = UserMessage(text=data.content)
        response_text = await chat.send_message(user_message)
        
    except Exception as e:
        logging.error(f"LLM Error: {e}")
        response_text = "¡Guau! Parece que mi conexión está un poco lenta 🐕. ¿Podrías intentarlo de nuevo?"
    
    # Save assistant message
    assistant_msg_id = f"msg_{uuid.uuid4().hex[:12]}"
    assistant_msg = {
        "id": assistant_msg_id,
        "user_id": user.user_id,
        "dog_id": data.dog_id,
        "role": "assistant",
        "content": response_text,
        "rating": None,
        "created_at": datetime.now(timezone.utc),
    }
    await db.chat_messages.insert_one(assistant_msg)
    
    return ChatMessage(**assistant_msg)

@api_router.get("/chat/history", response_model=List[ChatMessage])
async def get_chat_history(
    dog_id: Optional[str] = None,
    limit: int = 50,
    user: User = Depends(require_auth)
):
    query = {"user_id": user.user_id}
    if dog_id:
        query["dog_id"] = dog_id
    
    messages = await db.chat_messages.find(
        query,
        {"_id": 0}
    ).sort("created_at", -1).limit(limit).to_list(limit)
    
    messages.reverse()
    return [ChatMessage(**msg) for msg in messages]

@api_router.post("/chat/{message_id}/rate")
async def rate_message(message_id: str, data: ChatRating, user: User = Depends(require_auth)):
    result = await db.chat_messages.update_one(
        {"id": message_id, "user_id": user.user_id},
        {"$set": {"rating": data.rating}}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Mensaje no encontrado")
    return {"message": "Rating guardado"}

# ==================== MEDICAL EVENTS ====================

@api_router.post("/medical-events", response_model=MedicalEvent)
async def create_medical_event(data: MedicalEventCreate, user: User = Depends(require_auth)):
    # Verify dog belongs to user
    dog = await db.dogs.find_one({"id": data.dog_id, "user_id": user.user_id}, {"_id": 0})
    if not dog:
        raise HTTPException(status_code=404, detail="Perro no encontrado")
    
    event_id = f"event_{uuid.uuid4().hex[:12]}"
    now = datetime.now(timezone.utc)
    
    event_doc = {
        "id": event_id,
        "dog_id": data.dog_id,
        "type": data.type,
        "title": data.title,
        "description": data.description,
        "date": data.date,
        "next_date": data.next_date,
        "created_at": now,
    }
    
    await db.medical_events.insert_one(event_doc)
    return MedicalEvent(**event_doc)

@api_router.get("/medical-events/{dog_id}", response_model=List[MedicalEvent])
async def get_medical_events(dog_id: str, user: User = Depends(require_auth)):
    # Verify dog belongs to user
    dog = await db.dogs.find_one({"id": dog_id, "user_id": user.user_id}, {"_id": 0})
    if not dog:
        raise HTTPException(status_code=404, detail="Perro no encontrado")
    
    events = await db.medical_events.find(
        {"dog_id": dog_id},
        {"_id": 0}
    ).sort("date", -1).to_list(100)
    
    return [MedicalEvent(**event) for event in events]

# ==================== STATUS ENDPOINTS ====================

@api_router.get("/")
async def root():
    return {"message": "Heimdall API v1.0", "status": "running"}

@api_router.get("/health")
async def health():
    return {"status": "healthy"}

# Include router
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
