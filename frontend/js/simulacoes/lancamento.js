import { grade, texto, esfera, seta, CORES } from '../core/desenho.js';

export default {
    id: 'lancamento',
    titulo: 'Lançamento Oblíquo',
    categoria: 'Mecânica',
    endpoint: '/simulacao/lancamento',
    duracao: 6,

    parametros: [
        { id: 'velocidade', rotulo: 'Velocidade Inicial (v₀)', unidade: 'm/s', padrao: 20, passo: 1, min: 1, max: 100 },
        { id: 'angulo',     rotulo: 'Ângulo (θ)',              unidade: '°',   padrao: 45, passo: 1, min: 1, max: 89 },
        { id: 'altura',     rotulo: 'Altura Inicial (h)',       unidade: 'm',   padrao: 0,  passo: 1, min: 0, max: 50 },
    ],

    paramsExtras: () => ({}),

    grafico: {
        titulo: 'Trajetória: Altura vs. Alcance',
        x: 'x', rotuloX: 'x (m)', rotuloY: 'y (m)',
        series: [{ chave: 'y', rotulo: 'Altura y', cor: CORES.laranja }],
        cursor: 'ponto',
    },

    msgInicial: 'No <strong>Lançamento Oblíquo</strong> a trajetória é uma parábola. O alcance máximo ocorre a 45°, mas a altura máxima depende do componente vertical.',
    dica: 'Dica: θ = 30° e θ = 60° têm o mesmo alcance. Por quê? O que muda?',

    desenhar(ctx, { W, H, dados, i, p }) {
        grade(ctx, W, H);
        const margem = { t: 40, b: 60, l: 60, r: 40 };
        const aw = W - margem.l - margem.r;
        const ah = H - margem.t - margem.b;

        if (!dados) {
            // Mostra seta de velocidade inicial
            const cx = margem.l + aw * 0.12, cy = H - margem.b;
            const ang = (p.angulo ?? 45) * Math.PI / 180;
            seta(ctx, cx, cy, cx + 60 * Math.cos(ang), cy - 60 * Math.sin(ang), CORES.laranja, 2);
            texto(ctx, `v₀ = ${p.velocidade ?? 20} m/s`, cx + 14, cy - 20, { cor: CORES.laranja });
            texto(ctx, `θ = ${p.angulo ?? 45}°`, cx + 14, cy - 6, { cor: CORES.textoSuave });
            return;
        }

        const xMax = Math.max(...dados.x), yMax = Math.max(...dados.y, 1);
        const sx = (v) => margem.l + (v / xMax) * aw;
        const sy = (v) => (H - margem.b) - (v / yMax) * ah;

        // Chão
        ctx.save();
        ctx.strokeStyle = CORES.estrutura; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(margem.l, H - margem.b); ctx.lineTo(W - margem.r, H - margem.b); ctx.stroke();
        ctx.restore();

        // Trajetória
        ctx.save();
        ctx.strokeStyle = 'rgba(255,155,67,0.25)'; ctx.lineWidth = 1.5;
        ctx.beginPath();
        dados.x.forEach((xv, j) => {
            const px = sx(xv), py = sy(dados.y[j]);
            j === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
        });
        ctx.stroke();
        ctx.restore();

        // Projétil atual
        esfera(ctx, sx(dados.x[i]), sy(dados.y[i]), 10, CORES.laranja);

        // Linha de alcance e altura
        texto(ctx, `Alcance: ${dados.alcance} m`, W - margem.r, H - margem.b + 20, { alinhar: 'right', cor: CORES.textoSuave });
        texto(ctx, `Alt. max: ${dados.altura_maxima} m`, margem.l, margem.t - 8, { cor: CORES.textoSuave });
    },
};
