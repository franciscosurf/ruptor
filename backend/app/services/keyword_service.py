# app/services/keyword_service.py

import re
from typing import List
from app.core.patterns import TECH_SKILL_PATTERNS, SOFT_SKILLS_PATTERN
from app.core.constants import TECH_ACRONYMS
from app.services.language_service import detect_language
from app.skills.loader import get_skill_sector, get_stopwords_for_sector, get_all_sectors

# ============================================================================
# Stopwords globales (se aplican siempre, independientemente del sector)
# ============================================================================
GLOBAL_STOPWORDS = {
    # Términos genéricos en español
    "civil", "igualdad", "oportunidades", "discriminación", "género", "edad",
    "discapacidad", "orientación sexual", "religión", "etnia", "estado civil",
    "circunstancia", "respeto", "dignidad", "desarrollo profesional", "promoción",
    "entorno de trabajo", "selección", "formación", "motivo", "expresión",
    "identidad", "personal", "social", "trato", "personas", "ambiente", "trabajo",
    "equipo", "cultura", "valores", "misión", "visión", "beneficios", "salario",
    "horario", "jornada", "contrato", "vacaciones", "permisos", "compras", "ventas",
    "producto", "cliente", "tienda", "precio", "stock", "inventario", "comprar",
    "vender", "reponer", "atender", "gestionar", "responsabilidad", "apoyo", "ayudar",
    # Términos genéricos en inglés
    "purchases", "sales", "product", "customer", "store", "price", "buy", "sell",
    "restock", "serve", "manage", "support", "help", "equal", "opportunities",
    "discrimination", "gender", "age", "disability", "religion", "ethnicity"
}

def skill_in_text(skill: str, text: str) -> bool:
    """
    Comprueba si la habilidad (palabra o frase) aparece en el texto
    respetando límites de palabra. Útil para evitar coincidencias parciales.
    """
    pattern = r'\b' + re.escape(skill.lower()) + r'\b'
    return re.search(pattern, text) is not None

def extract_technical_skills(text: str, sector: str = "general") -> List[str]:
    """
    Extrae habilidades técnicas o específicas del sector.
    - Para 'general': skills de todos los sectores (JSON) + regex.
    - Para un sector concreto (ej. 'retail'): skills propias del sector + regex.
    - Siempre filtra stopwords globales y específicas del sector.
    """
    text_lower = text.lower()
    lang = detect_language(text)
    lang_key = "en" if lang == "en" else "es"

    # 1. Skills por regex (patrones técnicos generales)
    regex_skills = set(TECH_SKILL_PATTERNS.findall(text_lower))

    # 2. Si sector es 'general', cargar skills de TODOS los JSON
    #    Si sector es específico, cargar solo las skills de ese sector
    all_skills = set(regex_skills)

    if sector == "general":
        # Cargar skills de todos los sectores
        for sec_name in get_all_sectors():
            sector_skills = get_skill_sector(sec_name, lang_key)
            for skill in sector_skills:
                if len(skill) == 2:
                    continue
                if len(skill) == 3 and skill not in TECH_ACRONYMS:
                    continue
                if skill_in_text(skill, text_lower):
                    all_skills.add(skill.lower())
    else:
        # Cargar skills específicas del sector (ej. retail.json, tecnologia.json)
        specific_skills = get_skill_sector(sector, lang_key)
        for skill in specific_skills:
            if skill_in_text(skill, text_lower):
                all_skills.add(skill.lower())

    # 3. Cargar stopwords del sector (si existen)
    sector_stopwords = set()
    if sector != "general":
        sector_stopwords = get_stopwords_for_sector(sector, lang_key)

    # 4. Aplicar filtros (globales + sectoriales)
    filtered = []
    for skill in all_skills:
        if skill in GLOBAL_STOPWORDS:
            continue
        if skill in sector_stopwords:
            continue
        filtered.append(skill)

    # Eliminar duplicados manteniendo orden (aproximado)
    return list(dict.fromkeys(filtered))


def extract_soft_skills(text: str) -> List[str]:
    """
    Extrae habilidades blandas (soft skills) del texto.
    Utiliza un patrón regex predefinido (SOFT_SKILLS_PATTERN).
    """
    text_lower = text.lower()
    matches = SOFT_SKILLS_PATTERN.findall(text_lower)
    # Eliminar duplicados manteniendo el orden de aparición
    return list(dict.fromkeys(matches))
