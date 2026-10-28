"""Endpoint do Monitor Virtual (tutor por similaridade semântica)."""
from fastapi import APIRouter
from pydantic import BaseModel

from .nlp_engine import interpretar_intencao
from .respostas import responder

router = APIRouter(tags=["Tutor IA"])


class RequisicaoTutor(BaseModel):
    pergunta: str
    simulacao: str = "oscilador-amortecido"
    parametros: dict = {}


@router.post("/tutor")
def tutor_inteligente(dados: RequisicaoTutor):
    intencao = interpretar_intencao(dados.pergunta)
    return {"resposta": responder(dados.simulacao, intencao, dados.parametros)}
