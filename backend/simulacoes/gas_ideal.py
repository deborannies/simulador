"""
Gás ideal monoatômico (PV = nRT) em quatro transformações:
isotérmica, isobárica, isocórica e adiabática.

Unidades: V em litros, P em kPa (kPa·L = J), T em kelvin.
"""
import numpy as np
from fastapi import APIRouter

from ._util import lista

router = APIRouter(prefix="/simulacao", tags=["Termodinâmica"])

R = 8.314
GAMA = 5 / 3


@router.get("/gas-ideal")
def simular_gas_ideal(mols: float = 1.0, temperatura: float = 300.0, volume: float = 20.0,
                      razao: float = 2.0, processo: str = "isotermico"):
    """razao = V_final/V_inicial (ou T_final/T_inicial, no processo isocórico)."""
    if mols <= 0 or temperatura <= 0 or volume <= 0 or razao <= 0:
        return {"erro": "Mols, temperatura, volume e razão devem ser positivos."}

    s = np.linspace(0, 1, 200)                    # progresso da transformação
    if processo == "isocorico":
        V = np.full_like(s, volume)
        T = temperatura * (1 + (razao - 1) * s)
    else:
        V = volume * (1 + (razao - 1) * s)
        if processo == "isotermico":
            T = np.full_like(s, temperatura)
        elif processo == "isobarico":
            T = temperatura * V / volume
        elif processo == "adiabatico":
            T = temperatura * (volume / V) ** (GAMA - 1)
        else:
            return {"erro": "Processo inválido."}

    P = mols * R * T / V
    trabalho = np.concatenate([[0.0], np.cumsum(0.5 * (P[1:] + P[:-1]) * np.diff(V))])

    return {
        "resultados": {
            "tempo": lista(s * 6, 4),             # 6 s de animação
            "volume": lista(V, 4),
            "pressao": lista(P, 4),
            "temperatura": lista(T, 3),
            "trabalho": lista(trabalho, 3),
        }
    }
