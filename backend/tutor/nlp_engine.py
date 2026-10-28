import spacy

nlp = spacy.load("pt_core_news_md")

referencias = {
    "aumentar_massa": nlp("adicionar peso aumentar massa pesado bloco gigante"),
    "diminuir_massa": nlp("tirar peso diminuir massa leve bloco menor minúsculo"),
    "aumentar_k": nlp("mola dura aumentar constante elástica rígida forte tensa"),
    "diminuir_k": nlp("mola mole diminuir constante elástica macia frouxa plástico"),
    "aumentar_amortecimento": nlp("atrito parar rápido aumentar amortecimento frear brusco segurar"),
    "diminuir_amortecimento": nlp("atrito oscilar longo tempo diminuir amortecimento solto livre balançar")
}

def interpretar_intencao(pergunta_usuario):
    doc = nlp(pergunta_usuario.lower())
    
    palavras_limpas = " ".join([token.text for token in doc if not token.is_stop and token.is_alpha])
    
    texto_final = palavras_limpas if palavras_limpas else pergunta_usuario.lower()
    vetor_usuario = nlp(texto_final)
    
    melhor_similaridade = 0.0
    intencao_detectada = None

    print(f"\n--- Analisando frase limpa: '{texto_final}' ---")

    for nome_intencao, vetor_referencia in referencias.items():
        similaridade = vetor_usuario.similarity(vetor_referencia)
        
        print(f"Similaridade com {nome_intencao}: {similaridade:.2f}")
        
        if similaridade > melhor_similaridade:
            melhor_similaridade = similaridade
            intencao_detectada = nome_intencao

    if melhor_similaridade > 0.60:
        print(f"--> VENCEDOR: {intencao_detectada} \n")
        return intencao_detectada
    else:
        print("--> Nenhuma intenção atingiu 60% \n")
        return "assunto_desconhecido"