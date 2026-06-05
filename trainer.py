import json
from chatterbot.trainers import ListTrainer
from bot import chatbot

trainer = ListTrainer(chatbot)
print("🏋️‍♂️ [COLEGA 1] Carregando dados de alimentos.json...")

try:
    with open('data/alimentos.json', 'r', encoding='utf-8') as f:
        dados = json.load(f)
    for conversa in dados['conversas_treino']:
        trainer.train(conversa)
    print("Treinamento concluído com os dados do JSON!")
except FileNotFoundError:
    print("Erro: Arquivo data/alimentos.json não encontrado.")