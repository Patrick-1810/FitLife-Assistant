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
    texto_limpo = re.sub(r'^[\w\d_]+\s*:\s*', '', texto_limpo)
    texto_limpo = re.sub(r'@\w+', '', texto_limpo)

    # Mantém apenas letras, números, espaços e pontuações básicas
    # Remove emojis e outros caracteres especiais sem engolir os espaços
    texto_limpo = re.sub(r'[^a-zA-Z0-9áéíóúâêôçãõàíÁÉÍÓÚÂÊÔÇÃÕÀÍ\s!?,.]', '', texto_limpo)

    # Limpa espaços múltiplos que sobraram e pontuações isoladas no início
    texto_limpo = re.sub(r'\s+', ' ', texto_limpo).strip()
    texto_limpo = re.sub(r'^[,.\s!]+', '', texto_limpo)

    return texto_limpo

def estruturar_dialogos(dialogos_brutos):
    pares_estrurados = []
    pergunta_atual = None

    for linha in dialogos_brutos:
        linha_lowercase = linha.lower()
        e_nutri = "nutri" in linha_lowercase or "nutri :" in linha_lowercase

        linha_limpa = limpar_texto_usuario(linha)

        if not linha_limpa:
            continue

        if not e_nutri:
            pergunta_atual = linha_limpa
        else:
            if pergunta_atual:
                pares_estrurados.append({
                    "pergunta": pergunta_atual,
                    "resposta": linha_limpa,
                })
                pergunta_atual = None
    return pares_estrurados

def salvar_no_json(novos_pares, caminho_json="data/alimentos.json"):
    dados_existentes = []

    os.makedirs(os.path.dirname(caminho_json), exist_ok=True)
    if os.path.exists(caminho_json) and os.path.getsize(caminho_json) > 0:
        try:
            with open(caminho_json, 'r', encoding='utf-8') as f:
                dados_existentes = json.load(f)
                if not isinstance(dados_existentes, list):
                    dados_existentes = [dados_existentes]
        except json.JSONDecodeError:
            dados_existentes = []

    for par in novos_pares:
        dados_existentes.append(par)

    with open(caminho_json, 'w', encoding='utf-8') as f:
        json.dump(dados_existentes, f, ensure_ascii=False, indent=4)

    print(f"Sucesso! {len(novos_pares)} novos diálogos limpos foram adicionados ao {caminho_json}.\n")


if __name__ == "__main__":
    historicoDoChat = [
        "[08/06/2026 13:30] Maromba2000: @Nutri, o que posso usar para substituir o arroz?",
        "Nutri: Olha esse site http://google.com podes usar quinoa ou arroz de couve-flor que têm ótimos macros! 👍",
        "User123: Como faço para bater a minha meta diária de água?",
        "Nutri: Tenta andar sempre com uma garrafa de 1L contigo e bebe um copo logo ao acordar! 💧"
    ]

    print("******* Iniciando a limpeza *******")

    novos_pares = estruturar_dialogos(historicoDoChat)

    for par in novos_pares:
        print(f"P: {par['pergunta']}")
        print(f"R: {par['resposta']}\n")

    salvar_no_json(novos_pares)