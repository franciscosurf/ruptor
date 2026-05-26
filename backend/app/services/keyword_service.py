import re

from typing import List
from typing import Tuple

from app.core.patterns import TECH_SKILL_PATTERNS
from app.core.patterns import SOFT_SKILLS_PATTERN
from app.core.constants import TECH_ACRONYMS
from app.services.language_service import detect_language

def extract_technical_skills(text: str) -> List[str]:
    # Primero con regex
    regex_skills = list(set(TECH_SKILL_PATTERNS.findall(text.lower())))
    
    # Segundo, buscar skills de todos los sectores (para no perder ninguna)
    from app.skills.loader import get_all_sectors, get_skill_sector
    all_skills = set(regex_skills)
    
    # Detectar idioma para buscar en JSON
    lang = detect_language(text)
    
    # Cargar skills de todos los sectores
    for sector in get_all_sectors():
        sector_skills = get_skill_sector(sector, lang)
        for skill in sector_skills:
            # Si es una palabra de 2 letras, descartar
            if len(skill) == 2:
                continue
            # Si es de 3 letras, solo mantener si está en TECH_ACRONYMS
            if len(skill) == 3 and skill not in TECH_ACRONYMS:
                continue

            else:
                if skill.lower() in text.lower():
                    all_skills.add(skill.lower())
    
    return list(all_skills)



def extract_soft_skills(text: str) -> List[str]:
    matches = SOFT_SKILLS_PATTERN.findall(text.lower())

    return list(set(matches))
