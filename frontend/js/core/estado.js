// Guarda, por simulação, os valores dos parâmetros e o histórico do chat.
// Assim, trocar de simulação e voltar não apaga nada (só Reiniciar ou F5).
const memoria = new Map();

export function salvar(idSimulacao, dados) {
    memoria.set(idSimulacao, { ...memoria.get(idSimulacao), ...dados });
}

export function obter(idSimulacao) {
    return memoria.get(idSimulacao) || null;
}

export function limpar(idSimulacao) {
    memoria.delete(idSimulacao);
}
