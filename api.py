import requests
from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.responses import JSONResponse
from pydantic import BaseModel

from ocr_service import run_ocr

app = FastAPI(
    title="FitLife Assistant API",
    description="API para reconhecimento de imagens (OCR) e chat sobre saúde/nutrição",
    version="1.0.0",
)

OLLAMA_URL = "http://127.0.0.1:11434/api/generate"
CHAT_MODEL = "llama3.2"


class ChatRequest(BaseModel):
    message: str


class ChatResponse(BaseModel):
    response: str


class OCRResponse(BaseModel):
    text: str
    mode: str


@app.get("/health")
def health():
    return {"status": "ok", "service": "FitLife Assistant"}


@app.post("/ocr", response_model=OCRResponse)
async def ocr_image(
    file: UploadFile = File(...),
    nutrition_mode: bool = True,
):
    """
    Envia uma imagem e recebe o texto extraído via Ollama Vision.
    - nutrition_mode=true: modo especializado em tabelas nutricionais e alimentos
    - nutrition_mode=false: OCR genérico
    """
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
    Chat com o FitLife Assistant usando Llama 3.2 via Ollama.
    """
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
    except requests.exceptions.ConnectionError:
        raise HTTPException(
            status_code=503,
            detail="Ollama não está rodando. Inicie com: ollama serve",
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

    return ChatResponse(response=answer)


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("api:app", host="0.0.0.0", port=8000, reload=True)
