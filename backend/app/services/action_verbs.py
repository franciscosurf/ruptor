# app/services/action_verbs.py
import re

ACTION_VERBS = {
    "en": {
        "achieved", "built", "created", "delivered", "developed", "engineered",
        "implemented", "increased", "launched", "led", "optimized", "reduced",
        "solved", "transformed", "accelerated", "designed", "established",
        "executed", "generated", "improved", "initiated", "managed",
        "produced", "spearheaded", "strengthened", "upgraded", "mentored", "leadership"
    },
    "es": {
        "alcancé", "construí", "creé", "desarrollé", "diseñé", "ejecuté",
        "implementé", "incrementé", "lancé", "lideré", "logré", "mejoré",
        "optimicé", "reduje", "resolví", "transformé", "aceleré", "establecí",
        "generé", "gestioné", "produje", "Liderazgo", "fortalecí", "actualicé",
        "liderazgo", "responsabilidad", "desarrollo", "implementación", "gestión", "coordinación"
    }
}

def calculate_action_verbs_score(cv_text: str) -> float:
    from app.utils.language import detect_language
    lang = detect_language(cv_text)
    verbs_set = ACTION_VERBS.get(lang, ACTION_VERBS["en"])
    
    words = re.findall(r'\b[a-záéíóúüñ]+\b', cv_text.lower())
    if not words:
        return 0.0
    
    action_count = sum(1 for w in words if w in verbs_set)
    # Normalizar: el 15% de palabras como verbos de acción es excelente
    score = min(100, (action_count / len(words)) * 600)  # 15% → 90 puntos
    return round(score, 2)


