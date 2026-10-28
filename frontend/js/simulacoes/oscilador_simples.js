import { grade, suporte, mola, bloco, linhaTracejada, texto, seta, CORES } from '../core/desenho.js';

export default {
    id: 'oscilador-simples',
    titulo: 'Oscilador Harmônico Simples',
    categoria: 'Mecânica',
    endpoint: '/simulacao/massa-mola',
    duracao: 20,   // s de animação para percorrer os dados

    parametros: [
        { id: 'massa',   rotulo: 'Massa (m)',             unidade: 'kg',    padrao: 2.5, passo: 0.1, min: 0.1, max: 20 },
        { id: 'k',       rotulo: 'Constante Elástica (k)',unidade: 'N/m',   padrao: 10,  passo: 0.5, min: 0.5, max: 100 },
        { id: 'posicao', rotulo: 'Posição Inicial (x₀)',  unidade: 'm',     padrao: 5,   passo: 0.5, min: -10, max: 10 },
    ],

    // `c` é sempre 0 – enviado pelo app
    paramsExtras: (p) => ({ c: 0, posicao_inicial: p.posicao }),

    grafico: {
        titulo: 'Posição vs. Tempo',
        x: 'tempo', rotuloX: 't (s)', rotuloY: 'x (m)',
        series: [{ chave: 'posicao', rotulo: 'Posição', cor: CORES.acento }],
        cursor: 'tempo',
    },

    msgInicial: 'No <strong>Oscilador Harmônico Simples</strong>, sem amortecimento, a amplitude permanece constante — a energia se conserva entre cinética e potencial.',
    dica: 'Dica: Ajuste <strong>m</strong> e <strong>k</strong> para ω = 1 rad/s (k/m = 1). O gráfico terá exatamente 1 ciclo por 2π segundos.',

    /** Desenha o palco físico: suporte, mola, bloco, linha de equilíbrio. */
    desenhar(ctx, { W, H, dados, i, p }) {
        const cx = W / 2, topo = 48;
        const equilibrio = H * 0.48;
        const amp = dados ? Math.max(...dados.posicao.map(Math.abs)) || 1 : Math.abs(p.posicao) || 1;
        const x = dados ? dados.posicao[i] : (p.posicao ?? 0);
        const alcance = H * 0.30;
        const desloc = (x / amp) * alcance;
        const yMassa = equilibrio + desloc;
        const tam = 46;

        grade(ctx, W, H);

        // Linha de equilíbrio
        linhaTracejada(ctx, cx - 130, equilibrio, cx + 130, equilibrio, 'rgba(0,255,102,0.22)');
        texto(ctx, 'x = 0', cx + 138, equilibrio + 3, { cor: 'rgba(0,255,102,0.5)' });

        suporte(ctx, cx, topo);
        mola(ctx, cx, topo, yMassa - tam / 2);
        bloco(ctx, cx - tam / 2, yMassa - tam / 2, tam);

        // Seta de deslocamento
        if (Math.abs(desloc) > 6) {
            seta(ctx, cx + tam / 2 + 28, equilibrio, cx + tam / 2 + 28, yMassa - tam / 2 + (desloc > 0 ? tam : 0));
            texto(ctx, `x = ${x.toFixed(2)} m`, cx + tam / 2 + 38, equilibrio + desloc / 2,
                { cor: CORES.acento, tam: 10, mono: true });
        }
    },
};
