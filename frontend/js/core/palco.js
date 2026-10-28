// Palco: canvas animado onde a simulação é desenhada.
// Controla o laço de animação, play/pause e o relógio. O desenho em si
// é delegado ao método `desenhar(ctx, cena)` de cada simulação.

export class Palco {
    constructor({ canvas, botaoPlay, iconePausa, iconePlay, rotuloTempo, aoAvancar }) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.iconePausa = iconePausa;
        this.iconePlay = iconePlay;
        this.rotuloTempo = rotuloTempo;
        this.aoAvancar = aoAvancar || (() => {});

        this.sim = null;
        this.parametros = {};
        this.dados = null;
        this.indice = 0;
        this.t = 0;          // tempo físico da simulação (s)
        this.relogio = 0;    // tempo real decorrido (s), para efeitos visuais contínuos
        this.rodando = true;
        this.ultimo = null;

        botaoPlay.addEventListener('click', () => this.alternarPlay());
        requestAnimationFrame((ts) => this.#passo(ts));
    }

    /** Mostra a simulação parada, na configuração inicial dos parâmetros. */
    parar(sim, parametros) {
        this.sim = sim;
        this.parametros = parametros;
        this.dados = null;
        this.indice = 0;
        this.t = 0;
        this.#definirRodando(true);
        this.rotuloTempo.textContent = 't = 0.00 s';
    }

    /** Atualiza os parâmetros mostrados enquanto parado (ex.: usuário digitando). */
    atualizarParametros(parametros) {
        if (!this.dados) this.parametros = parametros;
    }

    /** Recebe os resultados do backend e começa a animar. */
    carregar(dados, parametros) {
        this.dados = dados;
        this.parametros = parametros;
        this.indice = 0;
        this.t = 0;
        this.ultimo = null;
        this.#definirRodando(true);
    }

    alternarPlay() {
        this.#definirRodando(!this.rodando);
    }

    #definirRodando(valor) {
        this.rodando = valor;
        this.ultimo = null;
        this.iconePausa.style.display = valor ? '' : 'none';
        this.iconePlay.style.display = valor ? 'none' : '';
    }

    #passo(ts) {
        requestAnimationFrame((t) => this.#passo(t));
        const dtReal = this.ultimo === null ? 0 : Math.min(0.05, (ts - this.ultimo) / 1000);
        this.ultimo = ts;
        if (this.rodando) this.relogio += dtReal;

        const tempo = this.dados?.tempo;
        if (tempo && tempo.length && this.rodando) {
            const tMax = tempo[tempo.length - 1];
            // `duracao` permite que simulações muito lentas/rápidas toquem num tempo agradável.
            const escala = this.sim.duracao ? tMax / this.sim.duracao : 1;
            this.t += dtReal * escala;
            if (this.t > tMax) { this.t = 0; this.indice = 0; }
            while (this.indice < tempo.length - 1 && tempo[this.indice + 1] <= this.t) this.indice++;
            this.rotuloTempo.textContent = `t = ${this.t.toFixed(this.t < 10 ? 2 : 1)} s`;
            this.aoAvancar(this.indice);
        }

        this.#desenhar(this.rodando ? dtReal : 0);
    }

    #desenhar(dt) {
        if (!this.sim) return;
        const cv = this.canvas;
        const dpr = window.devicePixelRatio || 1;
        const W = cv.clientWidth, H = cv.clientHeight;
        if (cv.width !== W * dpr || cv.height !== H * dpr) { cv.width = W * dpr; cv.height = H * dpr; }
        const ctx = this.ctx;
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        ctx.clearRect(0, 0, W, H);
        this.sim.desenhar(ctx, {
            W, H,
            dados: this.dados,
            i: this.indice,
            t: this.t,
            p: this.parametros,
            relogio: this.relogio,
            dt,
        });
    }
}
