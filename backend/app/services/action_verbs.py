# app/services/action_verbs.py
import re
from typing import Tuple, List
from app.utils.language import detect_language

ACTION_VERBS = {
    "en": {
        "achieved", "built", "created", "delivered", "developed", "engineered",
        "implemented", "increased", "launched", "led", "optimized", "reduced",
        "solved", "transformed", "accelerated", "designed", "established",
        "executed", "generated", "improved", "initiated", "managed", "produced",
        "spearheaded", "strengthened", "upgraded", "mentored", "automated", "directed"
    },
    "es": {
        # Verbos conjugados en primera persona (pasado) e infinitivos de alto impacto
        "alcancé", "construí", "creé", "desarrollé", "diseñé", "ejecuté",
        "implementé", "incrementé", "lancé", "lideré", "logré", "mejoré",
        "optimicé", "reduje", "resolví", "transformé", "aceleré", "establecí",
        "generé", "gestioné", "produje", "fortalecí", "actualicé", "automaticé",
        "coordiné", "dirigí", "organicé", "superé", "reestructuré", "planifiqué",
        "crear", "desarrollar", "optimizar", "liderar", "implementar", "reducir",
        "incrementar", "automatizar", "dirigir", "gestionar", "coordinar"
    }
}

def analyze_action_verbs(cv_text: str) -> Tuple[float, List[str]]:
    """
    Analiza la densidad de verbos de acción por oración en el CV.
    Devuelve un score (0.0 a 100.0) y la lista de verbos detectados.
    """
    if not cv_text or len(cv_text.strip()) < 10:
        return 0.0, []

    lang = detect_language(cv_text)
    verbs_set = ACTION_VERBS.get(lang, ACTION_VERBS["en"])
    
    # Segmentar en oraciones para medir densidad estructural
    sentences = [s.strip() for s in re.split(r'(?<=[.!?;:])\s+|\n+', cv_text) if len(s.strip()) > 10]
    if not sentences:
        sentences = [cv_text]

    detected_verbs = set()
    sentences_with_verbs = 0

    # Tokenización limpia por palabra para evitar falsos positivos dentro de otras palabras
    for sentence in sentences:
        words = set(re.findall(r'\b[a-zA-ZáéíóúÁÉÍÓÚñÑ]+\b', sentence.lower()))
        matches = words.intersection(verbs_set)
        if matches:
            detected_verbs.update(matches)
            sentences_with_verbs += 1

    # Calcular Score basado en la salud distributiva de los verbos en el texto
    # Lo ideal en un buen CV es que al menos el 35% de sus líneas estratégicas inicien o contengan un verbo de acción.
    density = (sentences_with_verbs / len(sentences)) if sentences else 0.0
    score = (density / 0.35) * 100.0
    
    return round(max(0.0, min(100.0, score)), 2), sorted(list(detected_verbs))


