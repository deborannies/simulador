# Laboratório Virtual Interativo

Simulações interativas de física com monitor de IA.

## Rodar localmente

```bash
python -m venv .venv
source .venv/bin/activate        # Linux/Mac
# .venv\Scripts\activate         # Windows

pip install -r requirements.txt
uvicorn backend.main:app --reload --port 8000
```

Abrir **http://localhost:8000** no navegador.

## Estrutura

```
simulador/
├── backend/
│   ├── main.py                  # Ponto de entrada FastAPI
│   ├── simulacoes/              # Um módulo por experimento
│   └── tutor/                   # Monitor de IA
├── frontend/
│   ├── index.html
│   ├── css/
│   └── js/
│       ├── app.js               # Orquestrador
│       ├── core/                # Engine reutilizável
│       └── simulacoes/          # Um módulo por experimento
├── requirements.txt
└── Procfile
```
