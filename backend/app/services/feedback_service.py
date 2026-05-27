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
        level, summary = "Excelente", "Tu CV está entre los mejores. Solo detalles finos pueden mejorar."
    elif overall >= 70:
        level, summary = "Sólido", "Gran alineación. Pequeños ajustes te harán destacar aún más."
    elif overall >= 55:
        level, summary = "Aceptable", "Buen potencial, pero necesitas más keywords específicas."
    elif overall >= 40:
        level, summary = "Mejorable", "Aceptable, pero los ATS pueden filtrarte por falta de términos clave."
    elif overall >= 25:
        level, summary = "Débil", "Tu CV apenas supera filtros básicos. Revisión profunda necesaria."
    else:
        level, summary = "Crítico", "El CV no coincide con los requisitos. El ATS no te considera candidato. Reescribe desde cero."
    
    recommendations = []
    
    # Si los sectores son diferentes, añadir recomendación especial
    if cv_sector_info.get("sector") != job_sector and cv_sector_info.get("sector") != "general":
        recommendations.append({
            "priority": "Alta",
            "action": f"Transición de sector: {cv_sector_info.get('sector')} → {job_sector}",
            "examples": [f"Tu CV está orientado a {cv_sector_info.get('sector')}. La oferta requiere {job_sector}."],
            "impact": "Adapta tu CV al lenguaje y habilidades del nuevo sector"
        })
    
    if scores.get('keyword_exact', 0) < 50:
        recommendations.append({
            "priority": "Alta", "action": "Añadir sugerencias clave de la oferta",
            "examples": missing_terms[:5], "impact": "Aumentará el match con el ATS"
        })
    
    # Recomendación de habilidades técnicas faltantes
    if scores.get('technical_skills', 0) < 70:
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
        
    if not recommendations and overall < 75:
        fallback_examples = (missing_tech_skills or missing_terms or [])[:5]
        recommendations.append({
            "priority": "Media",
            "action": "Mejorar la alineación general con la oferta",
            "examples": fallback_examples,
            "impact": "Tu CV necesita más keywords específicas para destacar en este ATS"
        })

    # Añadir siempre si action_verbs es bajo
    if scores.get('action_verbs', 100) < 40:
        recommendations.append({
            "priority": "Media",
            "action": "Usar más verbos de impacto en tu CV",
            "examples": ["desarrollé", "lideré", "implementé", "optimicé", "reduje", "aumenté"],
            "impact": "Los verbos de acción mejoran el score ATS y llaman la atención del recruiter"
        })

    # Añadir siempre si quantified_achievements es bajo
    if scores.get('quantified_achievements', 100) < 30:
        recommendations.append({
            "priority": "Media",
            "action": "Añadir logros cuantificables con números",
            "examples": ["↑30% de rendimiento", "10k usuarios", "reducción de 2s en carga", "equipo de 5 personas"],
            "impact": "Los logros con datos concretos aumentan la credibilidad y el score ATS"
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