"""
Condução de calor 1D numa barra (equação do calor), por diferenças finitas explícitas:
    ∂T/∂t = α · ∂²T/∂x²
Extremidades mantidas em temperaturas fixas.
"""
import numpy as np
from fastapi import APIRouter

from ._util import lista

router = APIRouter(prefix="/simulacao", tags=["Termodinâmica"])

N_PONTOS = 51
N_QUADROS = 120


@router.get("/termico")
def simular_termico(comprimento: float = 0.5, difusividade: float = 9.7,
                    temp_quente: float = 100.0, temp_fria: float = 20.0, temp_inicial: float = 20.0):
    """difusividade em 10⁻⁵ m²/s (alumínio ≈ 9,7; cobre ≈ 11,1; aço ≈ 1,2)."""
    if comprimento <= 0 or difusividade <= 0:
        return {"erro": "Comprimento e difusividade devem ser positivos."}

    alpha = difusividade * 1e-5
    x = np.linspace(0, comprimento, N_PONTOS)
    dx = x[1] - x[0]
    dt = 0.4 * dx**2 / alpha                     # critério de estabilidade (< 0,5)
    t_final = 0.6 * comprimento**2 / alpha       # tempo para chegar perto do regime permanente
    n_passos = int(np.ceil(t_final / dt))
    salvar_a_cada = max(1, n_passos // N_QUADROS)

    T = np.full(N_PONTOS, temp_inicial, dtype=float)
    T[0], T[-1] = temp_quente, temp_fria
    r = alpha * dt / dx**2

    tempos, perfis = [0.0], [lista(T, 2)]
    for passo in range(1, n_passos + 1):
        T[1:-1] = T[1:-1] + r * (T[2:] - 2 * T[1:-1] + T[:-2])
        if passo % salvar_a_cada == 0:
            tempos.append(round(passo * dt, 2))
            perfis.append(lista(T, 2))

    return {
        "resultados": {
            "tempo": tempos,             # s
            "x": lista(x * 100, 2),      # cm
            "temperaturas": perfis,      # um perfil T(x) por quadro
        }
    }
