import { grade, texto, leitura, CORES, corTemperatura } from '../core/desenho.js';

export default {
    id: 'termico',
    titulo: 'Condução de Calor',
    categoria: 'Termodinâmica',
    endpoint: '/simulacao/termico',
    duracao: 8,   // 8 s de animação percorrem todo o processo

    parametros: [
        { id: 'comprimento',   rotulo: 'Comprimento da Barra', unidade: 'm',       padrao: 0.5,  passo: 0.05, min: 0.1, max: 2 },
        { id: 'difusividade',  rotulo: 'Difusividade (α×10⁻⁵)',unidade: 'm²/s',   padrao: 9.7,  passo: 0.1,  min: 0.1, max: 20 },
        { id: 'temp_quente',   rotulo: 'Temperatura Quente',   unidade: '°C',      padrao: 100,  passo: 5,    min: 0, max: 500 },
        { id: 'temp_fria',     rotulo: 'Temperatura Fria',     unidade: '°C',      padrao: 20,   passo: 5,    min: -100, max: 499 },
        { id: 'temp_inicial',  rotulo: 'Temp. Inicial da Barra',unidade: '°C',     padrao: 20,   passo: 5,    min: -100, max: 499 },
    ],

    paramsExtras: () => ({}),

    grafico: {
        titulo: 'Perfil de Temperatura na Barra',
        x: 'x', rotuloX: 'x (cm)', rotuloY: 'T (°C)',
        series: [{ chave: 'temperaturas', rotulo: 'T(x)', cor: CORES.laranja }],
        cursor: null,
        perfil: true,   // cada quadro substitui a curva inteira
    },

    msgInicial: 'A <strong>Equação do Calor</strong> (∂T/∂t = α·∂²T/∂x²) governa como a temperatura se propaga. A difusividade α determina a velocidade do processo.',
    dica: 'Compare alumínio (α ≈ 9,7) com aço (α ≈ 1,2): o aço demora muito mais para atingir o regime permanente.',

    desenhar(ctx, { W, H, dados, i, p }) {
        grade(ctx, W, H);
        const tq = p.temp_quente ?? 100, tf = p.temp_fria ?? 20;
        const tMin = Math.min(tq, tf) - 5, tMax = Math.max(tq, tf) + 5;
        const margem = { t: 20, b: 60, l: 30, r: 30 };
        const barraH = 55, yBarra = H * 0.45;
        const aw = W - margem.l - margem.r;

        if (!dados) {
            // Barra com gradiente simples
            const g = ctx.createLinearGradient(margem.l, 0, margem.l + aw, 0);
            g.addColorStop(0, corTemperatura(tq, tMin, tMax));
            g.addColorStop(1, corTemperatura(tf, tMin, tMax));
            ctx.save(); ctx.fillStyle = g;
            ctx.beginPath(); ctx.roundRect(margem.l, yBarra, aw, barraH, 4); ctx.fill(); ctx.restore();
            texto(ctx, `${tq} °C`, margem.l + 8, yBarra + barraH / 2, { cor: CORES.texto, mono: true });
            texto(ctx, `${tf} °C`, margem.l + aw - 8, yBarra + barraH / 2, { cor: CORES.texto, mono: true, alinhar: 'right' });
            return;
        }

        const perfil = dados.temperaturas[Math.min(i, dados.temperaturas.length - 1)];
        const n = perfil.length;
        const sz = (v) => margem.l + (v / (n - 1)) * aw;
        const tAtual = dados.tempo[Math.min(i, dados.tempo.length - 1)];

        // Barra colorida por temperatura
        for (let j = 0; j < n - 1; j++) {
            const x1 = sz(j), x2 = sz(j + 1);
            const g = ctx.createLinearGradient(x1, 0, x2, 0);
            g.addColorStop(0, corTemperatura(perfil[j], tMin, tMax));
            g.addColorStop(1, corTemperatura(perfil[j + 1], tMin, tMax));
            ctx.fillStyle = g;
            ctx.fillRect(x1, yBarra, x2 - x1 + 1, barraH);
        }

        // Borda
        ctx.save();
        ctx.strokeStyle = '#444450'; ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.roundRect(margem.l, yBarra, aw, barraH, 4); ctx.stroke();
        ctx.restore();

        // Rótulos de temperatura
        texto(ctx, `${tq} °C`, margem.l + 8, yBarra + barraH / 2, { cor: CORES.texto, mono: true, base: 'middle' });
        texto(ctx, `${tf} °C`, margem.l + aw - 8, yBarra + barraH / 2, { cor: CORES.texto, mono: true, alinhar: 'right', base: 'middle' });

        // Temperatura central
        const tCentro = perfil[Math.round(n / 2)].toFixed(1);
        texto(ctx, `T(centro) = ${tCentro} °C   |   t = ${tAtual} s`, W / 2, yBarra + barraH + 22,
            { cor: CORES.textoSuave, alinhar: 'center', mono: true });

        // Régua de comprimento
        ctx.save(); ctx.strokeStyle = '#444450'; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(margem.l, yBarra - 10); ctx.lineTo(margem.l + aw, yBarra - 10); ctx.stroke();
        ctx.restore();
        texto(ctx, `${p.comprimento ?? 0.5} m`, W / 2, yBarra - 14, { cor: CORES.textoMudo, alinhar: 'center', tam: 10 });
    },
};
