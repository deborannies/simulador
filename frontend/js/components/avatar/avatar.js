/**
 * avatar.js — Controlador do Avatar falante (camada de aplicação).
 *
 * Orquestra três peças independentes:
 *   SinteseVoz  → fala (infraestrutura)
 *   AvatarView  → desenho e animação (apresentação)
 *   roteiro     → textos (conteúdo)
 *
 * API pública usada pelo app.js:
 *   const avatar = new Avatar();
 *   avatar.apresentar();            // apresentação oficial do ambiente
 *   avatar.falar('texto ou HTML');  // ex.: respostas do Monitor Virtual
 *   avatar.parar();
 */

import { SinteseVoz } from './sintese-voz.js';
import { AvatarView } from './avatar-view.js';
import {
    NOME_AVATAR, APRESENTACAO_COMPLETA, TECNOLOGIAS_IA,
} from './roteiro.js';

const CHAVE_LEITURA_CHAT = 'avatar:ler-respostas';

/** Converte HTML (respostas do tutor) em texto puro para ser falado. */
function htmlParaTexto(html) {
    const d = document.createElement('div');
    d.innerHTML = html;
    return (d.textContent || '').replace(/\s+/g, ' ').trim();
}

export class Avatar {
    constructor() {
        this.voz = new SinteseVoz();
        this._falando = false;
        this._lerRespostas = localStorage.getItem(CHAVE_LEITURA_CHAT) !== '0';

        this._montar();
        this.view = new AvatarView(this.$.palco);
        this._ligarEventos();
        this._atualizarEstado();

        if (!this.voz.suportado) {
            this._legenda('Seu navegador não suporta síntese de voz. Use as legendas abaixo.');
        }
    }

    // ─── API pública ─────────────────────────────────────
    apresentar() {
        this.abrir();
        return this._dizer(APRESENTACAO_COMPLETA);
    }

    /** Fala um texto (aceita HTML). Ignora se o usuário desligou a leitura. */
    falarResposta(html) {
        if (!this._lerRespostas) return Promise.resolve();
        return this.falar(html);
    }

    falar(html) {
        const texto = htmlParaTexto(html);
        if (!texto) return Promise.resolve();
        return this._dizer(texto);
    }

    parar() {
        this.voz.parar();
        this._fimDaFala();
    }

    abrir()  { this.$.raiz.classList.remove('av-minimizado'); this._aria(); }
    fechar() { this.$.raiz.classList.add('av-minimizado');    this._aria(); }

    // ─── Fala ────────────────────────────────────────────
    _dizer(texto) {
        this.abrir();
        this._falando = true;
        this.view.falando(true);
        this._atualizarEstado();

        // Sem voz disponível: mostra legenda e anima por tempo estimado
        if (!this.voz.suportado) return this._simularSemVoz(texto);

        return this.voz.falar(texto, {
            aoIniciarTrecho: (trecho) => this._legenda(trecho),
            aoPalavra: (trecho, ini, fim) => {
                this.view.pulso();
                this._legenda(trecho, ini, fim);
            },
            aoFim: () => this._fimDaFala(),
        });
    }

    _simularSemVoz(texto) {
        const palavras = texto.split(' ');
        return new Promise(resolve => {
            let i = 0;
            const passo = () => {
                if (!this._falando || i >= palavras.length) { this._fimDaFala(); resolve(); return; }
                this.view.pulso();
                this._legenda(palavras.slice(Math.max(0, i - 6), i + 1).join(' '));
                i++;
                setTimeout(passo, 320);
            };
            passo();
        });
    }

    _fimDaFala() {
        this._falando = false;
        this.view.falando(false);
        this._atualizarEstado();
    }

