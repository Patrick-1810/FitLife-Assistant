# Nome do arquivo: bot.py
import os
from chatterbot import ChatBot

# Configuração do Bot com adaptadores híbridos
chatbot = ChatBot(
    "FitLifeBot",
    logic_adapters=[
        {
            # Busca respostas exatas (ex: macros cadastrados)
            "import_path": "chatterbot.logic.BestMatch",
            "default_response": "Não tenho certeza sobre isso. Vou perguntar para a minha IA integrada...",
            "maximum_similarity_threshold": 0.70
        },
        {
            # Acionado para substituições de alimentos e dicas criativas
            "import_path": "chatterbot.logic.OllamaLogicAdapter",
            "model": "llama3.2:latest",
            "host": "http://localhost:11434",
        },
    ],
    storage_adapter="chatterbot.storage.SQLStorageAdapter",
    database_uri="sqlite:///database.sqlite3"
)

exit_conditions = (":q", "quit", "exit", "sair")

print("🍎 [FitLife Assistant] - Ativo e pronto! (Digite 'sair' para encerrar)")

while True:
    try:
        query = input("\n👤 Você > ")
        if query.lower() in exit_conditions:
            print("💪 Treine pesado, coma bem e até logo!")
            break

        response = chatbot.get_response(query)
        print(f"🤖 Bot > {response}")

    except (KeyboardInterrupt, EOFError):
        break