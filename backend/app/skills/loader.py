"""
skills/loader.py - Carga dinámica de diccionarios de habilidades por sector
"""

import json
import os
import re
from typing import Dict, List, Set, Any, Optional
from pathlib import Path

# Directorio donde están los JSON
SKILLS_DIR = Path(__file__).parent

# Cache de sectores cargados
_sectors_cache: Dict[str, Dict[str, Any]] = {}

# Patrones para detectar sector
SECTOR_PATTERNS = {
    "tecnologia": re.compile(
        r'\b(python|java|javascript|react|angular|vue|docker|kubernetes|aws|azure|'
        r'developer|programmer|engineer|software|devops|api|git|sql|typescript|'
        r'programador|desarrollador|ingeniero|sistemas|tecnología)\b', 
        re.IGNORECASE
    ),
    "marketing": re.compile(
        r'\b(seo|sem|social media|content|email marketing|google ads|facebook ads|'
        r'marketing|campaign|branding|roi|kpi|conversion|analytics|community manager|'
        r'marketing|redes sociales|publicidad|campaña)\b', 
        re.IGNORECASE
    ),
    "ventas": re.compile(
        r'\b(sales|business development|account executive|account manager|'
        r'crm|negotiation|closing|pipeline|forecast|quota|prospecting|'
        r'ventas|comercial|vendedor|negociación|cierre)\b', 
        re.IGNORECASE
    ),
    "administracion": re.compile(
        r'\b(administración|administrativo|office manager|asistente administrativo|'
        r'recepcionista|secretaria|gestión administrativa|expedición|almacén|'
        r'administration|administrative|office assistant|warehouse|logistics)\b', 
        re.IGNORECASE
    ),
    "medicina": re.compile(
        r'\b(doctor|médico|enfermero|cirujano|pediatra|cardiólogo|farmacia|'
        r'clinical|paciente|diagnóstico|tratamiento|hospital|clínica|'
        r'doctor|nurse|physician|surgeon|medical|clinical)\b', 
        re.IGNORECASE
    ),
    "derecho": re.compile(
        r'\b(abogado|jurídico|legal|ley|litigio|mercantil|fiscal|penal|'
        r'notario|juez|contrato|demanda|sentencia|tribunal|'
        r'lawyer|attorney|legal|counsel|justice|court)\b', 
        re.IGNORECASE
    ),
    "educacion": re.compile(
        r'\b(profesor|docente|maestro|educador|enseñanza|pedagogía|didáctica|'
        r'curriculum|alumno|estudiante|universidad|academia|'
        r'teacher|professor|educator|school|university|academic)\b', 
        re.IGNORECASE
    ),
    "finanzas": re.compile(
        r'\b(finanzas|finance|accounting|contabilidad|auditoría|audit|tax|'
        r'impuestos|treasury|tesorería|investment|banking|insurance|'
        r'finance|accounting|audit|tax|treasury|investment|banking)\b', 
        re.IGNORECASE
    ),
    "ingenieria": re.compile(
        r'\b(ingeniero|ingeniería|civil|mecánico|eléctrico|químico|industrial|'
        r'autocad|solidworks|matlab|simulación|cálculo|estructuras|'
        r'engineer|engineering|civil|mechanical|electrical|chemical|industrial)\b', 
        re.IGNORECASE
    ),
    "diseno": re.compile(
        r'\b(diseñador|designer|ux|ui|graphic design|diseño gráfico|web design|'
        r'ilustrador|photoshop|illustrator|figma|sketch|adobe xd|'
        r'designer|ux|ui|graphic design|illustrator|photoshop|figma)\b', 
        re.IGNORECASE
    ),
    "logistica": re.compile(
        r'\b(logística|almacén|cadena de suministro|supply chain|transporte|'
        r'distribución|inventario|stock|warehouse|depósito|envíos|recepción|'
        r'logistics|supply chain|warehouse|transportation|distribution)\b', 
        re.IGNORECASE
    ),
    "rrhh": re.compile(
        r'\b(rrhh|recursos humanos|human resources|hr|talent acquisition|'
        r'reclutamiento|recruitment|onboarding|training|performance|payroll|'
        r'human resources|hr|recruitment|training|performance|payroll)\b', 
        re.IGNORECASE
    ),
    "atencion_cliente": re.compile(
        r'\b(atención al cliente|customer service|servicio al cliente|call center|'
        r'soporte|support|asistente|telefonista|'
        r'customer service|customer support|call center|help desk)\b', 
        re.IGNORECASE
    ),
}


