"""
job_title_matcher.py
Extracción robusta de títulos de puesto. Bilingüe ES/EN, cualquier sector.
"""

import re
from typing import Optional
from sklearn.metrics.pairwise import cosine_similarity


# ─── Patrones que DESCARTAN una línea como título ─────────────────────────────

NOT_A_TITLE = re.compile(
    r"""
    # Contacto
    @|http|www\.|linkedin|github|\.com|\.es|\.io|\.net|\.org
    |^\s*[\+\d][\d\s\-\(\)]{5,}          # teléfonos

    # Fechas
    |\b(19|20)\d{2}\b                     # año suelto
    |\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}  # fecha dd/mm/yyyy
    |\b(enero|febrero|marzo|abril|mayo|junio|julio|agosto|
        septiembre|octubre|noviembre|diciembre)\b
    |\b(january|february|march|april|june|july|august|
        september|october|november|december)\b
    |\b(presente|present|actual|current|actualidad)\b

    # Educación
    |\b(bachelor|degree|master|phd|doctorate|mba|bsc|msc|
        licenciatura|ingeniería\s+técnica|ingeniería\s+en|
        universidad|facultad|college|school|institute|
        máster\s+en|grado\s+en|diplomatura)\b

    # Frases de empresa/beneficios (cualquier idioma)
    |\b(our|we\s+are|we\s+offer|join\s+us|about\s+us|the\s+role)
    |\b(nuestro|nosotros|somos|ofrecemos|únete|sobre\s+nosotros)
    |\b(salary|salario|beneficios|benefits|remote|remoto|híbrido|hybrid)

    # Líneas demasiado largas para ser un título
    # (se controla por len(words) pero este es un safety net)
    |.{80,}
    """,
    re.IGNORECASE | re.VERBOSE,
)

# ─── Palabras que CONFIRMAN que una línea es un título de puesto ──────────────

TITLE_CONFIRMS = re.compile(
    r"""
    # Roles de tecnología
    \b(developer|engineer|architect|programmer|analyst|scientist|
       devops|sre|dba|frontend|backend|fullstack|full.stack|
       desarrollador|ingeniero|programador|analista|arquitecto)

    # Roles de diseño
    |\b(designer|ux|ui|creative|illustrator|diseñador|maquetador)

    # Roles de negocio / ventas / marketing
    |\b(manager|director|coordinator|specialist|consultant|advisor|
        executive|officer|representative|associate|
        responsable|coordinador|especialista|consultor|
        comercial|delegado|account\s+manager|key\s+account)

    # Roles de operaciones / admin / RRHH
    |\b(administrator|assistant|supervisor|operator|technician|
        administrativo|auxiliar|técnico|operario|operador|
        recepcionista|secretari[oa])

    # Roles de salud / legal / educación
    |\b(doctor|médico|enfermero|farmacéutico|fisioterapeuta|
        abogado|jurídico|notario|juez|
        profesor|docente|maestro|tutor|investigador)

    # Roles de logística / industria
    |\b(logístic[oa]|almacén|conductor|repartidor|operari[oa]|
        mecánico|electricista|instalador|técnico\s+de)

    # Seniority (refuerza que es un título)
    |\b(senior|junior|jr|sr|lead|staff|principal|
        head\s+of|chief|jefe\s+de|responsable\s+de)
    """,
    re.IGNORECASE | re.VERBOSE,
)

# ─── Niveles de seniority para comparar ──────────────────────────────────────

SENIORITY_LEVELS = {
    "intern": 0, "becario": 0, "prácticas": 0,
    "junior": 1, "jr": 1,
    "mid": 2, "mid-level": 2, "ssr": 2,
    "senior": 3, "sr": 3,
    "lead": 4, "tech lead": 4,
    "staff": 4, "principal": 5,
    "head": 5, "jefe": 5,
    "director": 6, "chief": 6, "cto": 6, "cio": 6,
}


def _clean_line(line: str) -> str:
    """Elimina emojis, bullets y espacios extra."""
    line = re.sub(r'[^\w\s\+\#\.\-\/]', ' ', line)  # quita emojis y símbolos
    line = re.sub(r'^[\s\-•*·▸]+', '', line)          # quita bullets
    return re.sub(r'\s+', ' ', line).strip()


def _is_valid_title(line: str) -> bool:
    """Determina si una línea puede ser un título de puesto."""
    clean = _clean_line(line)
    words = clean.split()

    # Longitud: entre 1 y 7 palabras
    if not (1 <= len(words) <= 7):
        return False

    # No puede ser ruido
    if NOT_A_TITLE.search(clean):
        return False

    # Debe tener al menos una palabra que confirme que es un título
    if not TITLE_CONFIRMS.search(clean):
        return False

    return True


# ─── Extracción de título de la OFERTA ───────────────────────────────────────

def extract_job_title_from_offer(text: str) -> Optional[str]:
    """
    El título de la oferta casi siempre está:
    1. En las primeras 10 líneas no vacías
    2. Es la línea más corta que confirma ser un título
    """
    lines = [l.strip() for l in text.splitlines() if l.strip()]

    candidates = []
    for line in lines[:15]:
        if _is_valid_title(line):
            candidates.append(_clean_line(line))

    if not candidates:
        return None

    # El título suele ser el más corto y específico
    return min(candidates, key=lambda x: len(x))


# ─── Extracción de títulos del CV ─────────────────────────────────────────────

