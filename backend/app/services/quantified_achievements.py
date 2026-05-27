"""
quantified_achievements.py - Detecta logros cuantificables en el CV (números, %, €)
"""

import re

def calculate_quantified_achievements_score(cv_text: str) -> float:
    """
    Calcula un score de 0 a 100 basado en la densidad de números asociados a logros.
    Busca patrones como: 'aumenté un 20%', 'reduje 15k €', 'logré 10k usuarios'.
    """
    cv_lower = cv_text.lower()

    # Patrones típicos de logros cuantificables
    patterns = [
        r'\+\d+%', r'-\d+%', r'\b\d+%\b',               # porcentajes
        r'\b\d+(?:\.\d+)?\s*(?:k|mil|millones|m|€|\$)', # números con unidades
        r'(?:aument[óo]|reduj[oó]|increment[óo]|mejor[óo]|ahorré|logré|alcancé).{0,30}\b\d+',
        r'\b\d+\s*(?:veces|unidades|clientes|usuarios|ventas|euros|dólares)\b'
    ]
    combined = re.compile('|'.join(patterns), re.IGNORECASE)

    matches = combined.findall(cv_text)
    count = len(matches)

    # Puntuación: 0-5 logros → 0-100 puntos lineal
    score = min(100, (count / 5) * 100)
    return round(score, 2)


