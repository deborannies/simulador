"""
Interferência em fenda dupla (experimento de Young), com envoltória de difração:
    I(y) = cos²(π·d·y / λL) · sinc²(a·y / λL)
"""
import numpy as np
from fastapi import APIRouter

from ._util import lista

router = APIRouter(prefix="/simulacao", tags=["Óptica"])


@router.get("/interferencia")
def simular_interferencia(comprimento_onda: float = 550.0, separacao: float = 0.25,
                          largura_fenda: float = 0.05, distancia: float = 1.0):
    if not 380 <= comprimento_onda <= 750:
        return {"erro": "Use um comprimento de onda visível (380 a 750 nm)."}
    if largura_fenda <= 0 or separacao <= 0 or distancia <= 0:
        return {"erro": "Separação, largura da fenda e distância devem ser positivas."}
    if largura_fenda >= separacao:
        return {"erro": "A largura de cada fenda deve ser menor que a separação entre elas."}

    lam = comprimento_onda * 1e-9
    d = separacao * 1e-3
    a = largura_fenda * 1e-3
    lim = 2.5 * lam * distancia / a           # ~2,5 lóbulos da difração
    y = np.linspace(-lim, lim, 801)
    intensidade = np.cos(np.pi * d * y / (lam * distancia)) ** 2 * np.sinc(a * y / (lam * distancia)) ** 2

    return {
        "resultados": {
            "posicao": lista(y * 1e3, 4),          # mm
            "intensidade": lista(intensidade, 4),
            "espacamento_franjas": round(lam * distancia / d * 1e3, 4),   # mm
        }
    }
