import re
from typing import List, Tuple

from app.core.models import get_kw_model
from app.utils.language import detect_language
from app.core.models import _init_models
from app.services.text_service import extract_relevant_text

def extract_keywords_advanced(text: str, top_n: int = 60, force_lang: str = None) -> List[Tuple[str, float]]:
    _init_models()
    
    # 1. Dividir el texto en fragmentos: oraciones (punto y salto de línea)
    # Usamos split con lookbehind positivo: (?<=[.!?;:])\s+  y también split por \n+
    chunks = re.split(r'(?<=[.!?;:])\s+|\n+', text)
    chunks = [c.strip() for c in chunks if len(c.strip()) > 20]  # ignorar fragmentos muy cortos
    
    # Si no hay suficientes fragmentos, usar todo el texto
    if len(chunks) < 2:
        chunks = [text[:10000]]
    
    all_keywords = []
    for chunk in chunks[:10]:  # limitar a 10 fragmentos para rendimiento
        # Extraer keywords de cada fragmento por separado
        relevant_text = extract_relevant_text(chunk)
        if not relevant_text.strip() or len(relevant_text) < 50:
            relevant_text = chunk[:5000]

        try:
            kw_model_instance = get_kw_model()
            lang = force_lang or detect_language(relevant_text)
            if lang == 'es':
            # Para español, usa None o una lista personalizada de stopwords
                stop_words = None
            else:
                stop_words = 'english'

            candidates = kw_model_instance.extract_keywords(
                relevant_text,
                keyphrase_ngram_range=(1, 2),   # unigramas y bigramas
                #stop_words=stop_words,
                stop_words = stop_words,
                top_n=top_n // len(chunks) + 5,
                use_mmr=True,
                diversity=0.6,
                nr_candidates=100,
            )
            all_keywords.extend(candidates)
        except Exception:
            continue
    
    # 2. Eliminar duplicados y sumar scores por keyword
    keyword_scores = {}
    for kw, score in all_keywords:
        kw_clean = kw.lower().strip()
        if kw_clean in keyword_scores:
            keyword_scores[kw_clean] = max(keyword_scores[kw_clean], score)
        else:
            keyword_scores[kw_clean] = score
    
    # 3. Convertir a lista y aplicar filtros estándar (ruido, longitud, adjetivos, bigramas cruzados)
    filtered = []
    for kw, score in sorted(keyword_scores.items(), key=lambda x: x[1], reverse=True):
        kw_lower = kw
        # ... aquí aplicas tus filtros actuales (NOISE_TERMS, longitud, adjetivos, etc.)
        # Además, para bigramas, verificas que aparezcan en el mismo fragmento original
        if ' ' in kw_lower:
            # Buscar si el bigrama aparece en algún fragmento original
            found = False
            for chunk in chunks:
                if kw_lower in chunk.lower():
                    found = True
                    break
            if not found:
                continue
        filtered.append((kw_lower, score))
    
    return filtered[:top_n]