def load_skill_sector(sector: str) -> Dict[str, Any]:
    """
    Carga un archivo JSON de habilidades por sector.
    Usa caché para no leer el disco cada vez.
    """
    if sector in _sectors_cache:
        return _sectors_cache[sector]
    
    json_path = SKILLS_DIR / f"{sector}.json"
    
    if not json_path.exists():
        # Si no existe el sector específico, cargar general.json
        json_path = SKILLS_DIR / "general.json"
    
    try:
        with open(json_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
            _sectors_cache[sector] = data
            return data
    except Exception as e:
        print(f"Error cargando {sector}.json: {e}")
        # Fallback a general.json
        with open(SKILLS_DIR / "general.json", 'r', encoding='utf-8') as f:
            data = json.load(f)
            _sectors_cache["general"] = data
            return data


def get_skill_sector(sector: str, language: str = "en") -> Set[str]:
    """
    Devuelve el conjunto de habilidades para un sector e idioma.
    """
    data = load_skill_sector(sector)
    skills = data.get("skills", {}).get(language, [])
    return set(skills)


def detect_sector_from_text(text: str) -> Dict[str, Any]:
    """
    Detecta el sector más probable del texto.
    Retorna: {"sector": str, "confidence": int, "all_scores": dict}
    """
    text_lower = text.lower()
    scores = {}
    
    for sector, pattern in SECTOR_PATTERNS.items():
        matches = pattern.findall(text_lower)
        score = len(matches) * 2
        scores[sector] = score
    
    if scores:
        best_sector = max(scores, key=scores.get)
        best_score = scores[best_sector]
        if best_score > 0:
            return {
                "sector": best_sector,
                "confidence": min(100, best_score),
                "all_scores": scores
            }
    
    return {"sector": "general", "confidence": 0, "all_scores": scores}


def get_all_sectors() -> List[str]:
    """
    Devuelve la lista de todos los sectores disponibles.
    """
    sectors = []
    for file in SKILLS_DIR.glob("*.json"):
        if file.stem != "general":
            sectors.append(file.stem)
    return sectors


def get_relevant_skills_for_sector(sector: str, language: str = "en", limit: int = 20) -> List[str]:
    """
    Devuelve las skills más relevantes para un sector.
    """
    skills = get_skill_sector(sector, language)
    return list(skills)[:limit]


def compare_skills_between_sectors(
    cv_sector: str, 
    job_sector: str, 
    language: str = "en"
) -> Dict[str, Any]:
    """
    Compara las skills entre dos sectores (CV vs Oferta).
    Útil para mostrar qué habilidades específicas del sector de la oferta
    no están presentes en el sector del CV.
    """
    cv_skills = get_skill_sector(cv_sector, language)
    job_skills = get_skill_sector(job_sector, language)
    
    # Skills que el CV tiene del sector de la oferta
    common = cv_skills & job_skills
    
    # Skills que el CV NO tiene pero la oferta pide
    missing = job_skills - cv_skills
    
    # Skills que el CV tiene pero la oferta no pide (menos relevantes)
    extra = cv_skills - job_skills
    
    return {
        "cv_sector": cv_sector,
        "job_sector": job_sector,
        "total_job_skills": len(job_skills),
        "matched_skills": len(common),
        "missing_skills": list(missing)[:20],
        "missing_count": len(missing),
        "match_percentage": round(len(common) / len(job_skills) * 100, 2) if job_skills else 0,
        "extra_skills": list(extra)[:10]
    }