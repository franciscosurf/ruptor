from typing import List
from app.core.patterns import TECH_SKILL_PATTERNS
from app.core.patterns import SOFT_SKILLS_PATTERN
from app.core.constants import TECH_ACRONYMS
from app.services.language_service import detect_language

# Palabras genéricas que no deben ser consideradas skills técnicas (aplica siempre)
GENERIC_SKILL_STOPWORDS = {
    'compras', 'ventas', 'producto', 'cliente', 'tienda', 'precio', 'stock', 'inventario',
    'comprar', 'vender', 'reponer', 'atender', 'gestionar', 'trabajo', 'equipo',
    'responsabilidad', 'apoyo', 'ayudar', 'realizar', 'elaborar', 'coordinar',
    'desarrollo', 'creación', 'mantenimiento', 'optimización'  # también para tech
}

# Lista de habilidades para retail (bilingüe)
RETAIL_SKILLS = {
    "es": [
        "atención al cliente", "manejo de caja", "reposición", "inventario", "stock",
        "moda", "tallas", "devoluciones", "promociones", "limpieza de tienda",
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
    Siempre filtra palabras genéricas (GENERIC_SKILL_STOPWORDS).
    Si sector es 'retail', añade habilidades de la lista predefinida.
    """
    text_lower = text.lower()
    lang = detect_language(text)
    lang_key = "es" if lang == "es" else "en"

    # 1. Extracción general con regex
    regex_skills = set(TECH_SKILL_PATTERNS.findall(text_lower))

    # 2. Skills desde JSON (todos los sectores)
    from app.skills.loader import get_all_sectors, get_skill_sector
    all_skills = set(regex_skills)

    for sector_name in get_all_sectors():
        sector_skills = get_skill_sector(sector_name, lang)
        for skill in sector_skills:
            if len(skill) == 2:
                continue
            if len(skill) == 3 and skill not in TECH_ACRONYMS:
                continue
            if skill.lower() in text_lower:
                all_skills.add(skill.lower())

    # 3. Si es retail, añadir las skills específicas
    if sector == "retail":
        retail_skills = RETAIL_SKILLS.get(lang_key, RETAIL_SKILLS["en"])
        for skill in retail_skills:
            if skill.lower() in text_lower:
                all_skills.add(skill.lower())

    # 4. Filtrar stopwords genéricas (SIEMPRE)
    filtered_skills = [
        skill for skill in all_skills
        if skill not in GENERIC_SKILL_STOPWORDS
    ]

    # 5. Eliminar duplicados manteniendo orden
    return list(dict.fromkeys(filtered_skills))


def extract_soft_skills(text: str) -> List[str]:
    matches = SOFT_SKILLS_PATTERN.findall(text.lower())
    return list(set(matches))