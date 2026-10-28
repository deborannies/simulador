"""
Respostas do Monitor Virtual, organizadas por simulação.

Cada simulação mapeia intenção -> função que recebe os parâmetros atuais (dict)
e devolve o texto. Para ensinar o tutor sobre uma simulação nova, adicione
uma entrada aqui (e, se precisar de intenções novas, em nlp_engine.py).
"""

RESPOSTA_PADRAO = (
    "Interessante! Tente fazer perguntas variadas sobre o que acontece "
    "se alterarmos os parâmetros da simulação."
)

_MASSA_MOLA = {
    "aumentar_massa": lambda p: f"Ao aumentar a massa (atualmente {p.get('massa')}kg), mexemos na inércia. Uma massa maior faz o bloco demorar mais para mudar de direção, deixando as oscilações mais longas e lentas.",
    "diminuir_massa": lambda p: f"Se diminuirmos a massa (atualmente {p.get('massa')}kg), o bloco ganha menos inércia. Ele vai responder mais rápido à força da mola, fazendo o sistema oscilar mais rapidamente.",
    "aumentar_k": lambda p: f"A constante k (atualmente {p.get('k')}) define a rigidez da mola. Se você aumentar esse valor, a mola fica mais dura, puxando o bloco com mais força e acelerando o movimento.",
    "diminuir_k": lambda p: f"Diminuindo a constante k (atualmente {p.get('k')}), a mola fica mais 'frouxa'. A força restauradora é menor, então o bloco vai oscilar de forma mais lenta.",
    "aumentar_amortecimento": lambda p: f"O amortecimento 'c' (agora em {p.get('c')}) rouba energia do sistema. Se você aumentá-lo, o gráfico vai 'achatar' e o bloco vai parar mais rápido em direção ao zero.",
    "diminuir_amortecimento": lambda p: f"Diminuindo o amortecimento 'c' (agora em {p.get('c')}), você reduz o atrito. Isso significa que o sistema perde menos energia e o bloco vai continuar balançando por muito mais tempo antes de parar!",
}

RESPOSTAS = {
    "oscilador-simples": _MASSA_MOLA,
    "oscilador-amortecido": _MASSA_MOLA,
}


def responder(simulacao: str, intencao: str, parametros: dict) -> str:
    gerador = RESPOSTAS.get(simulacao, {}).get(intencao)
    return gerador(parametros) if gerador else RESPOSTA_PADRAO
