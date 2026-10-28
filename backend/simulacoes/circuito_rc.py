"""Circuito RC: carga e descarga de um capacitor."""
import numpy as np
from fastapi import APIRouter

from ._util import lista

router = APIRouter(prefix="/simulacao", tags=["Eletromagnetismo"])


@router.get("/circuito-rc")
def simular_circuito_rc(tensao: float = 12.0, resistencia: float = 10.0,
                        capacitancia: float = 100.0, modo: str = "carga"):
    """resistencia em kΩ, capacitancia em µF."""
    if tensao <= 0 or resistencia <= 0 or capacitancia <= 0:
        return {"erro": "Tensão, resistência e capacitância devem ser positivas."}
    if modo not in ("carga", "descarga"):
        return {"erro": "Modo deve ser 'carga' ou 'descarga'."}

    tau = resistencia * 1e3 * capacitancia * 1e-6
    t = np.linspace(0, 5 * tau, 400)
    decaimento = np.exp(-t / tau)
    i_max = tensao / resistencia                 # mA (V / kΩ)

    if modo == "carga":
        vc = tensao * (1 - decaimento)
        i = i_max * decaimento
    else:
        vc = tensao * decaimento
        i = -i_max * decaimento

    return {
        "resultados": {
            "tempo": lista(t),
            "tensao_capacitor": lista(vc, 4),
            "corrente": lista(i, 4),
            "tau": round(tau, 5),
            "tensao_fonte": tensao,
        }
    }
