"""Sistema massa-mola (oscilador harmônico simples e amortecido)."""
import numpy as np
from fastapi import APIRouter

router = APIRouter(prefix="/simulacao", tags=["Mecânica"])


@router.get("/massa-mola")
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
        "resultados": {"tempo": t.tolist(), "posicao": x.tolist()},
    }
