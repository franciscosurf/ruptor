"""
text_scoring.py - Sistema avanzado de scoring de frases basado en 4 señales.
Funciona en español e inglés, cualquier sector.
Devuelve solo el texto filtrado (compatible con la interfaz anterior).
"""

import re
from typing import List, Tuple, Dict, Optional

# ============================================================================
# Configuración de ponderaciones por defecto
# ============================================================================
DEFAULT_WEIGHTS = {
    "technical": 0.35,      # Experiencia técnica y ámbito de trabajo
    "teamwork": 0.25,       # Trabajo en equipo y enfoque multidisciplinar
    "culture": 0.20,        # Cultura de empresa y mentalidad
    "level": 0.20           # Nivel técnico específico (seniority)
}

# ============================================================================
# Señales para cada dimensión (bilingüe)
# ============================================================================

TECHNICAL_SIGNALS = re.compile(
    r"""
    # Inglés
    \b(react|angular|vue|typescript|javascript|webpack|api|rest|graphql|node)
    |\b(python|java|sql|mongodb|docker|kubernetes|aws|azure|gcp)
    |\b(frontend|backend|fullstack|cloud|devops|ci/cd|testing|jest|vitest)
    |\b(performance|optimization|scalability|microservices|serverless)
    |\b(banking\s+platform|millions\s+of\s+users|high\s+traffic|critical\s+systems)
    |\b(experience\s+with\s+(?:\w+\s+){1,3}(?:stack|framework|library|tool))
    |\b(worked\s+on\s+(?:large|complex|high\.scale|enterprise))
    # Español
    |\b(react|angular|vue|typescript|javascript|webpack|api|rest|graphql|node)
    |\b(python|java|sql|mongodb|docker|kubernetes|aws|azure|gcp)
    |\b(frontend|backend|fullstack|nube|devops|ci/cd|testing|jest|vitest)
    |\b(rendimiento|optimización|escalabilidad|microservicios|serverless)
    |\b(plataforma\s+bancaria|millones\s+de\s+usuarios|alto\s+tráfico|sistemas\s+críticos)
    |\b(experiencia\s+con\s+(?:el\s+)?(?:stack|framework|librería|herramienta))
    |\b(trabajado\s+en\s+(?:grandes|complejos|de\s+alta\s+escala|empresariales))
    """,
    re.IGNORECASE | re.VERBOSE
)

TEAMWORK_SIGNALS = re.compile(
    r"""
    # Inglés
    \b(squad|tribe|collective|cross.functional|cross.disciplinary|multidisciplinary)
    |\b(collaborat(?:e|ion|ing)|partner|cooperat|teamwork|together)
    |\b(product\s+managers?|marketers?|designers?|data\s+analysts?|business\s+analysts?)
    |\b(working\s+(?:closely|hand.in.hand)|pair\s+programming|code\s+reviews)
    |\b(share\s+knowledge|mentor|teach|learn\s+from\s+others)
    |\b(agile|scrum|kanban|stand.up|retrospective|sprint)
    # Español
    |\b(equipo|squad|tribu|colectivo|multidisciplinar|cross.funcional)
    |\b(colabor(?:ar|ación|ando)|cooperar|trabajo\s+en\s+equipo|juntos)
    |\b(product\s+owners|marketing|diseñadores|analistas\s+de\s+datos|analistas\s+de\s+negocio)
    |\b(trabajar\s+(?:codo\s+con\s+codo|estrechamente)|revisión\s+de\s+código|programación\s+en\s+pares)
    |\b(compartir\s+conocimiento|mentorizar|enseñar|aprender\s+de\s+otros)
    |\b(ágil|scrum|kanban|daily|retrospectiva|sprint)
    """,
    re.IGNORECASE | re.VERBOSE
)

CULTURE_SIGNALS = re.compile(
    r"""
    # Inglés
    \b(growth\s+mindset|passion|curiosity|learn\s+new\s+things|continuous\s+learning)
    |\b(empathy|inclusive|diversity|belonging|respect|open.minded)
    |\b(accessibility|a11y|inclusive\s+design|user\s+experience\s+for\s+all)
    |\b(customer\s+obsessed|user.focused|make\s+an\s+impact|change\s+lives)
    |\b(we're\s+not\s+about\s+selling|solve\s+problems|magical\s+moments)
    |\b(creativity|innovation|experimentation|feedback\s+culture)
    # Español
    |\b(mentalidad\s+de\s+crecimiento|pasión|curiosidad|aprender\s+nuevas\s+cosas|aprendizaje\s+continuo)
    |\b(empatía|inclusivo|diversidad|pertenencia|respeto|mente\s+abierta)
    |\b(accesibilidad|diseño\s+inclusivo|experiencia\s+de\s+usuario\s+para\s+todos)
    |\b(obsesionado\s+por\s+el\s+cliente|enfocado\s+en\s+el\s+usuario|generar\s+impacto|cambiar\s+vidas)
    |\b(no\s+se\s+trata\s+de\s+vender|resolver\s+problemas|momentos\s+mágicos)
    |\b(creatividad|innovación|experimentación|cultura\s+de\s+retroalimentación)
    """,
    re.IGNORECASE | re.VERBOSE
)

