from typing import Tuple

EDUCATION_LEVELS = {
    "doctorado": 5,
    "phd": 5,
    "doctorate": 5,
    "maestría": 4,
    "master": 4,
    "mba": 4,
    "postgrado": 3,
    "grado": 3,
    "licenciatura": 3,
    "ingeniería": 3,
    "ingeniero": 3,
    "bachelor": 3,
    "diplomado": 2,
    "especialización": 2,
    "certificación": 1,
    "certified": 1,
}

import re

def extract_education_level(text: str) -> tuple:
    """
    Detecta el nivel educativo requerido en la oferta o presente en el CV.
    Retorna (nivel, puntuación_normalizada) donde nivel puede ser:
    'ninguno', 'secundaria', 'grado', 'master', 'doctorado'
    """
    text_lower = text.lower()
    
    # Patrón mejorado: solo detecta "grado" si va seguido de palabras académicas
    # o si está en una frase que claramente habla de requisitos educativos
    education_patterns = {
        'doctorado': r'\b(doctorado|ph\.?d|doctoral)\b',
        'master': r'\b(máster|master|maestría|postgrado)\b',
        'grado': r'\b(grado\s+(?:en|universitario|académico|de\s+licenciatura)|titulación\s+de\s+grado|educación\s+mínima:\s*grado)\b',
        'secundaria': r'\b(educación\s+secundaria|bachillerato|high\s+school|eso)\b'
    }
    # Para el caso de "grado" suelto pero en contexto de requisitos:
    # También buscamos líneas que contengan "requisitos:" y luego "grado"
    lines = text.split('\n')
    for line in lines:
        if 'requisito' in line.lower() or 'educación' in line.lower() or 'formación' in line.lower():
            if re.search(r'\bgrado\b', line.lower()):
                return ('grado', 3)  # nivel 3 de 4
    
    for level, pattern in education_patterns.items():
        if re.search(pattern, text_lower):
            # Asignar puntuación: secundaria=2, grado=3, master=4, doctorado=5
            score = {'secundaria':2, 'grado':3, 'master':4, 'doctorado':5}.get(level, 0)
            return (level, score)
    return ('ninguno', 0)
