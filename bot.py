import os
import requests
from chatterbot import ChatBot
from chatterbot.logic import BestMatch

# Caminho para o banco de dados SQLite
DB_FILE = os.path.join(os.path.dirname(__file__), "database.sqlite3")

print("🤖 Inicializando o FitLife Assistant Híbrido Estrito...")

# Inicializa o bot apenas com o armazenamento e o adaptador padrão
chatbot = ChatBot(
    "FitLifeBot",
    storage_adapter="chatterbot.storage.SQLStorageAdapter",
    database_uri=f"sqlite:///{DB_FILE}",
    logic_adapters=[
    {
            "import_path": "chatterbot.logic.BestMatch",
            "default_response": "TRIGGER_LLAMA",
            "maximum_similarity_threshold": 0.75  # Exigência para responder JSON
        }
    ]
)

# Função direta para chamar o Llama 3.2 caso a busca no banco falhe
def perguntar_ao_ollama(pergunta):
    url = "http://127.0.0.1:11434/api/generate"
    payload = {
        "model": "llama3.2",
        "prompt": (
            f"Você é o FitLife Assistant, um assistente virtual focado em academia, saúde e nutrição. "
            f"Responda de forma direta, motivadora, curta e amigável em português.\n"
            f"Usuário: {pergunta}\n"
            f"Assistente:"
        ),
        "stream": False
    }
    try:
        # Timeout para 45 segundos para dar tempo do processador responder
        response = requests.post(url, json=payload, timeout=45)
        if response.status_code == 200:
            return response.json().get("response", "").strip()
    except Exception as e:
        print(f"\n ERRO REAL DA REQUISIÇÃO: {e}\n")


    return "Estou processando a resposta com a minha IA, mas ela está demorando um pouco mais do que o esperado. Tente novamente em alguns segundos!"

exit_conditions = (":q", "quit", "exit", "sair")

print("\n🍎 FitLife Assistant Híbrido Ativo!")
print("Banco de dados local + Llama 3.2 integrados. (Digite 'sair' para encerrar)")

while True:
    try:
        user_input = input("\n👤 Você > ")

        if user_input.lower() in exit_conditions:
            print("💪 Treine pesado, coma bem e até a próxima!")
            break

        # Obtém a correspondência do banco de dados
        response_statement = chatbot.get_response(user_input)

        #Se a confiança for menor que 75% ou cair na resposta padrão Ollama assume
        if response_statement.confidence < 0.75 or response_statement.text == "TRIGGER_LLAMA":
            print("⏳ [IA] Processando com Llama 3.2...")
            resposta_final = perguntar_ao_ollama(user_input)
        else:
            # Se tiver alta confiança, usa o dado estático do seu JSON
            resposta_final = response_statement.text

        print(f"🤖 Bot > {resposta_final}")

    except (KeyboardInterrupt, EOFError):
        print("\n💪 Encerrando o assistente. Até logo!")
        break