LEVEL_SIGNALS = re.compile(
    r"""
    # Inglés
    \b(L50|L\d+|level\s+\d+|senior|lead|staff|principal)
    |\b(engineering\s+progression\s+framework|career\s+growth|promotion)
    |\b(\d+\+?\s+years?\s+of\s+experience|\d+\+?\s+years?\s+in\s+the\s+industry)
    |\b(mentor\s+juniors|technical\s+leadership|architect|design\s+solutions)
    |\b(owning\s+development\s+from\s+start\s+to\s+finish|end.to.end)
    |\b(high\s+quality|code\s+standards|best\s+practices|test\s+automation)
    # Español
    |\b(L50|L\d+|nivel\s+\d+|senior|líder|staff|principal)
    |\b(progresión\s+profesional|carrera\s+profesional|promoción)
    |\b(\d+\+?\s+años?\s+de\s+experiencia|\d+\+?\s+años?\s+en\s+el\s+sector)
    |\b(mentorizar\s+juniors|liderazgo\s+técnico|arquitecto|diseñar\s+soluciones)
    |\b(desarrollo\s+de\s+extremo\s+a\s+extremo|de\s+principio\s+a\s+fin)
    |\b(alta\s+calidad|estándares\s+de\s+código|buenas\s+prácticas|pruebas\s+automáticas)
    """,
    re.IGNORECASE | re.VERBOSE
)

# Señales de empresa (restan importancia)
COMPANY_SIGNALS = re.compile(
    r"""
    \b(what\s+we\s+offer|benefits|about\s+us|our\s+culture|why\s+join\s+us)
    |\b(salary|bonus|pension|insurance|canteen|gym|parking|flexible\s+working)
    |\b(diversity|inclusion|equal\s+opportunity|how\s+to\s+apply|send\s+your\s+cv)
    |\b(ofrecemos|beneficios|sobre\s+nosotros|cultura|proceso\s+de\s+selección)
    |\b(salario|bonus|pensión|seguro|comedor|gimnasio|parking|jornada\s+flexible)
    |\b(diversidad|inclusión|igualdad\s+de\s+oportunidades|cómo\s+aplicar|envía\s+tu\s+cv)
    """,
    re.IGNORECASE | re.VERBOSE
)

# Líneas que son listas de skills técnicas (score máximo)
SKILL_LIST_PATTERN = re.compile(
    r"""
    ^[\s\-•*·▸▹◦‣⁃\d\.]*            # bullet opcional
    (?:
        [A-Z][a-zA-Z0-9+#.\-/]{2,}   # Nombre técnico (TypeScript, React)
        |[a-z][a-zA-Z0-9+#.\-/]{2,}  # herramienta (vitest, pnpm)
        |\d+\+?\s*(?:años?|years?)   # "3+ años"
    )
    (?:[\s,;:·]+[a-zA-Z0-9+#.\-/]+)*  # más términos separados por comas
    (?:\s*\(opcional\))?\s*$
    """,
    re.VERBOSE
)


def score_sentence(sentence: str, lang: str = "en") -> float:
    """
    Evalúa una frase y devuelve un score entre 0 y 1.
    El idioma (lang) puede ser 'en' o 'es'.
    """
    s = sentence.strip()
    if not s or len(s) < 3:
        return 0.0

    if SKILL_LIST_PATTERN.match(s):
        return 1.0

    company_penalty = 0.3 if COMPANY_SIGNALS.search(s) else 0.0

    # Para español, dar un poco más de peso a las señales en español
    if lang == "es":
        base = 0.4
    else:
        base = 0.3
        
    tech = min(1.0, base + len(TECHNICAL_SIGNALS.findall(s)) * 0.1)
    team = min(1.0, base + len(TEAMWORK_SIGNALS.findall(s)) * 0.1)
    culture = min(1.0, base + len(CULTURE_SIGNALS.findall(s)) * 0.1)
    level = min(1.0, base + len(LEVEL_SIGNALS.findall(s)) * 0.1)

    total = (
        tech * DEFAULT_WEIGHTS["technical"] +
        team * DEFAULT_WEIGHTS["teamwork"] +
        culture * DEFAULT_WEIGHTS["culture"] +
        level * DEFAULT_WEIGHTS["level"]
    )
    total = total * (1 - company_penalty)
    return min(1.0, max(0.0, total))



def extract_relevant_text(text: str, min_score: float = 0.45, sector: str = "general", lang: str = "en") -> str:
    """
    Extrae líneas relevantes, repite las de alto valor y devuelve el texto filtrado.
    """
    lines = text.splitlines()
    scored_lines = []
    for line in lines:
        line = line.strip()
        if not line:
            continue
        score = score_sentence(line, lang=lang)
        if score >= min_score:
            repeats = 3 if score >= 0.9 else (2 if score >= 0.7 else 1)
            scored_lines.extend([line] * repeats)
    if not scored_lines:
        return " ".join(text.split()[:500])
    return "\n".join(scored_lines)[:15000]

def extract_relevant_phrases(text: str, min_score: float = 0.45, lang: str = "en") -> List[Tuple[str, float]]:
    """
    Devuelve una lista de (frase, score) para las líneas que superan el umbral.
    """
    lines = text.splitlines()
    phrases = []
    for line in lines:
        line = line.strip()
        if not line:
            continue
        score = score_sentence(line, lang=lang)
        if score >= min_score:
            phrases.append((line, score))
    return phrases