    /** Legenda com destaque da palavra atual (acessibilidade). */
    _legenda(trecho, ini = -1, fim = -1) {
        const esc = (s) => s.replace(/[&<>]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));
        this.$.legenda.innerHTML = ini >= 0
            ? `${esc(trecho.slice(0, ini))}<mark>${esc(trecho.slice(ini, fim))}</mark>${esc(trecho.slice(fim))}`
            : esc(trecho);
    }

    // ─── DOM ─────────────────────────────────────────────
    _montar() {
        const raiz = document.createElement('aside');
        raiz.className = 'av-widget av-minimizado';
        raiz.id = 'avatar-widget';
        raiz.setAttribute('aria-label', `Avatar ${NOME_AVATAR} — assistente virtual`);

        const tecnologias = TECNOLOGIAS_IA
            .map(t => `<li><strong>${t.titulo}</strong><span>${t.descricao}</span></li>`).join('');

        raiz.innerHTML = `
            <button class="av-fab" id="av-btn-abrir" type="button" title="Abrir avatar ${NOME_AVATAR}" aria-label="Abrir avatar ${NOME_AVATAR}">
                <svg class="av-fab-icone" viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="16" y1="3" x2="16" y2="7"/><circle cx="16" cy="3" r="1.4" fill="currentColor"/><rect x="6" y="7" width="20" height="17" rx="6"/><circle cx="12" cy="15" r="1.8" fill="currentColor"/><circle cx="20" cy="15" r="1.8" fill="currentColor"/><path d="M12 20h8"/></svg>
            </button>

            <div class="av-painel" role="dialog" aria-label="Avatar ${NOME_AVATAR}">
                <header class="av-topo">
                    <div class="av-identidade">
                        <span class="av-nome">${NOME_AVATAR}</span>
                        <span class="av-selo">Assistente virtual</span>
                    </div>
                    <div class="av-topo-acoes">
                        <button class="av-icone" id="av-btn-info" type="button" title="Sobre a IA neste projeto" aria-label="Sobre a IA neste projeto">i</button>
                        <button class="av-icone" id="av-btn-fechar" type="button" title="Minimizar" aria-label="Minimizar avatar">–</button>
                    </div>
                </header>

                <div class="av-palco" id="av-palco"></div>
                <div class="av-estado" id="av-estado" aria-live="polite">Pronta para ajudar</div>

                <div class="av-legenda" id="av-legenda" aria-live="polite" aria-label="Legenda"></div>

                <div class="av-controles">
                    <button class="av-btn av-btn-primario" id="av-btn-falar" type="button">
                        <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor"><path d="M3 2.5l10 5.5-10 5.5V2.5z"/></svg>
                        <span>Ouvir apresentação</span>
                    </button>
                    <button class="av-btn" id="av-btn-parar" type="button" title="Parar fala" aria-label="Parar fala">
                        <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor"><rect x="3" y="3" width="10" height="10" rx="1.5"/></svg>
                    </button>
                </div>

                <label class="av-opcao">
                    <input type="checkbox" id="av-chk-chat" ${this._lerRespostas ? 'checked' : ''}>
                    <span>Ler em voz alta as respostas do Monitor Virtual</span>
                </label>

                <div class="av-info" id="av-info" hidden>
                    <div class="av-info-titulo">Inteligência Artificial neste projeto</div>
                    <ul>${tecnologias}</ul>
                </div>
            </div>`;

        document.body.appendChild(raiz);

        this.$ = {
            raiz,
            palco: raiz.querySelector('#av-palco'),
            legenda: raiz.querySelector('#av-legenda'),
            estado: raiz.querySelector('#av-estado'),
            info: raiz.querySelector('#av-info'),
            btnFalar: raiz.querySelector('#av-btn-falar'),
            btnParar: raiz.querySelector('#av-btn-parar'),
            btnAbrir: raiz.querySelector('#av-btn-abrir'),
            btnFechar: raiz.querySelector('#av-btn-fechar'),
            btnInfo: raiz.querySelector('#av-btn-info'),
            chkChat: raiz.querySelector('#av-chk-chat'),
        };
        this._aria();
    }

    _ligarEventos() {
        const { btnFalar, btnParar, btnAbrir, btnFechar, btnInfo, chkChat, info } = this.$;
        btnFalar.addEventListener('click', () => this.apresentar());
        btnParar.addEventListener('click', () => this.parar());
        btnAbrir.addEventListener('click', () => this.abrir());
        btnFechar.addEventListener('click', () => { this.parar(); this.fechar(); });
        btnInfo.addEventListener('click', () => { info.hidden = !info.hidden; });
        chkChat.addEventListener('change', () => {
            this._lerRespostas = chkChat.checked;
            localStorage.setItem(CHAVE_LEITURA_CHAT, this._lerRespostas ? '1' : '0');
            if (!this._lerRespostas) this.parar();
        });
        // Evita fala "presa" ao recarregar/fechar a aba
        window.addEventListener('beforeunload', () => this.voz.parar());
    }

    _atualizarEstado() {
        const f = this._falando;
        this.$.raiz.classList.toggle('av-falando', f);
        this.$.estado.textContent = f ? 'Falando…' : 'Pronta para ajudar';
        this.$.btnParar.disabled = !f;
    }

    _aria() {
        const min = this.$.raiz.classList.contains('av-minimizado');
        this.$.btnAbrir.setAttribute('aria-expanded', String(!min));
    }
}
