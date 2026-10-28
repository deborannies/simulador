"""Pêndulo simples (não linear, com amortecimento opcional)."""
import numpy as np
from fastapi import APIRouter

from ._util import amostrar, lista, rk4

router = APIRouter(prefix="/simulacao", tags=["Mecânica"])


@router.get("/pendulo")
def simular_pendulo(comprimento: float = 1.0, gravidade: float = 9.81,
                    angulo_inicial: float = 30.0, amortecimento: float = 0.0):
    if comprimento <= 0 or gravidade <= 0:
        return {"erro": "Comprimento e gravidade devem ser positivos."}
    if not -179 <= angulo_inicial <= 179:
        return {"erro": "O ângulo inicial deve estar entre -179° e 179°."}

    def derivada(_t, y):
        theta, omega = y
        return np.array([omega, -(gravidade / comprimento) * np.sin(theta) - amortecimento * omega])

    t, est = rk4(derivada, [np.radians(angulo_inicial), 0.0], t_final=20.0, dt=0.005)
    t, theta = amostrar(600, t, est[:, 0])

    return {
        "resultados": {
            "tempo": lista(t),
            "angulo": lista(np.degrees(theta)),
            "periodo_pequenas_osc": round(2 * np.pi * np.sqrt(comprimento / gravidade), 4),
        }
    }
