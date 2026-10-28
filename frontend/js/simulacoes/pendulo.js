import { grade, linhaTracejada, texto, esfera, CORES } from '../core/desenho.js';

export default {
    id: 'pendulo',
    titulo: 'Pêndulo Simples',
    categoria: 'Mecânica',
    endpoint: '/simulacao/pendulo',
    duracao: 20,

    parametros: [
        { id: 'comprimento',   rotulo: 'Comprimento (L)',  unidade: 'm',   padrao: 1.0, passo: 0.05, min: 0.1, max: 5 },
        { id: 'angulo_inicial',rotulo: 'Ângulo Inicial (θ)',unidade: '°',   padrao: 30,  passo: 1,    min: -179, max: 179 },
        { id: 'amortecimento', rotulo: 'Amortecimento',    unidade: 's⁻¹', padrao: 0,   passo: 0.05, min: 0, max: 3 },
        { id: 'gravidade',     rotulo: 'Gravidade (g)',    unidade: 'm/s²', padrao: 9.81,passo: 0.1,  min: 0.1, max: 25 },
    ],

    paramsExtras: () => ({}),

    grafico: {
        titulo: 'Ângulo vs. Tempo',
        x: 'tempo', rotuloX: 't (s)', rotuloY: 'θ (°)',
        series: [{ chave: 'angulo', rotulo: 'Ângulo θ', cor: CORES.laranja }],
        cursor: 'tempo',
    },

    msgInicial: 'O <strong>Pêndulo Simples</strong> é não-linear: a equação exata usa sen(θ), não θ. Para pequenos ângulos a aproximação senoidal vale; para θ grande o período aumenta.',
    dica: 'Dica: compare L = 0,25 m (relógio de parede) com L = 1 m. O período escala com √L.',

    desenhar(ctx, { W, H, dados, i, p }) {
        const cx = W / 2, yCentro = H * 0.22;
        const L = p.comprimento ?? 1;
        const escala = Math.min(W, H) * 0.38 / Math.max(L, 0.1);   // px por metro
        const comprPx = L * escala;

        const ang = dados
            ? (dados.angulo[i] * Math.PI / 180)
            : ((p.angulo_inicial ?? 30) * Math.PI / 180);

        const bx = cx + comprPx * Math.sin(ang);
        const by = yCentro + comprPx * Math.cos(ang);

        grade(ctx, W, H);

        // Pivô
        ctx.save();
        ctx.fillStyle = '#3a3a44';
        ctx.beginPath(); ctx.arc(cx, yCentro, 6, 0, Math.PI * 2); ctx.fill();
        ctx.restore();

        // Fio
        ctx.save();
        ctx.strokeStyle = CORES.metal; ctx.lineWidth = 1.8;
        ctx.beginPath(); ctx.moveTo(cx, yCentro); ctx.lineTo(bx, by); ctx.stroke();
        ctx.restore();

        esfera(ctx, bx, by, 18, CORES.azul);

        // Ângulo
        if (Math.abs(ang) > 0.05) {
            ctx.save();
            ctx.strokeStyle = 'rgba(255,155,67,0.4)'; ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.arc(cx, yCentro, 45, Math.PI / 2, Math.PI / 2 + ang, ang < 0);
            ctx.stroke();
            const mid = Math.PI / 2 + ang / 2;
            texto(ctx, `${(ang * 180 / Math.PI).toFixed(1)}°`,
                cx + 52 * Math.cos(mid), yCentro + 52 * Math.sin(mid),
                { cor: CORES.laranja, tam: 10, mono: true });
            ctx.restore();
        }

        // Período teórico (pequenas oscilações)
        if (p.comprimento && p.gravidade) {
            const T = (2 * Math.PI * Math.sqrt(p.comprimento / p.gravidade)).toFixed(3);
            texto(ctx, `T ≈ ${T} s  (aprox. pequenas osc.)`, cx, H - 20,
                { cor: CORES.textoMudo, alinhar: 'center' });
        }
    },
};
