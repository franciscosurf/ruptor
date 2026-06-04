from typing import List
from app.core.patterns import TECH_SKILL_PATTERNS, SOFT_SKILLS_PATTERN
from app.core.constants import TECH_ACRONYMS
from app.services.language_service import detect_language
from app.skills.loader import (
    get_skill_sector, get_stopwords_for_sector, get_all_sectors,
    get_tools_for_sector  # si quieres incluirlas
)

def extract_technical_skills(text: str, sector: str = "general") -> List[str]:
    text_lower = text.lower()
    lang = detect_language(text)
    lang_key = "en" if lang == "en" else "es"

    # 1. Regex
    regex_skills = set(TECH_SKILL_PATTERNS.findall(text_lower))

    # 2. Skills de todos los sectores (desde JSON)
    all_skills = set(regex_skills)
    for sec_name in get_all_sectors():
        for skill in get_skill_sector(sec_name, lang_key):
            if len(skill) == 2:
                continue
            if len(skill) == 3 and skill not in TECH_ACRONYMS:
                continue
            if skill.lower() in text_lower:
                all_skills.add(skill.lower())

    # 3. Si hay sector específico (no general), añadir sus skills y herramientas
    if sector != "general":
        for skill in get_skill_sector(sector, lang_key):
            if skill.lower() in text_lower:
                all_skills.add(skill.lower())
        # (Opcional) También añadir herramientas del sector
        for tool in get_tools_for_sector(sector, lang_key):
            if tool.lower() in text_lower:
                all_skills.add(tool.lower())

    # 4. Stopwords del sector
    stopwords = set()
    if sector != "general":
        stopwords = get_stopwords_for_sector(sector, lang_key)
    # Stopwords globales base (por si acaso)
    base_stopwords = {"compras", "ventas", "producto", "cliente", "tienda"}
    stopwords.update(base_stopwords)

    # 5. Filtrar
    filtered = [s for s in all_skills if s not in stopwords]
    return list(dict.fromkeys(filtered))

def extract_soft_skills(text: str) -> List[str]:
    matches = SOFT_SKILLS_PATTERN.findall(text.lower())
    return list(set(matches))