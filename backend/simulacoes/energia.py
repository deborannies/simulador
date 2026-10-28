"""
Conservação de energia: bloco deslizando numa pista parabólica y = a·x².

Equação de movimento (Lagrange, com atrito viscoso b ao longo da pista):
    (1 + 4a²x²)·x'' + 4a²·x·x'² + 2ga·x = -(b/m)(1 + 4a²x²)·x'
"""
import numpy as np
from fastapi import APIRouter

from ._util import amostrar, lista, rk4

router = APIRouter(prefix="/simulacao", tags=["Mecânica"])


@router.get("/energia")
def simular_energia(massa: float = 1.0, altura: float = 5.0, largura: float = 6.0,
                    atrito: float = 0.0, gravidade: float = 9.81):
    if massa <= 0 or altura <= 0 or largura <= 0:
        return {"erro": "Massa, altura e largura da pista devem ser positivas."}

    a = altura / largura**2

    def derivada(_t, y):
        x, vx = y
        fator = 1 + 4 * a**2 * x**2
        ax = (-4 * a**2 * x * vx**2 - 2 * gravidade * a * x - (atrito / massa) * fator * vx) / fator
        return np.array([vx, ax])

    t, est = rk4(derivada, [largura, 0.0], t_final=15.0, dt=0.002)
    x, vx = est[:, 0], est[:, 1]
    y = a * x**2
    ep = massa * gravidade * y
    ec = 0.5 * massa * (1 + 4 * a**2 * x**2) * vx**2
    t, x, y, ep, ec = amostrar(600, t, x, y, ep, ec)

    return {
        "resultados": {
            "tempo": lista(t),
            "x": lista(x),
            "y": lista(y),
            "energia_potencial": lista(ep, 3),
            "energia_cinetica": lista(ec, 3),
            "energia_mecanica": lista(ep + ec, 3),
            "largura": largura,
            "altura": altura,
        }
    }
