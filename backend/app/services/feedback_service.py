from typing import Dict, Tuple
from typing import Any
from typing import List

from app.services.keyword_service import extract_technical_skills

def generate_detailed_feedback(
    scores: Dict[str, float], missing_terms: List[str], matched_terms: List[str],
    cv_text: str, job_text: str, cv_sector_info: Dict[str, Any], job_sector_info: Dict[str, Any],
    experience_cv: int, experience_job: int, education_cv: Tuple[str, int], education_job: Tuple[str, int],
    confidence: float, sector_comparison: Dict[str, Any] = None, culture_phrases=None, missing_tech_skills=None
) -> Dict[str, Any]:
    overall = scores['overall']
    job_sector = job_sector_info.get("sector", "general")
    
    if overall >= 85:
        level, summary = "Excelente", "¡Tu CV está excepcionalmente bien alineado!"
    elif overall >= 70:
        level, summary = "Muy Bueno", "Tu CV está bien optimizado. Con pequeños ajustes será excelente."
    elif overall >= 55:
        level, summary = "Bueno", "Hay buen alineamiento, pero faltan términos clave importantes."
    elif overall >= 40:
        level, summary = "Aceptable", "El CV necesita mejoras significativas en keywords y habilidades específicas."
    elif overall >= 25:
        level, summary = "Mejorable", "El CV no está bien alineado con la oferta. Considera reescribirlo completamente."
    else:
        level, summary = "Crítico", "El CV no coincide con los requisitos. Revisa la oferta y adapta tu CV radicalmente."
    
    recommendations = []
    
    # Si los sectores son diferentes, añadir recomendación especial
    if cv_sector_info.get("sector") != job_sector and cv_sector_info.get("sector") != "general":
        recommendations.append({
            "priority": "Alta",
            "action": f"Transición de sector: {cv_sector_info.get('sector')} → {job_sector}",
            "examples": [f"Tu CV está orientado a {cv_sector_info.get('sector')}. La oferta requiere {job_sector}."],
            "impact": "Adapta tu CV al lenguaje y habilidades del nuevo sector"
        })
    
    if scores.get('keyword_exact', 0) < 50 and missing_terms:
        recommendations.append({
            "priority": "Alta", "action": "Añadir sugerencias clave de la oferta",
            "examples": missing_terms[:5], "impact": "Aumentará el match con el ATS"
        })
    
    # Recomendación de habilidades técnicas faltantes
    if scores.get('technical_skills', 0) < 50:
        # Usar missing_tech_skills si se proporciona, si no, calcular con extract_technical_skills
        if missing_tech_skills:
            tech_needed = missing_tech_skills[:8]   # muestra hasta 8
        else:
            tech_needed = extract_technical_skills(job_text)[:5]
        
        if tech_needed:
            recommendations.append({
                "priority": "Alta",
                "action": "Incluir habilidades técnicas específicas",
                "examples": tech_needed,
                "impact": "Los ATS buscan skills técnicas exactas"
            })
    
    if sector_comparison and sector_comparison.get("missing_skills"):
        recommendations.append({
            "priority": "Alta", "action": f"Habilidades específicas del sector {job_sector}",
            "examples": sector_comparison.get("missing_skills", [])[:5],
            "impact": "Estas skills son estándar en el sector de la oferta"
        })
    
    if experience_job > 0 and experience_cv < experience_job:
        recommendations.append({
            "priority": "Alta", "action": "Aumentar experiencia relevante",
            "examples": [f"La oferta pide {experience_job} años, tu CV muestra {experience_cv} años"],
            "impact": "Destaca proyectos y logros equivalentes"
        })

    

    # Procesar frases de cultura
    culture_suggestions = []
    for phrase, score in (culture_phrases or []):
        culture_suggestions.append({
            "text": phrase,
            "score": score
        })
    
    return {
        "ats_score": overall, "level": level, "summary": summary, "detailed_scores": scores,
        "recommendations": recommendations, "priority_missing_terms": missing_terms[:10],
        "matched_terms": matched_terms[:15],
        "cv_sector": cv_sector_info,
        "job_sector": job_sector_info,
        "sector_comparison": sector_comparison,
        "experience_match": {"required": experience_job, "detected": experience_cv,
                            "match": round(min(100, (experience_cv / max(experience_job, 1)) * 100), 2)},
        "education_match": {"required_level": education_job[0], "detected_level": education_cv[0],
                           "match": round(min(100, (education_cv[1] / max(education_job[1], 1)) * 100), 2)},
        "confidence_score": round(confidence, 2),
        "culture_suggestions": culture_suggestions[:10]   # top 10
    }