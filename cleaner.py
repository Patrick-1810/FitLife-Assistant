import re
import json
import os

def limpar_texto_usuario(texto_bruto):
    if not texto_bruto:
        return ""

    # Converte para minúsculas e remove espaços inúteis nas pontas
    texto_limpo = texto_bruto.lower().strip()

    # Remove Links/URLs
    texto_limpo = re.sub(r'https?://\S+|www\.\S+', '', texto_limpo)

    # Remove Timestamps/Datas
    texto_limpo = re.sub(r'\[?\d{2}/\d{2}/\d{4}\s\d{2}:\d{2}(:\d{2})?\]?', '', texto_limpo)
    texto_limpo = re.sub(r'\b\d{2}:\d{2}\b\s*(-)?', '', texto_limpo)

    # Remove Nomes de usuários/Tags comuns de chat
    texto_limpo = re.sub(r'(^|\s)[\w\d_]+:', '', texto_limpo)
    texto_limpo = re.sub(r'@\w+', '', texto_limpo)

    # Mantém apenas letras, números, espaços e pontuações básicas
    # Remove emojis e outros caracteres especiais sem engolir os espaços
    texto_limpo = re.sub(r'[^a-zA-Z0-9áéíóúâêôçãõàíÁÉÍÓÚÂÊÔÇÃÕÀÍ\s!?,.]', '', texto_limpo)

    # Limpa espaços múltiplos que sobraram e pontuações isoladas no início
    texto_limpo = re.sub(r'\s+', ' ', texto_limpo).strip()
    texto_limpo = re.sub(r'^[,.\s!]+', '',
                         texto_limpo)

    return texto_limpo

def salvar_no_json(novos_dialogos, caminho_json="alimentos.json"):
    dados_existentes = []

    if os.path.exists(caminho_json) and os.path.getsize(caminho_json) > 0:
        try:
            with open(caminho_json, 'r', encoding='utf-8') as f:
                dados_existentes = json.load(f)
                if not isinstance(dados_existentes, list):
                    dados_existentes = [dados_existentes]
        except json.JSONDecodeError:
            dados_existentes = []

    dialogos_validos = [d for d in novos_dialogos if d]

    for dialogo in dialogos_validos:
        dados_existentes.append(dialogo)

    with open(caminho_json, 'w', encoding='utf-8') as f:
        json.dump(dados_existentes, f, ensure_ascii=False, indent=4)

    print(f"Sucesso! {len(dialogos_validos)} novos diálogos limpos foram adicionados ao {caminho_json}.\n")


if __name__ == "__main__":
    dialogos_brutos = [
        "Nutri: Olha esse site http://google.com com macros top!!! 👍",
        "[08/06/2026 13:30] Maromba2000: @Nutri, o que posso usar para substituir o arroz?",
        "User123: 14:32 - bati minha meta de água de hj, 3L! 💧💧"
    ]

    print("******* Iniciando a limpeza *******")
    dialogos_limpos = []

    # O loop faz apenas a limpeza e o print visual do terminal
    for texto in dialogos_brutos:
        limpo = limpar_texto_usuario(texto)
        print(f"Bruto: {texto}")
        print(f"Limpo: {limpo}\n")
        dialogos_limpos.append(limpo)

    # Salva todos de uma vez após o término do loop
    salvar_no_json(dialogos_limpos)