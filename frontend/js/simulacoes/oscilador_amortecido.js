import { grade, suporte, mola, bloco, linhaTracejada, texto, seta, CORES } from '../core/desenho.js';

export default {
    id: 'oscilador-amortecido',
    titulo: 'Oscilador Harmônico Amortecido',
    categoria: 'Mecânica',
    endpoint: '/simulacao/massa-mola',
    duracao: 20,

    parametros: [
        { id: 'massa',   rotulo: 'Massa (m)',              unidade: 'kg',   padrao: 2.5, passo: 0.1, min: 0.1, max: 20 },
        { id: 'k',       rotulo: 'Constante Elástica (k)', unidade: 'N/m',  padrao: 15,  passo: 0.5, min: 0.5, max: 100 },
        { id: 'c',       rotulo: 'Amortecimento (b)',       unidade: 'kg/s', padrao: 1.0, passo: 0.05, min: 0, max: 5 },
        { id: 'posicao', rotulo: 'Posição Inicial (x₀)',   unidade: 'm',    padrao: 5,   passo: 0.5, min: -10, max: 10 },
    ],

    paramsExtras: (p) => ({ posicao_inicial: p.posicao }),

    grafico: {
        titulo: 'Posição vs. Tempo (decaimento exponencial)',
        x: 'tempo', rotuloX: 't (s)', rotuloY: 'x (m)',
        series: [{ chave: 'posicao', rotulo: 'Posição', cor: CORES.acento }],
        cursor: 'tempo',
    },

    msgInicial: 'Ao alterar o <span class="insight-highlight">Amortecimento (b)</span>, a amplitude decai exponencialmente. Com b alto o sistema para rapidamente.',
    dica: 'Dica: experimente b = 0,1 (quase sem amortecimento) vs b = 1,5 (para rapidamente). O ζ = b / (2√mk) controla o regime.',

    desenhar(ctx, { W, H, dados, i, p, relogio }) {
        const cx = W / 2, topo = 48;
        const equilibrio = H * 0.48;
        const amp0 = dados ? Math.max(...dados.posicao.map(Math.abs)) || 1 : Math.abs(p.posicao) || 1;
        const x = dados ? dados.posicao[i] : (p.posicao ?? 0);
        const alcance = H * 0.30;
        const desloc = (x / amp0) * alcance;
        const yMassa = equilibrio + desloc;
        const tam = 46;

        grade(ctx, W, H);
        linhaTracejada(ctx, cx - 130, equilibrio, cx + 130, equilibrio, 'rgba(0,255,102,0.22)');
        texto(ctx, 'x = 0', cx + 138, equilibrio + 3, { cor: 'rgba(0,255,102,0.5)' });

        // Envoltória exponencial de decaimento
        if (dados && p.massa && p.k && p.c) {
            const wn = Math.sqrt(p.k / p.massa);
            const zeta = p.c / (2 * Math.sqrt(p.massa * p.k));
            const escala = alcance / amp0;
            ctx.save();
            ctx.strokeStyle = 'rgba(255,180,50,0.3)'; ctx.lineWidth = 1; ctx.setLineDash([4, 6]);
            for (const sinal of [1, -1]) {
                ctx.beginPath();
                let primeiro = true;
                for (let xi = 0; xi < W; xi += 2) {
                    const td = (xi / W) * dados.tempo[dados.tempo.length - 1];
                    const env = amp0 * Math.exp(-zeta * wn * td) * escala;
                    const yd = equilibrio + sinal * env;
                    if (primeiro) { ctx.moveTo(xi, yd); primeiro = false; } else ctx.lineTo(xi, yd);
                }
                ctx.stroke();
            }
            ctx.restore();
        }

        suporte(ctx, cx, topo);
        mola(ctx, cx, topo, yMassa - tam / 2);
        bloco(ctx, cx - tam / 2, yMassa - tam / 2, tam);

        if (Math.abs(desloc) > 6) {
            seta(ctx, cx + tam / 2 + 28, equilibrio, cx + tam / 2 + 28, yMassa - tam / 2 + (desloc > 0 ? tam : 0));
        }
    },
};