# Patrón para detectar la línea de puesto dentro de experiencia:
# "Frontend Developer en Empresa" / "Developer | Empresa" / "Developer @ Empresa"
EXPERIENCE_ENTRY = re.compile(
    r'^(.{3,50}?)\s*(?:en\s+|at\s+|@\s*|[|\-–—])\s*[A-ZÁÉÍÓÚÑ\w]',
)

CV_EXPERIENCE_SECTION = re.compile(
    r'\b(experiencia\s+(laboral|profesional|de\s+trabajo)?|'
    r'work\s+experience|employment|career|professional\s+experience|'
    r'trayectoria\s+profesional|historial\s+laboral)\b',
    re.IGNORECASE,
)


def extract_job_titles_from_cv(text: str) -> list[str]:
    """
    Extrae hasta 3 títulos del CV:
    1. Título/headline del encabezado
    2. Hasta 2 puestos de la sección de experiencia
    """
    lines = [l.strip() for l in text.splitlines() if l.strip()]
    titles = []

    # 1. Título del header (primeras 6 líneas)
    for line in lines[:6]:
        if _is_valid_title(line):
            titles.append(_clean_line(line))
            break

    # 2. Puestos en experiencia
    in_experience = False
    found = 0

    for line in lines:
        if CV_EXPERIENCE_SECTION.search(line):
            in_experience = True
            continue

        if not in_experience or found >= 2:
            continue

        # Formato "Título en/at/| Empresa"
        m = EXPERIENCE_ENTRY.match(line)
        if m:
            candidate = _clean_line(m.group(1))
            if _is_valid_title(candidate) and candidate not in titles:
                titles.append(candidate)
                found += 1
            continue

        # Formato: línea sola que es un título (siguiente línea es la empresa)
        if _is_valid_title(line):
            candidate = _clean_line(line)
            if candidate not in titles:
                titles.append(candidate)
                found += 1

    return titles[:3]


# ─── Normalización ────────────────────────────────────────────────────────────

def _normalize(title: str) -> str:
    """Elimina seniority y palabras funcionales para comparar el rol puro."""
    t = title.lower()
    for level in SENIORITY_LEVELS:
        t = re.sub(r'\b' + re.escape(level) + r'\b', '', t)
    t = re.sub(
        r'\b(de|el|la|los|las|un|una|the|a|an|of|for|and|y|e|en|at)\b', '', t
    )
    return re.sub(r'\s+', ' ', t).strip()


def _extract_seniority(title: str) -> Optional[str]:
    t = title.lower()
    # Busca de más específico a menos
    for level in sorted(SENIORITY_LEVELS, key=lambda x: -len(x)):
        if re.search(r'\b' + re.escape(level) + r'\b', t):
            return level
    return None


# ─── Score y match ────────────────────────────────────────────────────────────

def calculate_job_title_match(
    cv_text: str,
    job_text: str,
    embedding_model=None,
) -> dict:
    offer_title = extract_job_title_from_offer(job_text)
    cv_titles   = extract_job_titles_from_cv(cv_text)

    if not offer_title:
        return {
            "score": 50, "label": "No detectado",
            "offer_title": None, "cv_titles": cv_titles,
            "best_match": cv_titles[0] if cv_titles else None,
            "seniority_match": None, "offer_seniority": None,
            "cv_seniority": None,
            "detail": "No se pudo extraer el título de la oferta.",
        }

    if not cv_titles:
        return {
            "score": 0, "label": "No detectado en CV",
            "offer_title": offer_title, "cv_titles": [],
            "best_match": None,
            "seniority_match": None, "offer_seniority": None,
            "cv_seniority": None,
            "detail": "No se encontraron títulos de puesto en el CV.",
        }

    offer_norm   = _normalize(offer_title)
    offer_senior = _extract_seniority(offer_title)

    best_score    = 0.0
    best_cv_title = cv_titles[0]
    best_senior   = None

    for cv_title in cv_titles:
        cv_norm   = _normalize(cv_title)
        cv_senior = _extract_seniority(cv_title)

        if offer_norm == cv_norm:
            score = 1.0
        elif embedding_model:
            e1    = embedding_model.encode([offer_norm])
            e2    = embedding_model.encode([cv_norm])
            score = float(cosine_similarity(e1, e2)[0][0])
        else:
            o_words = set(offer_norm.split())
            c_words = set(cv_norm.split())
            score   = len(o_words & c_words) / max(len(o_words), 1)

        if score > best_score:
            best_score    = score
            best_cv_title = cv_title
            best_senior   = cv_senior

    # Seniority bonus/penalty
    seniority_match = None
    seniority_bonus = 0

    if offer_senior and best_senior:
        diff = abs(
            SENIORITY_LEVELS.get(offer_senior, 0) -
            SENIORITY_LEVELS.get(best_senior, 0)
        )
        if diff == 0:
            seniority_match, seniority_bonus = "exact", 5
        elif diff == 1:
            seniority_match, seniority_bonus = "close", 0
        else:
            seniority_match, seniority_bonus = "mismatch", -10

    final_score = min(100, max(0, round(best_score * 100 + seniority_bonus)))

    if final_score >= 85:   label = "Excelente"
    elif final_score >= 65: label = "Bueno"
    elif final_score >= 40: label = "Parcial"
    else:                   label = "Bajo"

    return {
        "score":           final_score,
        "label":           label,
        "offer_title":     offer_title,
        "cv_titles":       cv_titles,
        "best_match":      best_cv_title,
        "seniority_match": seniority_match,
        "offer_seniority": offer_senior,
        "cv_seniority":    best_senior,
        "detail": (
            f"Oferta busca '{offer_title}'. "
            f"Tu título más cercano: '{best_cv_title}' ({final_score}% match)."
        ),
    }