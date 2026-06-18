# FitLife Assistant

Assistente virtual focado em saúde, nutrição e academia com reconhecimento de imagens via IA.

## Funcionalidades

- **OCR Nutricional**: envie uma foto de um prato ou rótulo e receba os macronutrientes estimados
- **Chat**: converse com o assistente sobre nutrição, treinos e saúde
- **API REST**: integre com qualquer frontend ou aplicativo mobile

---

## Pré-requisitos

- Python 3.10+
- [Ollama](https://ollama.com/download) instalado e rodando

---

## Instalação

### 1. Clone o repositório

```bash
git clone https://github.com/seu-usuario/FitLife-Assistant.git
cd FitLife-Assistant
```

### 2. Crie e ative um ambiente virtual

```bash
python -m venv venv

# Windows
venv\Scripts\activate

# Linux/macOS
source venv/bin/activate
```

### 3. Instale as dependências

```bash
pip install -r requirements.txt
```

### 4. Baixe os modelos do Ollama

Com o Ollama instalado, abra um terminal e execute:

```bash
# Modelo de chat
ollama pull llama3.2

# Modelo de visão (OCR)
ollama pull llava
```

> O download pode demorar alguns minutos dependendo da sua conexão.

### 5. Inicie o Ollama

```bash
ollama serve
```

> Se aparecer erro de porta em uso, o Ollama ja esta rodando. Pode pular este passo.

---

## Rodando a API

```bash
python api.py
```

A API estará disponível em `http://localhost:8000`.

---

## Endpoints

### `GET /health`
Verifica se a API está no ar.

```bash
curl http://localhost:8000/health
```

**Resposta:**
```json
{ "status": "ok", "service": "FitLife Assistant" }
```

---

### `POST /ocr`
Envia uma imagem e recebe análise nutricional.

| Parâmetro | Tipo | Descrição |
|---|---|---|
| `file` | imagem (form-data) | Foto do prato ou rótulo nutricional |
| `nutrition_mode` | bool (query) | `true` = análise nutricional (padrão), `false` = OCR genérico |

**Exemplo com curl:**
```bash
curl -X POST "http://localhost:8000/ocr" \
  -F "file=@foto_prato.jpg"
```

**Resposta:**
```json
{
  "text": "**Alimentos identificados:** Feijoada, arroz branco\n**Calorias:** ~520 kcal\n**Proteínas:** ~28g\n**Carboidratos:** ~62g\n**Gorduras:** ~14g\n**Observações:** Valores estimados.",
  "mode": "nutrition"
}
```

---

### `POST /chat`
Conversa com o assistente sobre saúde e nutrição.

**Body (JSON):**
```json
{ "message": "Quantas calorias tem uma banana?" }
```

**Exemplo com curl:**
```bash
curl -X POST "http://localhost:8000/chat" \
  -H "Content-Type: application/json" \
  -d "{\"message\": \"Quantas calorias tem uma banana?\"}"
```

**Resposta:**
```json
{
  "response": "Uma banana média tem cerca de 90 kcal, com 23g de carboidratos e 1g de proteína. Ótima opção pré-treino!"
}
```

---

## Documentação interativa

Com a API rodando, acesse no browser:

```
http://localhost:8000/docs
```

Interface Swagger completa para testar todos os endpoints sem precisar de curl.

---

## Estrutura do projeto

```
FitLife-Assistant/
├── api.py            # API FastAPI (entry point)
├── ocr_service.py    # Serviço de OCR com Ollama Vision
├── bot.py            # CLI legado do chatbot
├── trainer.py        # Script de treino do banco de dados
├── cleaner.py        # Limpeza e estruturação de dados
├── data/
│   └── alimentos.json
└── requirements.txt
```

---

## Modelos utilizados

| Modelo | Uso | Tamanho |
|---|---|---|
| `llava` | OCR e análise de imagens | ~4.7 GB |
| `llama3.2` | Chat e respostas textuais | ~2.0 GB |
