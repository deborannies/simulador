// Gráfico (Chart.js) configurado a partir da descrição `grafico` de cada simulação.
//
// grafico: {
//   titulo, x: 'tempo', rotuloX, rotuloY, rotuloY2?,
//   series: [{ chave, rotulo, cor, tracejado?, eixo?: 'y' | 'y2' }],
//   cursor: 'tempo' | 'ponto' | null,   // marcador do instante atual
//   perfil: false,                       // true = cada quadro é uma curva inteira (dados[chave][i])
// }

export class Grafico {
    constructor({ canvas, vazio, titulo, legenda }) {
        this.canvas = canvas;
        this.vazio = vazio;
        this.titulo = titulo;
        this.legenda = legenda;
        this.chart = null;
        this.cfg = null;
        this.dados = null;
        this.indice = 0;
    }

    configurar(cfg) {
        this.cfg = cfg;
        this.titulo.textContent = cfg.titulo;
        this.legenda.innerHTML = cfg.series.map((s) =>
            `<div class="legend-item"><div class="legend-line" style="background:${s.tracejado
                ? `repeating-linear-gradient(to right, ${s.cor} 0, ${s.cor} 3px, transparent 3px, transparent 6px)`
                : s.cor}"></div>${s.rotulo}</div>`).join('');
        this.limpar();
    }

    limpar() {
        if (this.chart) { this.chart.destroy(); this.chart = null; }
        this.dados = null;
        this.vazio.style.display = '';
    }

    mostrar(dados) {
        this.limpar();
        this.dados = dados;
        this.indice = 0;
        this.vazio.style.display = 'none';
        const cfg = this.cfg;
        const temY2 = cfg.series.some((s) => s.eixo === 'y2');

        Chart.defaults.color = '#5a5a66';
        Chart.defaults.borderColor = '#252529';

        const escalas = {
            x: { type: 'linear', grid: { color: '#1c1c22' }, ticks: { maxTicksLimit: 10 },
                 title: { display: !!cfg.rotuloX, text: cfg.rotuloX } },
            y: { grid: { color: '#252529' }, title: { display: !!cfg.rotuloY, text: cfg.rotuloY } },
        };
        if (cfg.perfil) escalas.y = { ...escalas.y, ...this.#limitesPerfil() };
        if (temY2) escalas.y2 = { position: 'right', grid: { display: false },
                                  title: { display: !!cfg.rotuloY2, text: cfg.rotuloY2 } };

        const self = this;
        this.chart = new Chart(this.canvas.getContext('2d'), {
            type: 'line',
            data: { datasets: cfg.series.map((s) => ({
                label: s.rotulo,
                data: this.#pontos(s.chave, 0),
                borderColor: s.cor,
                borderDash: s.tracejado ? [5, 4] : [],
                borderWidth: 1.8,
                pointRadius: 0,
                tension: 0.3,
                yAxisID: s.eixo || 'y',
            })) },
            options: {
                responsive: true, maintainAspectRatio: false,
                animation: cfg.perfil ? false : { duration: 600, easing: 'easeInOutQuart' },
                plugins: {
                    legend: { display: false },
                    tooltip: { backgroundColor: '#18181c', borderColor: '#2e2e35', borderWidth: 1,
                               titleColor: '#a0a0ab', bodyColor: '#f0f0f2' },
                },
                scales: escalas,
            },
            plugins: [{ id: 'cursor', afterDatasetsDraw: (chart) => self.#desenharCursor(chart) }],
        });
    }

    /** Chamado a cada quadro da animação. */
    atualizar(indice) {
        if (!this.chart) return;
        this.indice = indice;
        if (this.cfg.perfil) {
            this.chart.data.datasets.forEach((ds, k) => { ds.data = this.#pontos(this.cfg.series[k].chave, indice); });
            this.chart.update('none');
        } else {
            this.chart.draw();
        }
    }

    #pontos(chave, indice) {
        const xs = this.dados[this.cfg.x];
        const ys = this.cfg.perfil ? this.dados[chave][indice] : this.dados[chave];
        return xs.map((x, j) => ({ x, y: ys[j] }));
    }

    #limitesPerfil() {
        const todos = this.cfg.series.flatMap((s) => this.dados[s.chave].flat());
        const min = Math.min(...todos), max = Math.max(...todos);
        const folga = (max - min) * 0.08 || 1;
        return { min: min - folga, max: max + folga };
    }

    #desenharCursor(chart) {
        const { cursor, perfil, x, series } = this.cfg;
        if (!cursor || perfil || !this.dados) return;
        const i = this.indice;
        const xs = chart.scales.x;
        const ys = chart.scales[series[0].eixo || 'y'];
        const px = xs.getPixelForValue(this.dados[x][i]);
        const ctx = chart.ctx;
        ctx.save();
        if (cursor === 'tempo') {
            ctx.strokeStyle = 'rgba(255,255,255,0.35)';
            ctx.setLineDash([4, 4]);
            ctx.beginPath(); ctx.moveTo(px, ys.top); ctx.lineTo(px, ys.bottom); ctx.stroke();
            ctx.setLineDash([]);
        }
        ctx.fillStyle = series[0].cor;
        ctx.beginPath(); ctx.arc(px, ys.getPixelForValue(this.dados[series[0].chave][i]), 4, 0, Math.PI * 2); ctx.fill();
        ctx.restore();
    }
}
