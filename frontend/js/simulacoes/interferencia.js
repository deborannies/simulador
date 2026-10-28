import { grade, texto, linhaTracejada, CORES, corComprimentoOnda } from '../core/desenho.js';

export default {
    id: 'interferencia',
    titulo: 'Interferência em Fenda Dupla',
    categoria: 'Óptica',
    endpoint: '/simulacao/interferencia',
    duracao: null,  // simulação estática

    parametros: [
        { id: 'comprimento_onda', rotulo: 'Compr. de Onda (λ)', unidade: 'nm', padrao: 550, passo: 10, min: 380, max: 750 },
        { id: 'separacao',        rotulo: 'Separação das Fendas', unidade: 'mm', padrao: 0.25, passo: 0.05, min: 0.05, max: 2 },
        { id: 'largura_fenda',    rotulo: 'Largura da Fenda',    unidade: 'mm', padrao: 0.05, passo: 0.01, min: 0.01, max: 0.5 },
        { id: 'distancia',        rotulo: 'Distância ao Anteparo', unidade: 'm', padrao: 1.0, passo: 0.1, min: 0.1, max: 5 },
    ],

    paramsExtras: () => ({}),

    grafico: {
        titulo: 'Intensidade vs. Posição no Anteparo',
        x: 'posicao', rotuloX: 'y (mm)', rotuloY: 'Intensidade',
        series: [{ chave: 'intensidade', rotulo: 'I(y)', cor: '#c0a0ff' }],
        cursor: null,
    },

    msgInicial: 'A <strong>Interferência em Fenda Dupla</strong> (Young) demonstra a natureza ondulatória da luz. Franjas brilhantes = interferência construtiva.',
    dica: 'Dica: diminua λ (violeta < vermelho) e observe as franjas ficarem mais próximas. Aumente a separação d e o mesmo efeito ocorre.',

    desenhar(ctx, { W, H, dados, p }) {
        const nm = p.comprimento_onda ?? 550;
        const cor = corComprimentoOnda(nm, 0.9);
        grade(ctx, W, H);

        /* ── Layout: fonte → barreira → anteparo ── */
        const xFonte   = W * 0.10;
        const xBarrier = W * 0.45;
        const xAnteparo = W * 0.72;
        const barW     = 16;
        const antW     = 20;
        const margV    = 24;

        // Eixo central
        linhaTracejada(ctx, xFonte, H / 2, xAnteparo + antW, H / 2, 'rgba(255,255,255,0.08)', [6, 6]);

        /* ── Fonte de luz ── */
        ctx.save();
        ctx.shadowColor = cor; ctx.shadowBlur = 20;
        ctx.fillStyle = cor;
        ctx.beginPath(); ctx.arc(xFonte, H / 2, 7, 0, Math.PI * 2); ctx.fill();
        ctx.restore();
        texto(ctx, `λ = ${nm} nm`, xFonte - 14, H / 2 - 16, { cor, tam: 10, alinhar: 'center' });

        /* ── Barreira com duas fendas ── */
        const fendaH = 14, fendaSep = 28;
        const f1Top = H / 2 - fendaSep / 2 - fendaH;
        const f1Bot = H / 2 - fendaSep / 2;
        const f2Top = H / 2 + fendaSep / 2;
        const f2Bot = H / 2 + fendaSep / 2 + fendaH;

        // Blocos da barreira acima/abaixo/entre as fendas
        ctx.save();
        ctx.fillStyle = '#444450';
        ctx.fillRect(xBarrier, margV, barW, f1Top - margV);
        ctx.fillRect(xBarrier, f1Bot, barW, f2Top - f1Bot);
        ctx.fillRect(xBarrier, f2Bot, barW, H - margV - f2Bot);
        ctx.restore();

        // Raios saindo das fendas
        if (!dados) {
            ctx.save();
            ctx.strokeStyle = cor; ctx.lineWidth = 1; ctx.globalAlpha = 0.18;
            for (let fi = 0; fi < 2; fi++) {
                const fy = fi === 0 ? (f1Top + f1Bot) / 2 : (f2Top + f2Bot) / 2;
                for (let a = -60; a <= 60; a += 15) {
                    const rad = a * Math.PI / 180;
                    ctx.beginPath();
                    ctx.moveTo(xBarrier + barW, fy);
                    ctx.lineTo(xBarrier + barW + 120 * Math.cos(rad), fy - 120 * Math.sin(rad));
                    ctx.stroke();
                }
            }
            ctx.globalAlpha = 1;
            ctx.restore();
            texto(ctx, 'Clique em Iniciar para calcular', W / 2, H - 18, { cor: CORES.textoMudo, alinhar: 'center' });
            return;
        }

        /* ── Padrão de franjas no anteparo ── */
        const pos = dados.posicao;
        const intens = dados.intensidade;
        const yMin = pos[0], yMax = pos[pos.length - 1];
        const antH = H - margV * 2;

        // Preenchimento do anteparo com as franjas
        for (let j = 0; j < pos.length - 1; j++) {
            const y1 = margV + ((pos[j]     - yMin) / (yMax - yMin)) * antH;
            const y2 = margV + ((pos[j + 1] - yMin) / (yMax - yMin)) * antH;
            ctx.save();
            ctx.globalAlpha = intens[j];
            ctx.fillStyle = cor;
            ctx.fillRect(xAnteparo, y1, antW, y2 - y1 + 1);
            ctx.restore();
        }

        // Borda do anteparo
        ctx.save(); ctx.strokeStyle = '#555560'; ctx.lineWidth = 1;
        ctx.strokeRect(xAnteparo, margV, antW, antH);
        ctx.restore();

        // Marcador central no anteparo
        linhaTracejada(ctx, xAnteparo - 6, H / 2, xAnteparo, H / 2, 'rgba(255,255,255,0.25)');
        texto(ctx, 'y=0', xAnteparo - 32, H / 2 + 3, { cor: CORES.textoMudo, tam: 9 });

        // Espaçamento das franjas (legenda)
        const dy = dados.espacamento_franjas.toFixed(2);
        texto(ctx, `Δy = ${dy} mm`, xAnteparo + antW / 2, H - 10, { cor: CORES.textoMudo, alinhar: 'center', tam: 10 });

        /* ── Haz de difração animado ── */
        ctx.save();
        ctx.strokeStyle = cor; ctx.lineWidth = 1; ctx.globalAlpha = 0.12;
        for (let fi = 0; fi < 2; fi++) {
            const fy = fi === 0 ? (f1Top + f1Bot) / 2 : (f2Top + f2Bot) / 2;
            ctx.beginPath();
            ctx.moveTo(xBarrier + barW, fy);
            ctx.lineTo(xAnteparo, margV);
            ctx.moveTo(xBarrier + barW, fy);
            ctx.lineTo(xAnteparo, H - margV);
            ctx.stroke();
        }
        ctx.restore();
    },
};
