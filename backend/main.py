"""
Ponto de entrada da API do Virtual Lab.

Rodar (a partir da raiz do projeto):
    uvicorn backend.main:app --reload --port 8000

Depois abrir http://localhost:8000 no navegador — o front-end é servido
pelo próprio FastAPI, então não é preciso abrir o index.html manualmente.
"""
from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from .simulacoes import ROUTERS as ROUTERS_SIMULACAO
from .tutor.router import router as router_tutor

FRONTEND_DIR = Path(__file__).resolve().parent.parent / "frontend"

app = FastAPI(title="API Virtual Lab - Física com Tutor IA")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

for router in ROUTERS_SIMULACAO:
    app.include_router(router)
app.include_router(router_tutor)

# Deve ficar por último: tudo que não for rota da API cai no front-end.
app.mount("/", StaticFiles(directory=FRONTEND_DIR, html=True), name="frontend")
