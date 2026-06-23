import os
import time
import sqlite3
import requests
from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List
from chatterbot import ChatBot

from ocr_service import run_ocr

app = FastAPI(
    title="FitLife Assistant API",
    description="API híbrida para reconhecimento de imagens (OCR) e chat com ChatterBot + Llama 3.2",
    version="1.2.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

OLLAMA_URL = "http://127.0.0.1:11434/api/generate"
CHAT_MODEL = "llama3.2"

DB_FILE = os.path.join(os.path.dirname(__file__), "database.sqlite3")

def get_db_connection():
    conn = sqlite3.connect(DB_FILE)
    conn.row_factory = sqlite3.Row
    return conn

def init_custom_tables():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS chats (
            id INTEGER PRIMARY KEY,
            title TEXT NOT NULL,
            active INTEGER DEFAULT 0
        )
    """)
    
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS custom_messages (
            id INTEGER PRIMARY KEY,
            chat_id INTEGER,
            prompt TEXT,
            content TEXT,
            FOREIGN KEY(chat_id) REFERENCES chats(id) ON DELETE CASCADE
        )
    """)
    conn.commit()
    conn.close()

init_custom_tables()

print("🤖 Inicializando o motor do ChatterBot no Backend...")

chatbot = ChatBot(
    "FitLifeBot",
    storage_adapter="chatterbot.storage.SQLStorageAdapter",
    database_uri=f"sqlite:///{DB_FILE}",
    logic_adapters=[
        {
            "import_path": "chatterbot.logic.BestMatch",
            "default_response": "TRIGGER_LLAMA",
            "maximum_similarity_threshold": 0.75
        }
    ]
)
print("🍎 ChatterBot carregado e integrado com sucesso!")


class ChatRequest(BaseModel):
    message: str
    chat_id: Optional[int] = None  

class ChatResponse(BaseModel):
    response: str
    source: str
    chat_id: int  

class OCRResponse(BaseModel):
    text: str
    mode: str

class ChatHistoryItem(BaseModel):
    chatId: int
    title: str
    active: bool

class MessageItem(BaseModel):
    id: int
    prompt: str
    content: str

class ChatMessagesResponse(BaseModel):
    _id: int
    items: List[MessageItem]


@app.get("/history", response_model=List[ChatHistoryItem])
def get_history():
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT id as chatId, title, active FROM chats ORDER BY id DESC")
        rows = cursor.fetchall()
        conn.close()
        
        return [
            {
                "chatId": row["chatId"],
                "title": row["title"],
                "active": bool(row["active"])
            } for row in rows
        ]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao buscar histórico: {str(e)}")


@app.get("/chat/{chat_id}", response_model=ChatMessagesResponse)
def get_chat_messages(chat_id: int):
   
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute(
            "SELECT id, prompt, content FROM custom_messages WHERE chat_id = ? ORDER BY id ASC",
            (chat_id,)
        )
        rows = cursor.fetchall()
        conn.close()
        
        items = [
            {
                "id": row["id"],
                "prompt": row["prompt"],
                "content": row["content"]
            } for row in rows
        ]
        
        return ChatMessagesResponse(_id=chat_id, items=items)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao buscar mensagens do chat: {str(e)}")



@app.get("/health")
def health():
    return {"status": "ok", "service": "FitLife Assistant Hibrido"}


@app.post("/ocr", response_model=OCRResponse)
async def ocr_image(
        file: UploadFile = File(...),
        nutrition_mode: bool = True,
):
    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Arquivo deve ser uma imagem.")

    image_bytes = await file.read()
    if len(image_bytes) == 0:
        raise HTTPException(status_code=400, detail="Imagem vazia.")

    try:
        text = run_ocr(image_bytes, nutrition_mode=nutrition_mode)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro no OCR: {str(e)}")

    return OCRResponse(text=text, mode="nutrition" if nutrition_mode else "generic")


@app.post("/chat", response_model=ChatResponse)
def chat(body: ChatRequest):
  
    conn = get_db_connection()
    cursor = conn.cursor()
    
    chat_id = body.chat_id
   
    if not chat_id:
        chat_id = int(time.time() * 1000)
        title = body.message[:30] + "..." if len(body.message) > 30 else body.message
        
        cursor.execute(
            "INSERT INTO chats (id, title, active) VALUES (?, ?, ?)",
            (chat_id, title, 1)
        )
        conn.commit()

    answer = ""
    source = ""

    try:
        response_statement = chatbot.get_response(body.message)

        if response_statement.confidence >= 0.75 and response_statement.text != "TRIGGER_LLAMA":
            answer = response_statement.text
            source = "local_db"
    except Exception as e:
        print(f"Aviso: Falha ao consultar banco local ({e}). Usando IA como fallback.")

    if not answer:
        print(f"[IA] Pergunta não encontrada no SQLite. Consultando {CHAT_MODEL}...")
        payload = {
            "model": CHAT_MODEL,
            "prompt": (
                "Você é o FitLife Assistant, um assistente virtual focado em academia, saúde e nutrição. "
                "Responda de forma direta, motivadora, curta e amigável em português.\n"
                f"Usuário: {body.message}\nAssistente:"
            ),
            "stream": False,
        }

        try:
            resp = requests.post(OLLAMA_URL, json=payload, timeout=45)
            resp.raise_for_status()
            answer = resp.json().get("response", "").strip()
            source = "ia_llama"
        except requests.exceptions.ConnectionError:
            conn.close()
            raise HTTPException(
                status_code=503,
                detail="Ollama não está rodando. Inicie com: ollama serve",
            )
        except Exception as e:
            conn.close()
            raise HTTPException(status_code=500, detail=str(e))

    try:
        message_id = int(time.time() * 1000)
        cursor.execute(
            "INSERT INTO custom_messages (id, chat_id, prompt, content) VALUES (?, ?, ?, ?)",
            (message_id, chat_id, body.message, answer)
        )
        conn.commit()
    except Exception as e:
        print(f"Erro ao salvar mensagem no histórico: {e}")
    finally:
        conn.close()

    return ChatResponse(
        response=answer,
        source=source,
        chat_id=chat_id
    )


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("api:app", host="0.0.0.0", port=8000, reload=True)