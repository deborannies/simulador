import { grade, texto, leitura, CORES } from '../core/desenho.js';

export default {
    id: 'circuito-rc',
    titulo: 'Circuito RC',
    categoria: 'Eletromagnetismo',
    endpoint: '/simulacao/circuito-rc',
    duracao: 8,

    parametros: [
        { id: 'tensao',       rotulo: 'Tensão (V)',        unidade: 'V',  padrao: 12,    passo: 1,  min: 1,   max: 100 },
        { id: 'resistencia',  rotulo: 'Resistência (R)',    unidade: 'kΩ', padrao: 10,    passo: 1,  min: 0.1, max: 100 },
        { id: 'capacitancia', rotulo: 'Capacitância (C)',   unidade: 'µF', padrao: 100,   passo: 10, min: 1,   max: 10000 },
        { id: 'modo',         rotulo: 'Modo', unidade: '', padrao: 'carga', tipo: 'select',
          opcoes: [{ valor: 'carga', rotulo: 'Carga' }, { valor: 'descarga', rotulo: 'Descarga' }] },
    ],

    paramsExtras: () => ({}),

    grafico: {
        titulo: 'Tensão no Capacitor e Corrente vs. Tempo',
        x: 'tempo', rotuloX: 't (s)', rotuloY: 'Vc (V)', rotuloY2: 'i (mA)',
        series: [
            { chave: 'tensao_capacitor', rotulo: 'Vc (V)',  cor: CORES.amarelo },
            { chave: 'corrente',         rotulo: 'i (mA)',   cor: CORES.azul, eixo: 'y2' },
        ],
        cursor: 'tempo',
    },

    msgInicial: 'No <strong>Circuito RC</strong>, o capacitor carrega (ou descarrega) seguindo uma exponencial com constante de tempo τ = R·C.',
    dica: 'Dica: após 5τ o capacitor está a ~99% da tensão final. Meça τ no gráfico como o tempo para atingir ~63% da tensão.',

    desenhar(ctx, { W, H, dados, i, p }) {
        grade(ctx, W, H);

        const V  = p.tensao       ?? 12;
        const R  = p.resistencia  ?? 10;
        const C  = p.capacitancia ?? 100;
        const modo = p.modo ?? 'carga';

        // Nível de carga atual (0..1)
        let cargaRel = modo === 'carga' ? 0 : 1;
        let vcAtual = 0, iAtual = 0, tau = (R * 1e3 * C * 1e-6);
        if (dados) {
            vcAtual  = dados.tensao_capacitor[i];
            iAtual   = dados.corrente[i] * 1000;          // mA
            cargaRel = Math.abs(vcAtual / (V || 1));
        }

        /* ── Layout ── */
        const cx = W / 2, cy = H / 2 - 20;
        const fioH = 90, fioV = 70;   // comprimento dos fios H e V
        // Nós do circuito (retângulo)
        const nTL = { x: cx - fioH, y: cy - fioV };   // top-left
        const nTR = { x: cx + fioH, y: cy - fioV };   // top-right
        const nBL = { x: cx - fioH, y: cy + fioV };   // bottom-left
        const nBR = { x: cx + fioH, y: cy + fioV };   // bottom-right

        function fio(x1, y1, x2, y2, cor = '#555560') {
            ctx.save(); ctx.strokeStyle = cor; ctx.lineWidth = 2;
            ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke(); ctx.restore();
        }

        /* ── Fios do circuito ── */
        fio(nTL.x, nTL.y, nTR.x, nTR.y);   // topo
        fio(nBL.x, nBL.y, nBR.x, nBR.y);   // base
        // Lado esquerdo: bateria
        const batH = 22, batW = 6;
        const batCy = cy;
        fio(nTL.x, nTL.y, nTL.x, batCy - batH);
        fio(nBL.x, nBL.y, nBL.x, batCy + batH);
        // bateria
        const batCx = nTL.x;
        ctx.save();
        ctx.strokeStyle = CORES.acento; ctx.lineWidth = 2.5;
        ctx.beginPath(); ctx.moveTo(batCx - 14, batCy - batH); ctx.lineTo(batCx + 14, batCy - batH); ctx.stroke();
        ctx.lineWidth = 1.2;
        ctx.beginPath(); ctx.moveTo(batCx - 8,  batCy + batH); ctx.lineTo(batCx + 8,  batCy + batH); ctx.stroke();
        ctx.restore();
        // +/- labels
        texto(ctx, '+', batCx + 18, batCy - batH + 3, { cor: CORES.acento, tam: 12, peso: 700 });
        texto(ctx, '−', batCx + 18, batCy + batH + 4, { cor: CORES.textoMudo, tam: 14 });
        texto(ctx, `${V} V`, batCx + 20, batCy, { cor: CORES.acento, tam: 10, mono: true });

        /* ── Lado direito: R (topo) + C (base) ── */
        // Resistor (topo direito): nTR → nTR + (0, fioV)  meio
        const rY1 = nTR.y, rY2 = cy;
        const rMidY = (rY1 + rY2) / 2, rW = 18, rH = 32;
        fio(nTR.x, rY1, nTR.x, rMidY - rH / 2);
        fio(nTR.x, rMidY + rH / 2, nTR.x, rY2);
        ctx.save();
        ctx.strokeStyle = CORES.laranja; ctx.lineWidth = 2;
        ctx.strokeRect(nTR.x - rW, rMidY - rH / 2, rW * 2, rH);
        ctx.restore();
        texto(ctx, 'R', nTR.x + rW + 8, rMidY, { cor: CORES.laranja, base: 'middle' });
        texto(ctx, `${R} kΩ`, nTR.x + rW + 8, rMidY + 14, { cor: CORES.textoMudo, tam: 9, mono: true });

        // Capacitor (base direita): cy → nBR
        const cY1 = cy, cY2 = nBR.y;
        const cMidY = (cY1 + cY2) / 2, cGap = 6, cPlW = 20, cPlH = 4;
        fio(nTR.x, cY1, nTR.x, cMidY - cGap);
        fio(nTR.x, cMidY + cGap, nTR.x, cY2);

        // Placas do capacitor
        ctx.save();
        ctx.strokeStyle = CORES.amarelo; ctx.lineWidth = cPlH;
        ctx.beginPath(); ctx.moveTo(nTR.x - cPlW, cMidY - cGap); ctx.lineTo(nTR.x + cPlW, cMidY - cGap); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(nTR.x - cPlW, cMidY + cGap); ctx.lineTo(nTR.x + cPlW, cMidY + cGap); ctx.stroke();
        ctx.restore();

        // Carga armazenada (preenchimento azul entre as placas)
        const maxFill = cGap - 2;
        const fillH = cargaRel * maxFill;
        ctx.save();
        ctx.globalAlpha = 0.55;
        ctx.fillStyle = modo === 'carga'
            ? `hsl(${220 + cargaRel * 40}, 80%, 55%)`
            : `hsl(${220 + cargaRel * 40}, 80%, 55%)`;
        // placa inferior preenchida de baixo para cima
        ctx.fillRect(nTR.x - cPlW + 3, cMidY + cGap - fillH - 2, (cPlW - 3) * 2, fillH + 2);
        ctx.globalAlpha = 1;
        ctx.restore();

        texto(ctx, 'C', nTR.x + cPlW + 8, cMidY, { cor: CORES.amarelo, base: 'middle' });
        texto(ctx, `${C} µF`, nTR.x + cPlW + 8, cMidY + 14, { cor: CORES.textoMudo, tam: 9, mono: true });

        /* ── Partículas de corrente ── */
        if (dados && Math.abs(iAtual) > 0.01) {
            const velocidade = Math.abs(iAtual) / 20;   // 0..1
            const t = Date.now() / 800;
            const pontos = [
                { de: nTL, ate: nTR, dir: 'h' },
                { de: nBR, ate: nBL, dir: 'h' },
                { de: nTR, ate: { x: nTR.x, y: cy }, dir: 'v' },
            ];
            for (const seg of pontos) {
                const dt = (t * velocidade) % 1;
                for (let k = 0; k < 3; k++) {
                    const frac = (dt + k / 3) % 1;
                    const px = seg.de.x + (seg.ate.x - seg.de.x) * frac;
                    const py = seg.de.y + (seg.ate.y - seg.de.y) * frac;
                    ctx.save(); ctx.fillStyle = CORES.acento; ctx.globalAlpha = 0.7;
                    ctx.beginPath(); ctx.arc(px, py, 3, 0, Math.PI * 2); ctx.fill();
                    ctx.restore();
                }
            }
        }

        /* ── Leituras ── */
        const vcStr = dados ? vcAtual.toFixed(2)          : '—';
        const iStr  = dados ? Math.abs(iAtual).toFixed(2) : '—';
        const tauMs = (tau * 1000).toFixed(1);
        let xr = 14;
        xr += leitura(ctx, xr, 14, 'Vc', `${vcStr} V`,  CORES.amarelo) + 8;
        xr += leitura(ctx, xr, 14, '|i|', `${iStr} mA`, CORES.azul) + 8;
        leitura(ctx, xr, 14, 'τ', `${tauMs} ms`, CORES.textoSuave);
    },
};
