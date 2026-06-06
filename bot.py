import os
from chatterbot import ChatBot

# Caminho para o mesmo banco de dados SQLite
DB_FILE = os.path.join(os.path.dirname(__file__), "database.sqlite3")

print("🤖 Inicializando o FitLife Assistant (Modo de Teste Local)...")

chatbot = ChatBot(
    "FitLifeBot",
    storage_adapter="chatterbot.storage.SQLStorageAdapter",
    database_uri=f"sqlite:///{DB_FILE}",
    logic_adapters=[
        {
            # Busca correspondências na base de dados
            "import_path": "chatterbot.logic.BestMatch",
            # Resposta caso o usuário pergunte algo que não está no JSON
            "default_response": "Desculpe, ainda não tenho as informações desse alimento ou comando no meu banco de dados.",
            # Se a pergunta for 60% parecida com o que está no banco, ele aceita
            "maximum_similarity_threshold": 0.60
        }
    ]
)

exit_conditions = (":q", "quit", "exit", "sair")

print("\nFitLife Assistant Ativo!")
print("Pergunte-me sobre os alimentos salvos no seu JSON. (Digite 'sair' para encerrar)")

while True:
    try:
        user_input = input("\n👤 Você > ")

        if user_input.lower() in exit_conditions:
            print("💪 Treine pesado, coma bem e até a próxima!")
            break

        #O bot busca a resposta no seu banco
        response = chatbot.get_response(user_input)
        print(f"🤖 Bot > {response}")

    except (KeyboardInterrupt, EOFError):
        print("\n💪 Encerrando o assistente. Até logo!")
        break