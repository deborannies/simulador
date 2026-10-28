// Utilitários de desenho em canvas compartilhados por todas as simulações.

export const CORES = {
    acento: '#00ff66',
    acentoSuave: 'rgba(0,255,102,0.25)',
    azul: '#3d7bff',
    azulEscuro: '#1f4fd1',
    laranja: '#ff9f43',
    vermelho: '#ff5c5c',
    amarelo: '#ffd166',
    texto: '#f0f0f2',
    textoSuave: '#a0a0ab',
    textoMudo: '#5a5a66',
    estrutura: '#3a3a44',
    metal: '#c8c8d0',
};

export function grade(ctx, W, H, passo = 32) {
    ctx.save();
    ctx.strokeStyle = 'rgba(255,255,255,0.025)';
    ctx.lineWidth = 1;
    for (let x = 0; x < W; x += passo) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); }
    for (let y = 0; y < H; y += passo) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }
    ctx.restore();
}

export function texto(ctx, str, x, y, { cor = CORES.textoSuave, tam = 11, peso = 400, alinhar = 'left', base = 'alphabetic', mono = false } = {}) {
    ctx.save();
    ctx.fillStyle = cor;
    ctx.font = `${peso} ${tam}px ${mono ? "'JetBrains Mono', ui-monospace, monospace" : 'Inter, sans-serif'}`;
    ctx.textAlign = alinhar;
    ctx.textBaseline = base;
    ctx.fillText(str, x, y);
    ctx.restore();
}

export function linhaTracejada(ctx, x1, y1, x2, y2, cor = CORES.acentoSuave, tracos = [6, 6]) {
    ctx.save();
    ctx.strokeStyle = cor;
    ctx.setLineDash(tracos);
    ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
    ctx.restore();
}

export function seta(ctx, x1, y1, x2, y2, cor = CORES.acento, largura = 1.5) {
    const ang = Math.atan2(y2 - y1, x2 - x1);
    ctx.save();
    ctx.strokeStyle = cor; ctx.fillStyle = cor; ctx.lineWidth = largura;
    ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x2, y2);
    ctx.lineTo(x2 - 7 * Math.cos(ang - 0.4), y2 - 7 * Math.sin(ang - 0.4));
    ctx.lineTo(x2 - 7 * Math.cos(ang + 0.4), y2 - 7 * Math.sin(ang + 0.4));
    ctx.fill();
    ctx.restore();
}

/** Suporte fixo (teto) com hachuras. */
export function suporte(ctx, cx, y, largura = 140) {
    ctx.save();
    ctx.fillStyle = CORES.estrutura;
    ctx.fillRect(cx - largura / 2, y - 8, largura, 8);
    ctx.strokeStyle = CORES.estrutura; ctx.lineWidth = 1.5;
    for (let i = -largura / 2; i < largura / 2; i += 10) {
        ctx.beginPath(); ctx.moveTo(cx + i, y - 8); ctx.lineTo(cx + i + 8, y - 16); ctx.stroke();
    }
    ctx.restore();
}

/** Mola em zig-zag vertical entre y1 e y2. */
export function mola(ctx, cx, y1, y2, { voltas = 14, largura = 14, ponta = 12, cor = CORES.metal } = {}) {
    ctx.save();
    ctx.strokeStyle = cor; ctx.lineWidth = 1.8; ctx.lineJoin = 'round';
    ctx.beginPath();
    ctx.moveTo(cx, y1); ctx.lineTo(cx, y1 + ponta);
    const passo = (y2 - ponta - (y1 + ponta)) / voltas;
    for (let i = 0; i < voltas; i++) ctx.lineTo(cx + (i % 2 ? -largura : largura), y1 + ponta + passo * (i + 0.5));
    ctx.lineTo(cx, y2 - ponta); ctx.lineTo(cx, y2);
    ctx.stroke();
    ctx.restore();
}

/** Bloco com gradiente e brilho. */
export function bloco(ctx, x, y, tam, rotulo = 'm') {
    ctx.save();
    const g = ctx.createLinearGradient(x, y, x + tam, y + tam);
    g.addColorStop(0, CORES.azul); g.addColorStop(1, CORES.azulEscuro);
    ctx.shadowColor = 'rgba(61,123,255,0.45)'; ctx.shadowBlur = 24;
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.roundRect(x, y, tam, tam, 6); ctx.fill();
    ctx.restore();
    texto(ctx, rotulo, x + tam / 2, y + tam / 2, { cor: 'rgba(255,255,255,0.9)', tam: 13, peso: 600, alinhar: 'center', base: 'middle' });
}

/** Esfera com brilho. */
export function esfera(ctx, x, y, r, cor = CORES.azul) {
    ctx.save();
    const g = ctx.createRadialGradient(x - r / 3, y - r / 3, r / 6, x, y, r);
    g.addColorStop(0, '#9dbbff'); g.addColorStop(1, cor);
    ctx.shadowColor = 'rgba(61,123,255,0.45)'; ctx.shadowBlur = 20;
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
}

/** Caixinha de leitura (ex.: "P = 120 kPa") desenhada no canvas. */
export function leitura(ctx, x, y, rotulo, valor, cor = CORES.texto) {
    ctx.save();
    ctx.font = "600 13px 'JetBrains Mono', ui-monospace, monospace";
    const w = Math.max(90, ctx.measureText(valor).width + 24);
    ctx.fillStyle = 'rgba(24,24,28,0.85)';
    ctx.strokeStyle = '#2e2e35';
    ctx.beginPath(); ctx.roundRect(x, y, w, 44, 6); ctx.fill(); ctx.stroke();
    ctx.restore();
    texto(ctx, rotulo.toUpperCase(), x + 12, y + 16, { cor: CORES.textoMudo, tam: 9 });
    texto(ctx, valor, x + 12, y + 34, { cor, tam: 13, peso: 600, mono: true });
    return w;
}

/** Cor aproximada de um comprimento de onda visível (nm). */
export function corComprimentoOnda(nm, alfa = 1) {
    let r = 0, g = 0, b = 0;
    if (nm < 440) { r = (440 - nm) / 60; b = 1; }
    else if (nm < 490) { g = (nm - 440) / 50; b = 1; }
    else if (nm < 510) { g = 1; b = (510 - nm) / 20; }
    else if (nm < 580) { r = (nm - 510) / 70; g = 1; }
    else if (nm < 645) { r = 1; g = (645 - nm) / 65; }
    else { r = 1; }
    return `rgba(${Math.round(r * 255)},${Math.round(g * 255)},${Math.round(b * 255)},${alfa})`;
}

/** Mapa de cor frio→quente para temperaturas. */
export function corTemperatura(valor, min, max) {
    const s = Math.max(0, Math.min(1, (valor - min) / ((max - min) || 1)));
    const paradas = [[40, 90, 255], [0, 200, 255], [255, 220, 60], [255, 120, 40], [255, 50, 50]];
    const pos = s * (paradas.length - 1);
    const i = Math.min(paradas.length - 2, Math.floor(pos));
    const f = pos - i;
    const c = paradas[i].map((v, k) => Math.round(v + (paradas[i + 1][k] - v) * f));
    return `rgb(${c[0]},${c[1]},${c[2]})`;
}
