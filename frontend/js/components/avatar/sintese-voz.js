/**
 * sintese-voz.js — Serviço de texto-para-fala (camada de infraestrutura).
 *
 * Encapsula a Web Speech API. Nenhuma outra parte do código conhece
 * `speechSynthesis`; para trocar por um serviço externo (HeyGen, D-ID,
 * ElevenLabs…) basta reimplementar esta classe mantendo a mesma interface.
 *
 * Interface:
 *   suportado            → boolean
 *   falar(texto, hooks)  → Promise (resolve quando termina ou é interrompida)
 *   parar()
 *   pausar() / retomar()
 *
 * hooks: { aoIniciarTrecho(trecho), aoPalavra(trecho, inicio, fim), aoFim() }
 */

export class SinteseVoz {
    constructor() {
        this.suportado = typeof window !== 'undefined' && 'speechSynthesis' in window;
        this._voz = null;
        this._token = 0; // invalida falas antigas ao chamar parar()

        if (this.suportado) {
            this._escolherVoz();
            // Chrome carrega as vozes de forma assíncrona
            window.speechSynthesis.addEventListener?.('voiceschanged', () => this._escolherVoz());
        }
    }

    /** Prefere vozes pt-BR; vozes "Google"/"Neural"/"Online" soam mais naturais. */
    _escolherVoz() {
        const vozes = window.speechSynthesis.getVoices();
        const ptbr = vozes.filter(v => v.lang?.toLowerCase().replace('_', '-') === 'pt-br');
        const pt = ptbr.length ? ptbr : vozes.filter(v => v.lang?.toLowerCase().startsWith('pt'));
        this._voz =
            pt.find(v => /neural|natural|online/i.test(v.name)) ||
            pt.find(v => /google|luciana|francisca|maria/i.test(v.name)) ||
            pt[0] || null;
    }

    /** Divide em frases: o Chrome interrompe falas longas (~15 s). */
    static dividir(texto) {
        const limpo = texto.replace(/\s+/g, ' ').trim();
        return limpo.match(/[^.!?]+[.!?]*/g)?.map(s => s.trim()).filter(Boolean) ?? [];
    }

    falar(texto, hooks = {}) {
        if (!this.suportado) return Promise.resolve();
        this.parar();
        const token = ++this._token;
        const trechos = SinteseVoz.dividir(texto);

        return new Promise(resolve => {
            let i = 0;
            const proximo = () => {
                if (token !== this._token || i >= trechos.length) {
                    if (token === this._token) hooks.aoFim?.();
                    resolve();
                    return;
                }
                const trecho = trechos[i++];
                const u = new SpeechSynthesisUtterance(trecho);
                u.lang = 'pt-BR';
                if (this._voz) u.voice = this._voz;
                u.rate = 1.0;
                u.pitch = 1.05;
                u.onstart = () => hooks.aoIniciarTrecho?.(trecho);
                u.onboundary = (e) => {
                    if (e.name && e.name !== 'word') return;
                    const inicio = e.charIndex;
                    const m = /\S+/.exec(trecho.slice(inicio));
                    hooks.aoPalavra?.(trecho, inicio, inicio + (m ? m[0].length : 0));
                };
                u.onend = proximo;
                u.onerror = proximo;
                window.speechSynthesis.speak(u);
            };
            proximo();
        });
    }

    parar() {
        if (!this.suportado) return;
        this._token++;
        window.speechSynthesis.cancel();
    }

    pausar()  { if (this.suportado) window.speechSynthesis.pause(); }
    retomar() { if (this.suportado) window.speechSynthesis.resume(); }
}
