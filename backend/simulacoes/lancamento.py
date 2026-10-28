"""Lançamento oblíquo (sem resistência do ar)."""
import numpy as np
from fastapi import APIRouter

from ._util import lista

router = APIRouter(prefix="/simulacao", tags=["Mecânica"])


@router.get("/lancamento")
def simular_lancamento(velocidade: float = 20.0, angulo: float = 45.0,
                       altura: float = 0.0, gravidade: float = 9.81):
    if velocidade <= 0 or gravidade <= 0 or altura < 0:
        return {"erro": "Velocidade e gravidade devem ser positivas e a altura não pode ser negativa."}

    th = np.radians(angulo)
    vx, vy = velocidade * np.cos(th), velocidade * np.sin(th)
    tempo_voo = (vy + np.sqrt(vy**2 + 2 * gravidade * altura)) / gravidade
    if tempo_voo <= 0:
        return {"erro": "Com esses parâmetros o projétil não sai do chão."}

    t = np.linspace(0, tempo_voo, 300)
    x = vx * t
    y = np.maximum(altura + vy * t - 0.5 * gravidade * t**2, 0)

    return {
        "resultados": {
            "tempo": lista(t),
            "x": lista(x),
            "y": lista(y),
            "alcance": round(float(x[-1]), 3),
            "altura_maxima": round(float(altura + max(vy, 0) ** 2 / (2 * gravidade)), 3),
            "tempo_voo": round(float(tempo_voo), 3),
        }
    }
