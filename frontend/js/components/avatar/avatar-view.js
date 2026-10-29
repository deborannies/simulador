/**
 * avatar-view.js — Camada de apresentação do avatar (SVG + animação).
 *
 * Não conhece voz nem texto: apenas desenha o robô e reage a comandos:
 *   falando(bool)  → liga/desliga gestos de fala
 *   pulso()        → "batida" de sílaba (abre a boca, ergue sobrancelhas)
 *
 * A animação roda em requestAnimationFrame, sem dependências externas.
 */

const SVG = `
<svg class="av-svg" viewBox="0 0 200 240" role="img" aria-label="Avatar robô Lia, gerado por inteligência artificial">
  <defs>
    <linearGradient id="av-g-corpo" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#2a2a33"/><stop offset="1" stop-color="#17171c"/>
    </linearGradient>
    <linearGradient id="av-g-cabeca" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#34343f"/><stop offset="1" stop-color="#1d1d24"/>
    </linearGradient>
    <radialGradient id="av-g-olho" cx=".5" cy=".5" r=".5">
      <stop offset="0" stop-color="#b8ffd6"/><stop offset=".55" stop-color="#00ff66"/><stop offset="1" stop-color="#00a842"/>
    </radialGradient>
    <filter id="av-brilho" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur stdDeviation="2.2" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
  </defs>

  <ellipse class="av-sombra" cx="100" cy="232" rx="52" ry="5" fill="rgba(0,0,0,.45)"/>

  <!-- Tronco + braços (grupo inteiro respira) -->
  <g class="av-tronco">
    <g class="av-braco av-braco-e" data-ombro="62,150">
      <rect x="44" y="148" width="16" height="46" rx="8" fill="url(#av-g-corpo)" stroke="#3b3b48"/>
      <circle cx="52" cy="198" r="9" fill="#2a2a33" stroke="#00ff66" stroke-width="1.5"/>
    </g>
    <g class="av-braco av-braco-d" data-ombro="138,150">
      <rect x="140" y="148" width="16" height="46" rx="8" fill="url(#av-g-corpo)" stroke="#3b3b48"/>
      <circle cx="148" cy="198" r="9" fill="#2a2a33" stroke="#00ff66" stroke-width="1.5"/>
    </g>
    <rect x="58" y="140" width="84" height="76" rx="22" fill="url(#av-g-corpo)" stroke="#3b3b48" stroke-width="1.5"/>
    <rect x="78" y="158" width="44" height="26" rx="8" fill="#0e0e12" stroke="#00ff66" stroke-opacity=".5"/>
    <text x="100" y="176" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="13" font-weight="700" fill="#00ff66" filter="url(#av-brilho)">IA</text>
    <circle cx="86" cy="200" r="3" fill="#00ff66" class="av-led"/>
    <circle cx="100" cy="200" r="3" fill="#00ff66" class="av-led" style="animation-delay:.3s"/>
    <circle cx="114" cy="200" r="3" fill="#00ff66" class="av-led" style="animation-delay:.6s"/>
  </g>

  <!-- Pescoço -->
  <rect x="90" y="124" width="20" height="20" rx="4" fill="#23232b" stroke="#3b3b48"/>

  <!-- Cabeça (inclina em torno do pescoço) -->
  <g class="av-cabeca" data-pivo="100,128">
    <line x1="100" y1="34" x2="100" y2="16" stroke="#5a5a66" stroke-width="3" stroke-linecap="round"/>
    <circle class="av-antena" cx="100" cy="13" r="5" fill="#00ff66" filter="url(#av-brilho)"/>
    <rect x="46" y="34" width="108" height="92" rx="30" fill="url(#av-g-cabeca)" stroke="#3b3b48" stroke-width="1.5"/>
    <rect x="56" y="48" width="88" height="56" rx="22" fill="#0b0b0f" stroke="#00ff66" stroke-opacity=".35"/>
    <rect x="38" y="68" width="8" height="22" rx="4" fill="#2a2a33" stroke="#3b3b48"/>
    <rect x="154" y="68" width="8" height="22" rx="4" fill="#2a2a33" stroke="#3b3b48"/>

    <!-- Sobrancelhas -->
    <g class="av-sobrancelhas" stroke="#00ff66" stroke-width="3.5" stroke-linecap="round" filter="url(#av-brilho)">
      <line class="av-sob av-sob-e" x1="68" y1="60" x2="88" y2="60"/>
      <line class="av-sob av-sob-d" x1="112" y1="60" x2="132" y2="60"/>
    </g>

    <!-- Olhos -->
    <g class="av-olhos">
      <ellipse class="av-olho" cx="78"  cy="76" rx="9" ry="10" fill="url(#av-g-olho)" filter="url(#av-brilho)"/>
      <ellipse class="av-olho" cx="122" cy="76" rx="9" ry="10" fill="url(#av-g-olho)" filter="url(#av-brilho)"/>
    </g>

    <!-- Boca -->
    <g class="av-boca">
      <path class="av-boca-forma" d="M82 94 Q100 100 118 94" fill="#00160a" stroke="#00ff66" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" filter="url(#av-brilho)"/>
    </g>
  </g>
</svg>`;

const clamp = (v, a, b) => Math.min(b, Math.max(a, v));

