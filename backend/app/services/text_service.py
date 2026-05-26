import re
from typing import Dict, Tuple
from app.core.models import get_nlp
from app.services.language_service import detect_language
from app.services.text_scoring import extract_relevant_text as _scoring_extract

def preprocess_text(text: str, lang: str = "es") -> str:
    """Lematiza y limpia el texto usando spaCy"""
    nlp = get_nlp(lang)
    if not nlp:
        return text
    doc = nlp(text[:10000])
    tokens = []
    for token in doc:
        if not token.is_stop and not token.is_punct and not token.is_space:
            lemmatized = token.lemma_.lower()
            if len(lemmatized) >= 3:
                tokens.append(lemmatized)
    return " ".join(tokens)

def extract_relevant_text(text: str, min_score: float = 0.45, sector: str = "general") -> str:
    """
    Filtra líneas irrelevantes (beneficios, cultura, empresa) usando score_sentence.
    Devuelve el texto filtrado, línea por línea.
    """
    lang = detect_language(text)
    # Ajuste del umbral: inglés más permisivo (0.35), español un poco más alto (0.4)
    if lang == 'en':
        min_score = 0.35
    else:
        min_score = 0.40

    # Llamada directa a la función de scoring (sin preprocesado adicional)
    return _scoring_extract(text, min_score=min_score, sector=sector, lang=lang)
