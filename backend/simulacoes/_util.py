"""Ferramentas numéricas compartilhadas entre as simulações."""
import numpy as np


def rk4(derivada, estado_inicial, t_final, dt):
    """
    Integra d(estado)/dt = derivada(t, estado) pelo método de Runge-Kutta de 4ª ordem.

    Retorna (t, estados), onde estados tem forma (n_passos, len(estado_inicial)).
    """
    n = int(round(t_final / dt)) + 1
    t = np.linspace(0.0, t_final, n)
    estados = np.empty((n, len(estado_inicial)))
    y = np.asarray(estado_inicial, dtype=float)
    estados[0] = y
    for i in range(1, n):
        ti = t[i - 1]
        k1 = derivada(ti, y)
        k2 = derivada(ti + dt / 2, y + dt / 2 * k1)
        k3 = derivada(ti + dt / 2, y + dt / 2 * k2)
        k4 = derivada(ti + dt, y + dt * k3)
        y = y + dt / 6 * (k1 + 2 * k2 + 2 * k3 + k4)
        estados[i] = y
    return t, estados


def amostrar(n_pontos, *arrays):
    """Reduz arrays longos para ~n_pontos (para não pesar a resposta JSON)."""
    passo = max(1, len(arrays[0]) // n_pontos)
    return [np.asarray(a)[::passo] for a in arrays]


def lista(a, casas=5):
    """Converte array numpy em lista JSON arredondada."""
    return np.round(np.asarray(a, dtype=float), casas).tolist()
