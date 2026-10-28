import { grade, texto, esfera, leitura, seta, CORES } from '../core/desenho.js';

export default {
    id: 'gas-ideal',
    titulo: 'Gás Ideal (PV = nRT)',
    categoria: 'Termodinâmica',
    endpoint: '/simulacao/gas-ideal',
    duracao: 6,

    parametros: [
        { id: 'mols',        rotulo: 'Quantidade (n)',    unidade: 'mol', padrao: 1,    passo: 0.1, min: 0.1, max: 10 },
        { id: 'temperatura', rotulo: 'Temperatura Inicial',unidade: 'K',  padrao: 300,  passo: 10,  min: 10, max: 2000 },
        { id: 'volume',      rotulo: 'Volume Inicial',    unidade: 'L',   padrao: 20,   passo: 1,   min: 1, max: 200 },
        { id: 'razao',       rotulo: 'Razão V_f / V_i',  unidade: '',    padrao: 2,    passo: 0.1, min: 0.1, max: 10 },
        { id: 'processo',    rotulo: 'Processo',          unidade: '',    padrao: 'isotermico', tipo: 'select',
          opcoes: [
            { valor: 'isotermico',  rotulo: 'Isotérmico (T = cte)' },
            { valor: 'isobarico',   rotulo: 'Isobárico (P = cte)' },
            { valor: 'isocorico',   rotulo: 'Isocórico (V = cte)' },
            { valor: 'adiabatico',  rotulo: 'Adiabático (Q = 0)' },
          ] },
    ],

    paramsExtras: () => ({}),

    grafico: {
        titulo: 'Diagrama P-V',
        x: 'volume', rotuloX: 'V (L)', rotuloY: 'P (Pa)',
        series: [{ chave: 'pressao', rotulo: 'P(V)', cor: CORES.laranja }],
        cursor: 'ponto',
    },

    msgInicial: 'A <strong>Lei dos Gases Ideais</strong> PV = nRT relaciona pressão, volume e temperatura. Cada processo termodinâmico mantém uma grandeza constante.',
    dica: 'Dica: o trabalho realizado pelo gás é a área sob a curva no diagrama P-V. Compare os processos e veja qual realiza mais trabalho.',

    desenhar(ctx, { W, H, dados, i, p }) {
        grade(ctx, W, H);
        const cx = W * 0.55, cy = H / 2;
        // Êmbolo representando o volume
        const vRel = dados ? (dados.volume[i] - dados.volume[0]) / Math.max((dados.volume[dados.volume.length - 1] - dados.volume[0]), 0.001) : 0.5;
        const cilW = 180, cilH = 120;
        const xCil = cx - cilW / 2, yCil = cy - cilH / 2;
        const pistX = xCil + 16 + vRel * (cilW - 80);

        // Cilindro
        ctx.save();
        ctx.strokeStyle = '#444450'; ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(xCil, yCil); ctx.lineTo(xCil, yCil + cilH);    // parede esq
        ctx.moveTo(xCil, yCil); ctx.lineTo(xCil + cilW, yCil);     // topo
        ctx.moveTo(xCil, yCil + cilH); ctx.lineTo(xCil + cilW, yCil + cilH); // base
        ctx.stroke();
        ctx.restore();

        // Gás (gradiente P→cor)
        const pAtual = dados ? dados.pressao[i] : 0;
        const pMin = dados ? Math.min(...dados.pressao) : 0;
        const pMax = dados ? Math.max(...dados.pressao) : 1;
        const calor = (pAtual - pMin) / ((pMax - pMin) || 1);
        const gc = ctx.createLinearGradient(xCil + 16, 0, pistX, 0);
        gc.addColorStop(0, `rgba(61,123,255,${0.15 + calor * 0.35})`);
        gc.addColorStop(1, `rgba(255,100,60,${0.1 + calor * 0.35})`);
        ctx.save();
        ctx.fillStyle = gc;
        ctx.fillRect(xCil + 2, yCil + 2, pistX - xCil - 2, cilH - 4);
        ctx.restore();

        // Êmbolo
        ctx.save();
        ctx.fillStyle = CORES.estrutura; ctx.strokeStyle = CORES.metal; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.roundRect(pistX, yCil + 4, 18, cilH - 8, 3); ctx.fill(); ctx.stroke();
        ctx.restore();

        // Seta de pressão
        if (dados) {
            seta(ctx, pistX + 28, cy, pistX + 28 + calor * 24, cy, CORES.laranja, 2);
            texto(ctx, `P = ${pAtual.toFixed(0)} Pa`, pistX + 56, cy + 4, { cor: CORES.laranja, tam: 10, mono: true });
        }

        // Leituras em caixinhas
        if (dados) {
            const V = dados.volume[i].toFixed(2);
            const T = dados.temperatura[i].toFixed(0);
            const W_ = dados.trabalho[i].toFixed(1);
            let xr = 16;
            xr += leitura(ctx, xr, 16, 'V', `${V} L`, CORES.textoSuave) + 10;
            xr += leitura(ctx, xr, 16, 'T', `${T} K`, CORES.amarelo) + 10;
            leitura(ctx, xr, 16, 'W', `${W_} J`, CORES.acento);
        }
    },
};
