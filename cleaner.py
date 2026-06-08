import re

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