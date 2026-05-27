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

def extract_education_level(text: str) -> Tuple[str, int]:

    text_lower = text.lower()

    highest_level = "ninguno"
    highest_weight = 0

    for level, weight in EDUCATION_LEVELS.items():

        if level in text_lower and weight > highest_weight:
            highest_weight = weight
            highest_level = level

    return highest_level, highest_weight
