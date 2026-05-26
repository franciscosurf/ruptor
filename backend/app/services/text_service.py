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


def _merge_broken_lines(text: str) -> str:
    """
    Une líneas que probablemente fueron cortadas por un salto de línea (PDF o texto sin formato).
    Heurística: si la línea actual no termina en punto, exclamación, interrogación, dos puntos o punto y coma,
    y la siguiente línea no empieza con mayúscula o con viñeta, se unen.
    """
    lines = text.splitlines()
    merged = []
    current = ""
    for i, line in enumerate(lines):
        stripped = line.strip()
        if not stripped:
            if current:
                merged.append(current)
                current = ""
            continue
        # Si no hay línea actual, empezar una nueva
        if not current:
            current = stripped
            continue
        # Decidir si unir
        # Condiciones para NO unir: la línea actual termina con puntuación fuerte (., !, ?, ;, :)
        ends_with_punct = re.search(r'[.!?;:]$', current)
        # Si la línea siguiente empieza con mayúscula o con viñeta, probablemente es nueva frase
        next_line_starts_upper = i+1 < len(lines) and lines[i+1].strip() and lines[i+1].strip()[0].isupper()
        if ends_with_punct or next_line_starts_upper:
            merged.append(current)
            current = stripped
        else:
            # Unir con espacio
            current += " " + stripped
    if current:
        merged.append(current)
    return "\n".join(merged)




def extract_relevant_text(text: str, min_score: float = 0.45, sector: str = "general") -> str:
    """
    Filtra líneas irrelevantes (beneficios, cultura, empresa) usando score_sentence.
    Devuelve el texto filtrado, línea por línea.
    """
    from app.services.text_scoring import extract_relevant_text as _scoring_extract
    from app.services.language_service import detect_language

    lang = detect_language(text)
    # Ajuste del umbral: inglés más permisivo (0.35), español un poco más alto (0.4)
    if lang == 'en':
        min_score = 0.35
    else:
        min_score = 0.40

    # Llamada directa a la función de scoring (sin preprocesado adicional)
    return _scoring_extract(text, min_score=min_score, sector=sector, lang=lang)


def extract_relevant_text2(text: str, min_score: float = 0.45, sector: str = "general") -> str:
    """
    Versión mejorada: une líneas rotas, detecta el idioma y aplica scoring de frases.
    """
    # 1. Unir líneas rotas
    full_text = _merge_broken_lines(text)

    # 2. Detectar idioma (para pasar a la función de scoring)
    lang = detect_language(full_text)  # 'en' o 'es'

    if lang == 'es':
        min_score = 0.35   # más permisivo para español
    else:
        min_score = 0.45   # estándar para inglés



    # 3. Aplicar scoring usando la función de text_scoring (sin recursión)
    result = _scoring_extract(full_text, min_score=min_score, sector=sector, lang=lang)

    # 4. Fallback si el resultado es muy corto
    if len(result) < 200:
        words = full_text.split()[:500]
        result = " ".join(words)

    return result[:15000]

