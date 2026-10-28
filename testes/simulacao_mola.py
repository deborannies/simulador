import numpy as np
import matplotlib.pyplot as plt

def simular_massa_mola():
    # parâmetros 
    m = 1.0      # massa (kg)
    k = 10.0     # constante da mola (N/m)
    x0 = 0.5     # posição inicial (m)
    v0 = 0.0     # velocidade inicial (m/s)
    
    # tempo
    t_final = 10.0
    dt = 0.01   
    tempos = np.arange(0, t_final, dt)
    
    # solução analitica omega = sqrt(k/m)
    omega = np.sqrt(k/m)
    
    # equação do movimento: x(t) = x0 * cos(omega * t)
    posicoes = x0 * np.cos(omega * tempos)

    # gráfico
    plt.figure(figsize=(10, 5))
    plt.plot(tempos, posicoes, label='Posição do Bloco', color='blue', linewidth=2)
    
    # dados gráfico
    plt.title('Simulação de Sistema Massa-Mola', fontsize=14)
    plt.xlabel('Tempo (s)', fontsize=12)
    plt.ylabel('Posição (m)', fontsize=12)
    plt.grid(True, linestyle='--', alpha=0.7)
    plt.axhline(0, color='black', lw=1)
    plt.legend()
    
    plt.savefig('grafico_massa_mola.png')
    
    # abre o gráfico na tela
    print("Gerando gráfico... feche a janela do gráfico para encerrar.")
    plt.show()

if __name__ == "__main__":
    simular_massa_mola()