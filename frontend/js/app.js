/**
 * app.js — Orquestrador do Virtual Lab
 *
 * Responsabilidades:
 *  - Registra todas as simulações
 *  - Controla qual simulação está ativa
 *  - Renderiza parâmetros dinamicamente no painel direito
 *  - Conecta o palco, o gráfico, a API e o chat
 *  - Preserva estado por simulação (sem reiniciar ao trocar de aba)
 */

import { rodarSimulacao, perguntarTutor } from './core/api.js';
import { salvar, obter, limpar } from './core/estado.js';
import { Palco } from './core/palco.js';
import { Grafico } from './core/grafico.js';
import { Avatar } from './components/avatar/avatar.js';

// ─── Registro de simulações ────────────────────────────────
import OscSimples    from './simulacoes/oscilador_simples.js';
import OscAmortecido from './simulacoes/oscilador_amortecido.js';
import Pendulo       from './simulacoes/pendulo.js';
import Lancamento    from './simulacoes/lancamento.js';
import Energia       from './simulacoes/energia.js';
import Interferencia from './simulacoes/interferencia.js';
import Termico       from './simulacoes/termico.js';
import CircuitoRC    from './simulacoes/circuito_rc.js';
import GasIdeal      from './simulacoes/gas_ideal.js';

const SIMULACOES = [
    OscSimples, OscAmortecido,
    Pendulo, Lancamento, Energia,
    Interferencia,
    Termico, GasIdeal,
    CircuitoRC,
];
const MAPA = Object.fromEntries(SIMULACOES.map(s => [s.id, s]));

// ─── Elementos do DOM ──────────────────────────────────────
const elTitulo      = document.getElementById('page-title');
const elBreadcrumb  = document.getElementById('page-breadcrumb');
const elNav         = document.getElementById('sidebar-nav');
const elParametros  = document.getElementById('params-list');
const elChatBody    = document.getElementById('chatHistorico');
const elDica        = document.getElementById('insight-dica');
const elPerguntaInput = document.getElementById('perguntaInput');
const elBtnEnviar   = document.getElementById('btn-enviar-chat');
const elBtnIniciar  = document.getElementById('btn-iniciar-sim');
const elBtnReiniciar= document.getElementById('btn-reiniciar');

// ─── Palco e Gráfico ───────────────────────────────────────
const palco = new Palco({
    canvas:       document.getElementById('canvasSim'),
    botaoPlay:    document.getElementById('btn-play'),
    iconePausa:   document.getElementById('icon-pause'),
    iconePlay:    document.getElementById('icon-play'),
    rotuloTempo:  document.getElementById('sim-tempo'),
    aoAvancar: (i) => grafico.atualizar(i),
});

const grafico = new Grafico({
    canvas:  document.getElementById('graficoMola'),
    vazio:   document.getElementById('chart-vazio'),
    titulo:  document.querySelector('.chart-title-text'),
    legenda: document.querySelector('.chart-legend'),
});

// ─── Estado global ─────────────────────────────────────────
let simAtual = null;

// ─── Avatar falante (Lia) ──────────────────────────────────
const avatar = new Avatar();

// ─── Sidebar ───────────────────────────────────────────────
function construirSidebar() {
    // Agrupa por categoria
    const categorias = {};
    for (const s of SIMULACOES) {
        (categorias[s.categoria] ??= []).push(s);
    }

    elNav.innerHTML = '';
    for (const [cat, sims] of Object.entries(categorias)) {
        const grp = document.createElement('div');
        grp.className = 'nav-group';
        grp.innerHTML = `<div class="nav-group-label">${cat}</div>`;
        for (const s of sims) {
            const item = document.createElement('div');
            item.className = 'nav-item';
            item.id = `nav-${s.id}`;
            item.innerHTML = iconeCategoria(s.categoria) + s.titulo;
            item.addEventListener('click', () => trocarSimulacao(s.id));
            grp.appendChild(item);
        }
        elNav.appendChild(grp);
    }
}

