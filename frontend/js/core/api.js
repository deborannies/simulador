// Comunicação com o backend.
// Quando a página é servida pelo FastAPI (http://localhost:8000) usamos a mesma origem.
const BASE = location.protocol.startsWith('http') ? '' : 'http://localhost:8000';

export async function rodarSimulacao(endpoint, parametros) {
    const query = new URLSearchParams(parametros).toString();
    const resposta = await fetch(`${BASE}${endpoint}?${query}`);
    return resposta.json();
}

export async function perguntarTutor(pergunta, simulacao, parametros) {
    const resposta = await fetch(`${BASE}/tutor`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pergunta, simulacao, parametros }),
    });
    return resposta.json();
}
