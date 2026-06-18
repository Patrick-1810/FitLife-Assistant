import os
import json
from chatterbot import ChatBot
from chatterbot.trainers import ListTrainer

DATA_DIR = os.path.join(os.path.dirname(__file__), "data")
CORPUS_FILE = os.path.join(DATA_DIR, "alimentos.json")
DB_FILE = os.path.join(os.path.dirname(__file__), "database.sqlite3")


def treinar_bot():
    if os.path.exists(DB_FILE):
        try:
            os.remove(DB_FILE)
            print("Base de dados antigo limpo para evitar conflitos.")
        except PermissionError:
            print("Não foi possível apagar o banco antigo.")

    print("Inicializando o banco de dados e preparando o treinamento...")

    chatbot = ChatBot(
        "NutriBot",
        storage_adapter="chatterbot.storage.SQLStorageAdapter",
        database_uri=f"sqlite:///{DB_FILE}"
    )

    if not os.path.exists(CORPUS_FILE):
        print(f"Erro: Arquivo de treinamento não encontrado em {CORPUS_FILE}")
        return

    #injeta os pares diretamente
    trainer = ListTrainer(chatbot)

    print(f"Carregando dados de: {CORPUS_FILE}")

    # Carrega os dados JSON de forma nativa
    with open(CORPUS_FILE, "r", encoding="utf-8") as f:
        conversas = json.load(f)

    print(f"Injetando {len(conversas)} diálogos de nutrição no banco...")

    # Treina o bot passando cada par [pergunta, resposta]
    for par in conversas:
        trainer.train(par)

    print("\nTreinamento determinístico concluído com sucesso!")
    print("Os dados de nutrição e macros foram indexados perfeitamente no SQLite.")


if __name__ == "__main__":
    treinar_bot()