function iconeCategoria(cat) {
    const icones = {
        'Mecânica':         `<svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"><circle cx="8" cy="8" r="5"/><line x1="8" y1="3" x2="8" y2="5"/></svg>`,
        'Óptica':           `<svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"><path d="M2 8 Q8 2 14 8 Q8 14 2 8z"/><circle cx="8" cy="8" r="2"/></svg>`,
        'Termodinâmica':    `<svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"><path d="M8 2v8M6 12.5a2 2 0 0 0 4 0c0-1.5-2-3-2-3s-2 1.5-2 3z"/></svg>`,
        'Eletromagnetismo': `<svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"><path d="M9 2L5 9h4l-2 5 6-7H9l2-5z"/></svg>`,
    };
    return icones[cat] ?? `<svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4"><circle cx="8" cy="8" r="6"/></svg>`;
}

// ─── Trocar simulação ──────────────────────────────────────
function trocarSimulacao(id) {
    if (simAtual?.id === id) return;

    // Salva estado da simulação saindo
    if (simAtual) _salvarEstado(simAtual.id);

    simAtual = MAPA[id];
    if (!simAtual) return;

    // Atualiza sidebar
    document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
    document.getElementById(`nav-${id}`)?.classList.add('active');

    // Cabeçalho
    elTitulo.textContent = simAtual.titulo;
    elBreadcrumb.textContent = `Experimento de Física / ${simAtual.categoria}`;

    // Gráfico
    grafico.configurar(simAtual.grafico);

    // Restaura ou inicia do zero
    const snap = obter(id);
    if (snap) {
        _aplicarParamsAoDOM(simAtual, snap.params);
        _restaurarChat(snap.chatHTML, snap.dicaHTML);
    } else {
        _renderizarParametros(simAtual);
        _resetarChat(simAtual);
    }

    palco.parar(simAtual, _lerParametros(simAtual));
}

// ─── Iniciar simulação ──────────────────────────────────────
async function iniciarSimulacao() {
    if (!simAtual) return;
    const params = _lerParametros(simAtual);
    const extras = simAtual.paramsExtras?.(params) ?? {};
    const queryParams = { ...params, ...extras };
    // Limpa campos que não são parâmetros numéricos do endpoint
    for (const p of simAtual.parametros) {
        if (p.tipo === 'select') queryParams[p.id] = params[p.id];
    }

    elBtnIniciar.disabled = true;
    elBtnIniciar.textContent = 'Calculando…';
    try {
        const dados = await rodarSimulacao(simAtual.endpoint, queryParams);
        if (dados.erro) { alert(dados.erro); return; }
        grafico.mostrar(dados.resultados);
        palco.carregar(dados.resultados, params);
        _salvarEstado(simAtual.id);
    } finally {
        elBtnIniciar.disabled = false;
        elBtnIniciar.innerHTML = `<svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor"><path d="M3 2.5l10 5.5-10 5.5V2.5z"/></svg> Iniciar Simulação`;
    }
}

// ─── Reiniciar ─────────────────────────────────────────────
function reiniciarSimulacao() {
    if (!simAtual) return;
    limpar(simAtual.id);
    _renderizarParametros(simAtual);
    _resetarChat(simAtual);
    grafico.limpar();
    palco.parar(simAtual, _lerParametros(simAtual));
}

// ─── Chat ─────────────────────────────────────────────────
async function enviarPergunta() {
    const txt = elPerguntaInput.value.trim();
    if (!txt || !simAtual) return;
    elPerguntaInput.value = '';
    _adicionarMensagem('user', txt);
    const params = _lerParametros(simAtual);
    try {
        const r = await perguntarTutor(txt, simAtual.id, params);
        _adicionarMensagem('ia', r.resposta);
        avatar.falarResposta(r.resposta);
    } catch {
        _adicionarMensagem('ia', 'Erro na conexão com o Monitor Virtual.', true);
    }
    _salvarEstado(simAtual.id);
}

