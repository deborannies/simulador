import { grade, texto, esfera, leitura, CORES } from '../core/desenho.js';

export default {
    id: 'energia',
    titulo: 'Conservação de Energia',
    categoria: 'Mecânica',
    endpoint: '/simulacao/energia',
    duracao: 15,

    parametros: [
        { id: 'massa',   rotulo: 'Massa (m)',        unidade: 'kg', padrao: 1.0, passo: 0.1, min: 0.1, max: 10 },
        { id: 'altura',  rotulo: 'Altura da Pista',  unidade: 'm',  padrao: 5.0, passo: 0.5, min: 1, max: 20 },
        { id: 'largura', rotulo: 'Largura da Pista', unidade: 'm',  padrao: 6.0, passo: 0.5, min: 2, max: 15 },
        { id: 'atrito',  rotulo: 'Atrito viscoso',   unidade: '',   padrao: 0,   passo: 0.1, min: 0, max: 3 },
    ],

    paramsExtras: () => ({}),

    grafico: {
        titulo: 'Energia vs. Tempo',
        x: 'tempo', rotuloX: 't (s)', rotuloY: 'E (J)',
        series: [
            { chave: 'energia_potencial', rotulo: 'E. Potencial', cor: CORES.vermelho },
            { chave: 'energia_cinetica',  rotulo: 'E. Cinética',  cor: CORES.azul },
            { chave: 'energia_mecanica',  rotulo: 'E. Mecânica',  cor: CORES.acento, tracejado: true },
        ],
        cursor: 'tempo',
    },

    msgInicial: 'A <strong>Conservação de Energia</strong> mostra como a energia potencial (posição alta) se converte em cinética (velocidade) e vice-versa.',
    dica: 'Dica: com atrito = 0 a energia mecânica total (verde) deve ser constante. Adicione atrito e veja ela cair.',

    desenhar(ctx, { W, H, dados, i }) {
        grade(ctx, W, H);
        const margem = { t: 40, b: 50, l: 50, r: 50 };

        if (!dados) {
            texto(ctx, 'Clique em Iniciar para ver a pista', W / 2, H / 2,
                { cor: CORES.textoMudo, alinhar: 'center' });
            return;
        }

        const xArr = dados.x, yArr = dados.y;
        const xMin = Math.min(...xArr), xMax = Math.max(...xArr);
        const yMin = 0, yMax = Math.max(...yArr) * 1.15;
        const aw = W - margem.l - margem.r, ah = H - margem.t - margem.b;
        const sx = (v) => margem.l + ((v - xMin) / (xMax - xMin)) * aw;
        const sy = (v) => (H - margem.b) - ((v - yMin) / (yMax - yMin)) * ah;

        // Pista parabólica
        ctx.save();
        ctx.strokeStyle = CORES.metal; ctx.lineWidth = 2;
        ctx.beginPath();
        xArr.forEach((xv, j) => { const py = sy(yArr[j]); j === 0 ? ctx.moveTo(sx(xv), py) : ctx.lineTo(sx(xv), py); });
        ctx.stroke();

        // Chão
        ctx.strokeStyle = '#2e2e35'; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(margem.l, H - margem.b); ctx.lineTo(W - margem.r, H - margem.b); ctx.stroke();
        ctx.restore();

        // Bloco
        esfera(ctx, sx(xArr[i]), sy(yArr[i]), 12, CORES.azul);

        // Leituras de energia
        const ep = dados.energia_potencial[i].toFixed(1);
        const ec = dados.energia_cinetica[i].toFixed(1);
        const em = dados.energia_mecanica[i].toFixed(1);
        let xr = 16;
        xr += leitura(ctx, xr, 16, 'Ep', `${ep} J`, CORES.vermelho) + 10;
        xr += leitura(ctx, xr, 16, 'Ec', `${ec} J`, CORES.azul) + 10;
        leitura(ctx, xr, 16, 'Em', `${em} J`, CORES.acento);
    },
};
