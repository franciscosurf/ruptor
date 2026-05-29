"""
quantified_achievements.py - Detecta logros cuantificables en el CV (números, %, €)
"""

import re
from typing import Tuple, List

# Expresión para cazar números que representen métricas reales (ej: 45%, $10K, 5M, 200 usuarios)
# Excluye explícitamente años de cuatro dígitos comunes (199X, 200X, 201X, 202X) si van solos
METRIC_PATTERN = re.compile(
    r'(?<!\b(?:19|20)\d{2}\b)'  # Lookbehind: No puede ser un año entre 1900 y 2099
    r'('
    r'\b\d+[\s]*[%€$¢£¥]|'      # Números seguidos de símbolos de porcentaje o monedas (e.g., 50%, 100€)
    r'[$€£]\s*\d+|'             # Símbolos de monedas seguidos de números (e.g., $5000, €10k)
    r'\b\d+[\s]*(?:%|percent|porcentaje|usd|eur|clp|mxn|ars|k|m|reuniones|leads)\b|' 
    r'\b\d+[\s]+(?:usuarios|users|clientes|clients|proyectos|projects|personas|employees|millones|miles|api|apps|por ciento)\b'
    r')',
    re.IGNORECASE
)

# Filtro estricto para ignorar frases típicas de experiencia cronológica que no representan un logro de rendimiento
TIMELINE_FILTER = re.compile(
    r'(\b\d+\s*(?:año|mes|year|month)|experiencia|edad|desde|hasta|\b(?:19|20)\d{2}\b)',
    re.IGNORECASE
)

def analyze_quantified_achievements(cv_text: str) -> Tuple[float, List[str]]:
    """
    Analiza el CV buscando oraciones que contengan impactos y métricas numéricas duras,
    bloqueando falsos positivos como números de teléfono, fechas o años de experiencia.
    Devuelve un score (0.0 a 100.0) y la lista de oraciones que representan logros legítimos.
    """
    if not cv_text:
        return 0.0, []

    # Segmentar por líneas u oraciones completas
    sentences = [s.strip() for s in re.split(r'(?<=[.!?;:])\s+|\n+', cv_text) if len(s.strip()) > 15]
    
    achievements_found = []

    for sentence in sentences:
        # 1. ¿Contiene un número que califica como métrica?
        if METRIC_PATTERN.search(sentence):
            # 2. ¿Es simplemente una declaración de tiempo ("5 años en la empresa")? 
            # Si contiene un número métrico pero también palabras de línea de tiempo, validamos la fuerza de la oración
            words_count = len(sentence.split())
            
            # Si pasa el filtro de descarte cronológico o es una oración rica en contexto métrico, se guarda
            if not TIMELINE_FILTER.search(sentence) or (words_count > 12 and ("increment" in sentence.lower() or "mejor" in sentence.lower() or "reduc" in sentence.lower() or "ahorr" in sentence.lower() or "sav" in sentence.lower())):
                achievements_found.append(sentence)

    # Deduplicar oraciones por si acaso
    achievements_found = list(dict.fromkeys(achievements_found))

    # Cálculo del Score ATS:
    # En un estándar internacional, un CV extraordinario tiene al menos 3 o 4 hitos numéricos indexados.
    count = len(achievements_found)
    if count == 0:
        score = 0.0
    elif count == 1:
        score = 40.0
    elif count == 2:
        score = 75.0
    else:
        score = 100.0

    return score, achievements_found[:6]  # Devolvemos un máximo de 6 para no saturar el frontend