function _adicionarMensagem(tipo, txt, erro = false) {
    const div = document.createElement('div');
    div.className = `msg ${tipo}${erro ? ' msg-erro' : ''}`;
    div.innerHTML = txt;
    elChatBody.appendChild(div);
    elChatBody.scrollTop = elChatBody.scrollHeight;
}

// ─── Renderizar parâmetros dinamicamente ───────────────────
function _renderizarParametros(sim) {
    elParametros.innerHTML = '';
    for (const p of sim.parametros) {
        const row = document.createElement('div');
        row.className = 'param-row';
        if (p.tipo === 'select') {
            row.innerHTML = `
                <span class="param-label">${p.rotulo}</span>
                <div class="param-value-col">
                    <select class="param-input param-select" id="param-${p.id}">
                        ${p.opcoes.map(o => `<option value="${o.valor}"${o.valor === p.padrao ? ' selected' : ''}>${o.rotulo}</option>`).join('')}
                    </select>
                </div>
                <span class="param-unit">${p.unidade}</span>`;
        } else {
            row.innerHTML = `
                <span class="param-label">${p.rotulo}</span>
                <div class="param-value-col">
                    <input class="param-input" type="number" id="param-${p.id}"
                        value="${p.padrao}" step="${p.passo}" min="${p.min}" max="${p.max}">
                    <div class="param-bar"><div class="param-bar-fill" id="bar-${p.id}"
                        style="width:${_pct(p.padrao, p.min, p.max)}%"></div></div>
                </div>
                <span class="param-unit">${p.unidade}</span>`;
        }
        elParametros.appendChild(row);
    }
    // Atualiza barras ao digitar
    elParametros.querySelectorAll('input.param-input').forEach(el => {
        el.addEventListener('input', () => {
            const pDef = sim.parametros.find(p => `param-${p.id}` === el.id);
            if (pDef) document.getElementById(`bar-${pDef.id}`).style.width = `${_pct(+el.value, pDef.min, pDef.max)}%`;
            palco.atualizarParametros(_lerParametros(sim));
        });
    });
}

function _aplicarParamsAoDOM(sim, params) {
    _renderizarParametros(sim);
    for (const p of sim.parametros) {
        const el = document.getElementById(`param-${p.id}`);
        if (el && params[p.id] !== undefined) {
            el.value = params[p.id];
            if (p.tipo !== 'select') {
                const bar = document.getElementById(`bar-${p.id}`);
                if (bar) bar.style.width = `${_pct(+el.value, p.min, p.max)}%`;
            }
        }
    }
}

function _lerParametros(sim) {
    const p = {};
    for (const def of sim.parametros) {
        const el = document.getElementById(`param-${def.id}`);
        p[def.id] = def.tipo === 'select' ? el?.value ?? def.padrao : +(el?.value ?? def.padrao);
    }
    return p;
}

function _pct(val, min, max) {
    return Math.max(0, Math.min(100, ((val - min) / (max - min)) * 100)).toFixed(1);
}

function _resetarChat(sim) {
    elChatBody.innerHTML = `<div class="msg ia">${sim.msgInicial}</div>`;
    elDica.innerHTML = sim.dica;
}

function _restaurarChat(chatHTML, dicaHTML) {
    elChatBody.innerHTML = chatHTML;
    elDica.innerHTML = dicaHTML;
}

function _salvarEstado(id) {
    const sim = MAPA[id];
    if (!sim) return;
    salvar(id, {
        params:   _lerParametros(sim),
        chatHTML: elChatBody.innerHTML,
        dicaHTML: elDica.innerHTML,
    });
}

// ─── Eventos ───────────────────────────────────────────────
elBtnIniciar.addEventListener('click', iniciarSimulacao);
elBtnReiniciar.addEventListener('click', reiniciarSimulacao);
elBtnEnviar.addEventListener('click', enviarPergunta);
document.getElementById('btn-iniciar-lab')?.addEventListener('click', () => avatar.apresentar());
elPerguntaInput.addEventListener('keypress', e => { if (e.key === 'Enter') enviarPergunta(); });

// ─── Inicialização ─────────────────────────────────────────
construirSidebar();
trocarSimulacao('oscilador-simples');
