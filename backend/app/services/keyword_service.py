from typing import List

from app.core.patterns import TECH_SKILL_PATTERNS
from app.core.patterns import SOFT_SKILLS_PATTERN
from app.core.constants import TECH_ACRONYMS
from app.services.language_service import detect_language

# Lista de habilidades para retail (bilingüe)
RETAIL_SKILLS = {
    "es": [
        "atención al cliente", "manejo de caja", "reposición", "inventario", "stock",
        "producto", "moda", "tallas", "devoluciones", "promociones", "limpieza de tienda",
        "apertura y cierre", "manejo de tpv", "ventas", "fidelización", "escaparates",
        "organización de probadores", "etiquetado de precios", "recibir mercancía", "cobro",
        "cambio de producto", "gestión de quejas", "recomendar productos", "trabajo en equipo",
        "entorno dinámico", "sala de ventas", "reponer estanterías"
    ],
    "en": [
        "customer service", "cash handling", "restocking", "inventory", "stock management",
        "product knowledge", "fashion", "sizing", "returns", "promotions", "store cleaning",
        "opening/closing", "pos system", "sales", "loyalty", "visual merchandising",
        "fitting room organization", "pricing", "receiving shipments", "cashier",
        "exchanges", "complaint handling", "recommend products", "teamwork",
        "fast-paced environment", "sales floor", "restock shelves"
    ]
}

def extract_technical_skills(text: str, sector: str = "general") -> List[str]:
    """
    Extrae habilidades técnicas o específicas del sector del texto.
    Si sector es 'retail', usa la lista predefinida de habilidades de retail.
    En caso contrario, usa el método original (regex + skills desde JSON).
    """
    text_lower = text.lower()
    
    # Si el sector es retail, buscar habilidades de retail
    if sector == "retail":
        lang = detect_language(text)
        lang_key = "es" if lang == "es" else "en"
        found = []
        for skill in RETAIL_SKILLS.get(lang_key, RETAIL_SKILLS["en"]):
            if skill.lower() in text_lower:
                found.append(skill)
        # Eliminar duplicados manteniendo orden
        return list(dict.fromkeys(found))
    
    # Comportamiento original para otros sectores (tecnología, administración, etc.)
    regex_skills = list(set(TECH_SKILL_PATTERNS.findall(text_lower)))
    
    # Segundo, buscar skills de todos los sectores (para no perder ninguna)
    from app.skills.loader import get_all_sectors, get_skill_sector
    all_skills = set(regex_skills)
    
    # Detectar idioma para buscar en JSON
    lang = detect_language(text)
    
    # Cargar skills de todos los sectores
    for sector_name in get_all_sectors():
        sector_skills = get_skill_sector(sector_name, lang)
        for skill in sector_skills:
            # Si es una palabra de 2 letras, descartar
            if len(skill) == 2:
                continue
            # Si es de 3 letras, solo mantener si está en TECH_ACRONYMS
            if len(skill) == 3 and skill not in TECH_ACRONYMS:
                continue
            if skill.lower() in text_lower:
                all_skills.add(skill.lower())
    
    return list(all_skills)


def extract_soft_skills(text: str) -> List[str]:
    matches = SOFT_SKILLS_PATTERN.findall(text.lower())
    return list(set(matches))
