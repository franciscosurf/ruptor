from typing import Dict, Tuple, Any, List
from app.services.keyword_service import extract_technical_skills

def generate_detailed_feedback(
    scores: Dict[str, float], missing_terms: List[str], matched_terms: List[str],
    cv_text: str, job_text: str, cv_sector_info: Dict[str, Any], job_sector_info: Dict[str, Any],
    experience_cv: int, experience_job: int, education_cv: Tuple[str, int], education_job: Tuple[str, int],
    confidence: float, sector_comparison: Dict[str, Any] = None, culture_phrases=None, missing_tech_skills=None
) -> Dict[str, Any]:
    overall = scores['overall']
    job_sector = job_sector_info.get("sector", "general")
    
    # Niveles de puntuación
    if overall >= 85:
        level, summary = "¡Candidato Estrella! ⭐", "Tu CV está optimizado. Tienes altísimas probabilidades de pasar el filtro y llegar a entrevista."
    elif overall >= 70:
        level, summary = "Perfil Sólido 🚀", "Estás muy cerca de la perfección. Unos pequeños ajustes en las palabras clave y tu perfil será irresistible."
    elif overall >= 55:
        level, summary = "Potencial Alto 💡", "Tu experiencia encaja, pero el ATS necesita ver términos más específicos. Añade las palabras clave sugeridas abajo para subir tu score."
    elif overall >= 40:
        level, summary = "En proceso de mejora 🛠️", "El ATS tiene dudas sobre tu perfil. Necesitas incluir terminología técnica clave de la oferta para ganar visibilidad."
    elif overall >= 25:
        level, summary = "Requiere atención ⚠️", "Revisa las recomendaciones de 'Skills' y 'Sugerencias' para no ser descartado. Tu CV actual no está comunicando bien tu valor."
    else:
        level, summary = "Zona de Riesgo 🛑", "Actualmente, este CV no es compatible con la oferta. No pierdas tiempo aplicando ahora; reconstruye tu sección de experiencia primero."

    recommendations = []

    # ------------------------------------------------------------------
    # 1. Recomendaciones basadas en habilidades técnicas faltantes (missing_tech_skills)
    # ------------------------------------------------------------------
    if missing_tech_skills:
        recommendations.append({
            "priority": "Alta",
            "action": f"Incluye habilidades específicas del sector {job_sector} en tu CV",
            "examples": missing_tech_skills[:6],   # máximo 6 ejemplos
            "impact": "Los ATS buscan estas habilidades para filtrar candidatos"
        })
    
    # ------------------------------------------------------------------
    # 2. Recomendaciones basadas en términos clave faltantes (missing_terms)
    # ------------------------------------------------------------------
    elif scores.get('keyword_exact', 0) < 50 and missing_terms:
        recommendations.append({
            "priority": "Alta",
            "action": "Añade estas palabras clave de la oferta a tu CV",
            "examples": missing_terms[:6],
            "impact": "Aumentará la coincidencia semántica con el ATS"
        })
    
    # ------------------------------------------------------------------
    # 3. Recomendaciones por bajo uso de verbos de acción
    # ------------------------------------------------------------------
    if scores.get('action_verbs', 100) < 40:
        # Ejemplos generales de verbos de acción (comunes a cualquier sector)
        verb_examples = [
            "lideré", "optimicé", "implementé", "diseñé", 
            "coordiné", "automaticé", "reduje", "aumenté"
        ]
        recommendations.append({
            "priority": "Media",
            "action": "Usa más verbos de impacto en tu CV",
            "examples": verb_examples,
            "impact": "Los verbos de acción mejoran el score ATS y llaman la atención del reclutador"
        })
    
    # ------------------------------------------------------------------
    # 4. Recomendaciones por falta de logros cuantificados
    # ------------------------------------------------------------------
    if scores.get('quantified_achievements', 100) < 30:
        quantified_examples = [
            "↑30% de rendimiento", "10k usuarios atendidos",
            "reducción de 2 días en el plazo", "equipo de 5 personas"
        ]
        recommendations.append({
            "priority": "Media",
            "action": "Añade logros cuantificables con números",
            "examples": quantified_examples,
            "impact": "Los logros con datos concretos aumentan la credibilidad y el score ATS"
        })
    
    # ------------------------------------------------------------------
    # 5. Recomendaciones por experiencia insuficiente
    # ------------------------------------------------------------------
    if experience_job > 0 and experience_cv < experience_job:
        recommendations.append({
            "priority": "Alta",
            "action": "Destaca más experiencia relevante",
            "examples": [f"La oferta pide {experience_job} años, tu CV muestra {experience_cv} años"],
            "impact": "Incluye proyectos freelance, voluntariados o prácticas que sumen años equivalentes"
        })
    
    # ------------------------------------------------------------------
    # 6. Recomendaciones por educación insuficiente
    # ------------------------------------------------------------------
    if education_job[1] > education_cv[1]:
        recommendations.append({
            "priority": "Media",
            "action": f"Alinea tu nivel educativo al requerido ({education_job[0]})",
            "examples": [f"Se requiere {education_job[0]}, tu nivel detectado es {education_cv[0]}"],
            "impact": "Destaca formación complementaria o certificaciones que equiparen el nivel"
        })
    
    # ------------------------------------------------------------------
    # 7. Recomendación por transición de sector (si los sectores difieren)
    # ------------------------------------------------------------------
    cv_sector = cv_sector_info.get("sector", "general")
    if cv_sector != job_sector and cv_sector != "general":
        recommendations.append({
            "priority": "Alta",
            "action": f"Adapta tu CV al sector {job_sector}",
            "examples": [f"Tu CV está orientado a {cv_sector}. La oferta requiere {job_sector}."],
            "impact": "Usa terminología y habilidades propias del nuevo sector"
        })
    
    # ------------------------------------------------------------------
    # 8. FALLBACK: si no hay ninguna recomendación y el score es bajo
    # ------------------------------------------------------------------
    if not recommendations and overall < 70:
        # Usamos el nombre del sector (sin hardcodear ejemplos concretos)
        recommendations.append({
            "priority": "Media",
            "action": f"Mejora la alineación general de tu CV con la oferta de {job_sector}",
            "examples": [
                "Revisa las palabras clave que aparecen en la descripción del puesto",
                "Cuantifica tus logros con números y porcentajes",
                "Usa verbos de acción al inicio de cada viñeta"
            ],
            "impact": "Estos cambios aumentarán tu puntuación ATS"
        })
    
    # ------------------------------------------------------------------
    # Procesar frases de cultura
    # ------------------------------------------------------------------
    culture_suggestions = []
    for phrase, score in (culture_phrases or []):
        culture_suggestions.append({"text": phrase, "score": score})

    # ------------------------------------------------------------------
    # Asignar puntos potenciales a cada recomendación según prioridad
    # ------------------------------------------------------------------
    points_map = {"Alta": 5, "Media": 3, "Baja": 1}
    for rec in recommendations:
        priority = rec.get("priority", "Media")
        rec["potential_points"] = points_map.get(priority, 3)

    return {
        "ats_score": overall,
        "level": level,
        "summary": summary,
        "detailed_scores": scores,
        "recommendations": recommendations,
        "priority_missing_terms": missing_terms[:10],
        "matched_terms": matched_terms[:15],
        "cv_sector": cv_sector_info,
        "job_sector": job_sector_info,
        "sector_comparison": sector_comparison,
        "experience_match": {
            "required": experience_job,
            "detected": experience_cv,
            "match": round(min(100, (experience_cv / max(experience_job, 1)) * 100), 2)
        },
        "education_match": {
            "required_level": education_job[0],
            "detected_level": education_cv[0],
            "match": round(min(100, (education_cv[1] / max(education_job[1], 1)) * 100), 2)
        },
        "confidence_score": round(confidence, 2),
        "culture_suggestions": culture_suggestions[:10]
    }