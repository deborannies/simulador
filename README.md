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

## Avatar falante (Lia) — uso de Inteligência Artificial

Avatar animado que apresenta o ambiente por voz e legenda, com gestos
sincronizados à fala (boca, sobrancelhas, pescoço e braços).

| Camada | Arquivo | Responsabilidade |
|---|---|---|
| Conteúdo | `frontend/js/components/avatar/roteiro.js` | Textos falados e lista de tecnologias de IA |
| Infraestrutura | `frontend/js/components/avatar/sintese-voz.js` | Texto-para-fala (Web Speech API, pt-BR) |
| Apresentação | `frontend/js/components/avatar/avatar-view.js` | Robô SVG e animação |
| Aplicação | `frontend/js/components/avatar/avatar.js` | Orquestra voz, animação, legendas e painel "Sobre a IA" |
| Estilo | `frontend/css/avatar.css` | Visual do componente |

- Painel *Sobre a IA* (botão "i") com as tecnologias usadas no projeto.
- Legendas palavra a palavra (acessibilidade) e respeito a `prefers-reduced-motion`.
- O avatar também lê em voz alta as respostas do Monitor Virtual (opcional).
- Para trocar o provedor de voz (HeyGen, D-ID, ElevenLabs…), basta reimplementar `SinteseVoz`.
