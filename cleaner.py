import re

def limpar_texto_usuario(texto_bruto):
    """
    [COLEGA 2] Crie suas funções de limpeza de texto aqui (remover emojis, links, etc).
    """
    if not texto_bruto: return ""
    texto_limpo = texto_bruto.lower().strip()
    texto_limpo = re.sub(r'http\S+', '', texto_limpo) # Exemplo: remove links
    return texto_limpo

if __name__ == "__main__":
    teste = "Olha esse site http://google.com com macros!!!"
    print("Texto limpo:", limpar_texto_usuario(teste))