export class AvatarView {
    /** @param {HTMLElement} raiz  contêiner onde o SVG será inserido */
    constructor(raiz) {
        raiz.innerHTML = SVG;
        this.raiz = raiz;
        const q = (s) => raiz.querySelector(s);

        this.el = {
            tronco: q('.av-tronco'),
            cabeca: q('.av-cabeca'),
            bracoE: q('.av-braco-e'),
            bracoD: q('.av-braco-d'),
            sobE: q('.av-sob-e'),
            sobD: q('.av-sob-d'),
            olhos: raiz.querySelectorAll('.av-olho'),
            boca: q('.av-boca-forma'),
            antena: q('.av-antena'),
        };

        this._falando = false;
        this._energia = 0;          // 0..1, sobe a cada sílaba e decai
        this._boca = 0;             // abertura atual suavizada
        this._piscaAte = 0;
        this._proxPisca = performance.now() + 2500;
        this._t0 = performance.now();
        this._raf = null;
        this._reduzMovimento = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

        this._loop = this._loop.bind(this);
        this._raf = requestAnimationFrame(this._loop);
    }

    falando(ligado) { this._falando = ligado; if (!ligado) this._energia = 0; }

    /** Chamada a cada palavra/sílaba reconhecida pela voz. */
    pulso(intensidade = 1) { this._energia = clamp(this._energia + 0.6 * intensidade, 0, 1); }

    destruir() { cancelAnimationFrame(this._raf); }

    // ─── Loop de animação ────────────────────────────────
    _loop(agora) {
        const t = (agora - this._t0) / 1000;
        const reduz = this._reduzMovimento;
        const f = this._falando;

        // Energia decai suavemente entre as palavras
        this._energia *= 0.9;

        // Abertura da boca: oscilação rápida de "fala" modulada pela energia
        const osc = (Math.sin(t * 18) * 0.5 + 0.5) * (Math.sin(t * 7.3) * 0.5 + 0.5);
        const alvoBoca = f ? clamp(0.18 + osc * 0.45 + this._energia * 0.55, 0, 1) : 0;
        this._boca += (alvoBoca - this._boca) * 0.35;

        // Corpo respira (sempre) e balança mais quando fala
        const respiracao = Math.sin(t * 1.6) * 1.2;
        const gesto = f && !reduz ? 1 : 0;

        // Cabeça: leve balanço + "pescoço" acompanhando a fala
        const incl = (Math.sin(t * 1.3) * 1.2 + (f ? Math.sin(t * 3.1) * 3 + this._energia * 3 : 0)) * (reduz ? 0.3 : 1);
        const gira = (f ? Math.sin(t * 1.9) * 2.2 : Math.sin(t * 0.8) * 1) * (reduz ? 0.3 : 1);
        this.el.cabeca.setAttribute('transform',
            `translate(0 ${respiracao * 0.6 - this._energia * 1.5}) rotate(${incl} 100 128) rotate(${gira} 100 128)`);

        // Sobrancelhas: sobem com a energia (ênfase), com assimetria sutil
        const subir = f ? (this._energia * 7 + Math.sin(t * 2.2) * 1.5) : Math.sin(t * 0.7) * 0.6;
        this.el.sobE.setAttribute('transform', `translate(0 ${-subir}) rotate(${-subir * 0.9} 78 60)`);
        this.el.sobD.setAttribute('transform', `translate(0 ${-subir * 0.8}) rotate(${subir * 0.9} 122 60)`);

        // Boca: curva de sorriso quando parada, elipse aberta ao falar
        const a = this._boca;
        const w = 18 - a * 5;
        const yTopo = 94 - a * 1.5;
        const yBase = 94 + 6 + a * 17;
        this.el.boca.setAttribute('d',
            `M${100 - w} ${yTopo} Q100 ${yTopo + 6 - a * 4} ${100 + w} ${yTopo}` +
            ` Q100 ${yBase + a * 6} ${100 - w} ${yTopo} Z`);

        // Piscar
        if (agora > this._proxPisca) {
            this._piscaAte = agora + 140;
            this._proxPisca = agora + 2500 + Math.random() * 3000;
        }
        const piscando = agora < this._piscaAte;
        this.el.olhos.forEach(o => o.setAttribute('ry', piscando ? 1.2 : 10 - a * 0.8));

        // Braços: gesticulam durante a fala, relaxados em repouso
        const bE = gesto ? -18 + Math.sin(t * 2.4) * 22 - this._energia * 14 : Math.sin(t * 1.6) * 2;
        const bD = gesto ? 18 - Math.sin(t * 2.0 + 1) * 24 + this._energia * 14 : -Math.sin(t * 1.6) * 2;
        this.el.bracoE.setAttribute('transform', `rotate(${bE} 62 152)`);
        this.el.bracoD.setAttribute('transform', `rotate(${bD} 138 152)`);

        this.el.tronco.setAttribute('transform', `translate(0 ${respiracao * 0.4})`);

        // Antena pulsa
        this.el.antena.setAttribute('r', 5 + (f ? 1.5 + this._energia * 2.5 : Math.sin(t * 2) * 0.6));

        this._raf = requestAnimationFrame(this._loop);
    }
}
