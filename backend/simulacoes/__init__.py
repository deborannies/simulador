"""
Registro das simulações.

Para adicionar uma simulação nova:
  1. Crie um módulo nesta pasta com um `router = APIRouter(...)` e o endpoint.
  2. Importe-o abaixo e adicione o router em ROUTERS.
"""
from . import (
    circuito_rc,
    energia,
    gas_ideal,
    interferencia,
    lancamento,
    massa_mola,
    pendulo,
    termico,
)

ROUTERS = [
    massa_mola.router,
    pendulo.router,
    lancamento.router,
    energia.router,
    interferencia.router,
    termico.router,
    circuito_rc.router,
    gas_ideal.router,
]
