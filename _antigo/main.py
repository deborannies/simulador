from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import numpy as np
from nlp_engine import interpretar_intencao

app = FastAPI(title="API Virtual Lab - Física com Tutor IA")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

class RequisicaoTutor(BaseModel):
    pergunta: str
    massa: float
    k: float
    c: float

@app.get("/simulacao/massa-mola")
def simular_massa_mola(massa: float = 1.0, k: float = 10.0, c: float = 0.5, posicao_inicial: float = 5.0):
    t = np.linspace(0, 20, 500)
    wn = np.sqrt(k / massa)
    zeta = c / (2 * np.sqrt(massa * k))

    if zeta >= 1.0:
        return {"erro": "Amortecimento muito alto para oscilação (Sistema superamortecido). Reduza o valor de 'c'."}
        
    wd = wn * np.sqrt(1 - zeta**2)
    x = posicao_inicial * np.exp(-zeta * wn * t) * np.cos(wd * t)

    return {
        "parametros_recebidos": {"massa": massa, "constante_mola_k": k, "amortecimento_c": c},
        "resultados": {"tempo": t.tolist(), "posicao": x.tolist()}
    }

@app.post("/tutor")
def tutor_inteligente(dados: RequisicaoTutor):
    intencao_detectada = interpretar_intencao(dados.pergunta)

    banco_de_respostas = {
        "aumentar_massa": f"Ao aumentar a massa (atualmente {dados.massa}kg), mexemos na inércia. Uma massa maior faz o bloco demorar mais para mudar de direção, deixando as oscilações mais longas e lentas.",
        "diminuir_massa": f"Se diminuirmos a massa (atualmente {dados.massa}kg), o bloco ganha menos inércia. Ele vai responder mais rápido à força da mola, fazendo o sistema oscilar mais rapidamente.",
        "aumentar_k": f"A constante k (atualmente {dados.k}) define a rigidez da mola. Se você aumentar esse valor, a mola fica mais dura, puxando o bloco com mais força e acelerando o movimento.",
        "diminuir_k": f"Diminuindo a constante k (atualmente {dados.k}), a mola fica mais 'frouxa'. A força restauradora é menor, então o bloco vai oscilar de forma mais lenta.",
        "aumentar_amortecimento": f"O amortecimento 'c' (agora em {dados.c}) rouba energia do sistema. Se você aumentá-lo, o gráfico vai 'achatar' e o bloco vai parar mais rápido em direção ao zero.",
        "diminuir_amortecimento": f"Diminuindo o amortecimento 'c' (agora em {dados.c}), você reduz o atrito. Isso significa que o sistema perde menos energia e o bloco vai continuar balançando por muito mais tempo antes de parar!"
    }

    resposta_padrao = "Interessante! Tente fazer perguntas variadas sobre o que acontece se alterarmos a massa, a força da mola ou o atrito."

    resposta_final = banco_de_respostas.get(intencao_detectada, resposta_padrao)

    return {"resposta": resposta_final}