/**
 * roteiro.js — Textos falados pelo avatar (camada de conteúdo).
 *
 * Mantido separado da lógica para que o texto possa ser alterado
 * sem tocar em nenhum código de animação ou de voz.
 */

export const NOME_AVATAR = 'Lia';

/** Apresentação oficial do ambiente (texto definido pelo professor). */
export const APRESENTACAO =
    'Este é o ambiente Virtual: Recursos de Interação Educacional Digital ' +
    'Aplicados ao Ensino de Ciências Exatas e às Engenharias e utilização de ' +
    'Inteligência Artificial no Processo Ensino-Aprendizagem. Seja Bem Vindo!';

/** Complemento que deixa explícito o uso de IA no projeto. */
export const TRANSPARENCIA_IA =
    `Eu sou a ${NOME_AVATAR}, um avatar virtual criado com inteligência artificial. ` +
    'Minha voz é gerada por síntese de fala neural, e o Monitor Virtual responde ' +
    'suas dúvidas usando processamento de linguagem natural.';

/** Fala completa da apresentação inicial. */
export const APRESENTACAO_COMPLETA = `${APRESENTACAO} ${TRANSPARENCIA_IA}`;

/** Itens exibidos no painel "Sobre a IA" (transparência para o avaliador). */
export const TECNOLOGIAS_IA = [
    {
        titulo: 'Avatar falante',
        descricao: 'Personagem animado em SVG, sincronizado em tempo real com a fala (boca, sobrancelhas, pescoço e braços).',
    },
    {
        titulo: 'Síntese de voz neural',
        descricao: 'Web Speech API (SpeechSynthesis) do navegador, em português do Brasil, gerada por modelo de IA de texto para fala.',
    },
    {
        titulo: 'Monitor Virtual (NLP)',
        descricao: 'Interpretação das perguntas com spaCy (modelo pt_core_news_md) e similaridade semântica.',
    },
    {
        titulo: 'Acessibilidade',
        descricao: 'Legendas sincronizadas palavra a palavra para quem navega sem som.',
    },
];
