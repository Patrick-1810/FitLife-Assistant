import os
import requests
from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from chatterbot import ChatBot

from ocr_service import run_ocr

app = FastAPI(
    title="FitLife Assistant API",
    description="API híbrida para reconhecimento de imagens (OCR) e chat com ChatterBot + Llama 3.2",
    version="1.1.0",
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

# Caminho para a base de dados SQLite
DB_FILE = os.path.join(os.path.dirname(__file__), "database.sqlite3")

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


class ChatResponse(BaseModel):
    response: str
    source: str


class OCRResponse(BaseModel):
    text: str
    mode: str


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
    """
    Chat Híbrido: Primeiro tenta o ChatterBot (SQLite). Se falhar, recorre ao Llama 3.2.
    """
    try:

        response_statement = chatbot.get_response(body.message)

        if response_statement.confidence >= 0.75 and response_statement.text != "TRIGGER_LLAMA":
            return ChatResponse(
                response=response_statement.text,
                source="local_db"
            )

    except Exception as e:
        print(f"Aviso: Falha ao consultar banco local ({e}). Usando IA como fallback.")

    print(f"⏳ [IA] Pergunta não encontrada no SQLite. Consultando {CHAT_MODEL}...")

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

        return ChatResponse(
            response=answer,
            source="ia_llama"
        )

    except requests.exceptions.ConnectionError:
        raise HTTPException(
            status_code=503,
            detail="Ollama não está rodando. Inicie com: ollama serve",
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("api:app", host="0.0.0.0", port=8000, reload=True)