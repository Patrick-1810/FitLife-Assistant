# Nome do arquivo: trainer.py
from chatterbot.trainers import ListTrainer
from bot import chatbot

trainer = ListTrainer(chatbot)

conhecimento_inicial = [
    "Como calcular minha meta de água?",
    "O cálculo geral recomendado é de 35ml de água para cada quilo de peso corporal (Peso x 35)."
]

print("Iniciando o treinamento do FitLifeBot...")
trainer.train(conhecimento_inicial)
print("Treinamento inicial concluído com sucesso!")