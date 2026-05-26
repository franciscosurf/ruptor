from typing import Dict, Any

from app.core.config import config

from fastapi import UploadFile

from app.utils.file_extractor import extract_text
from app.utils.language import detect_language

from app.services.keyword_service import extract_technical_skills


from app.analysis.keyword_extractor import extract_keywords_advanced
from app.services.similarity_service import (
    calculate_weighted_similarity,
    semantic_term_coverage,
)

from app.services.feedback_service import generate_detailed_feedback

from app.skills.loader import (
    detect_sector_from_text,
    compare_skills_between_sectors,
    get_relevant_skills_for_sector,
)

from app.experience_analyzer import (
    extract_experience_years,
)

from app.services.education_service import extract_education_level
from app.services.scoring_service import calculate_confidence_score
from app.services.text_scoring import extract_culture_phrases  # ← añadir este import

def get_threshold_by_sector(sector: str, mode: str = "balanced") -> float:
    """Devuelve umbral semántico según el sector"""
    thresholds = {
        "tecnologia": {"strict": 0.80, "balanced": 0.70, "flexible": 0.55},
        "administracion": {"strict": 0.75, "balanced": 0.65, "flexible": 0.50},
        "medicina": {"strict": 0.80, "balanced": 0.70, "flexible": 0.55},
        "derecho": {"strict": 0.80, "balanced": 0.70, "flexible": 0.55},
        "default": {"strict": 0.75, "balanced": 0.65, "flexible": 0.50}
    }
    sector_thresholds = thresholds.get(sector, thresholds["default"])
    return sector_thresholds.get(mode, sector_thresholds["balanced"])


async def analyze_cv_logic(
    cv_file: UploadFile,
    job_description: str,
    mode: str = "balanced"
) -> Dict[str, Any]:

    cv_text = await extract_text(cv_file)
    job_text = job_description.strip()

    if not cv_text or len(cv_text.strip()) < 50:
        return {"error": "CV vacío o muy poco texto", "ats_score": 0, "level": "Error"}
    if not job_text or len(job_text.strip()) < 50:
        return {"error": "Descripción del puesto muy corta", "ats_score": 0, "level": "Error"}

    # Idiomas
    cv_lang = detect_language(cv_text)
    job_lang = detect_language(job_text)
    main_lang = job_lang

    # Sectores
    cv_sector_info = detect_sector_from_text(cv_text)
    job_sector_info = detect_sector_from_text(job_text)
    cv_sector = cv_sector_info.get("sector", "general")
    job_sector = job_sector_info.get("sector", "general")

    # Umbrales según modo y sector
    if mode == "strict":
        config.SEMANTIC_THRESHOLD = get_threshold_by_sector(job_sector, "strict")
        config.FUZZY_THRESHOLD = 0.90
    elif mode == "flexible":
        config.SEMANTIC_THRESHOLD = get_threshold_by_sector(job_sector, "flexible")
        config.FUZZY_THRESHOLD = 0.75
    else:
        config.SEMANTIC_THRESHOLD = get_threshold_by_sector(job_sector, "balanced")
        config.FUZZY_THRESHOLD = 0.85

    # Comparación de sectores
    sector_comparison = compare_skills_between_sectors(cv_sector, job_sector, main_lang)

    # --- 1. Filtrar la oferta para obtener solo frases relevantes (señales) ---
    from app.services.text_service import extract_relevant_text
    job_text_clean = extract_relevant_text(job_text)   # texto filtrado

    from app.services.text_scoring import extract_relevant_phrases
    job_phrases = extract_relevant_phrases(job_text_clean, min_score=0.4, lang=job_lang)

    # Extraer frases de cultura/valores (sin filtrar por min_score, se incluyen todas)
    culture_phrases = extract_culture_phrases(job_text_clean, lang=job_lang)

    # Eliminar duplicados manteniendo el mayor score
    unique = {}
    for phrase, score in job_phrases:
        if phrase not in unique or score > unique[phrase]:
            unique[phrase] = score
    job_phrases = sorted(unique.items(), key=lambda x: x[1], reverse=True)[:25]

    # --- 2. Extraer términos clave del CV (KeyBERT) ---
    cv_keywords_weighted = extract_keywords_advanced(cv_text, top_n=config.TOP_N_KEYWORDS, force_lang=cv_lang)
    cv_terms = [kw for kw, _ in cv_keywords_weighted]

    # --- 3. Experiencia y educación (usar texto limpio de la oferta) ---
    experience_job = extract_experience_years(job_text_clean)
    experience_cv = extract_experience_years(cv_text)
    education_job = extract_education_level(job_text_clean)
    education_cv = extract_education_level(cv_text)

    # --- 4. Similitud semántica global (para el score general, usar frases como job_terms) ---
    job_simple_terms = [phrase for phrase, _ in job_phrases]
    similarity_scores = calculate_weighted_similarity(cv_text, job_text_clean, cv_terms, job_simple_terms)

    # --- 5. Cobertura usando frases (señales) en lugar de keywords de KeyBERT ---
    from app.services.similarity_service import semantic_phrase_coverage
    if job_phrases:
        keyword_coverage, matched_terms, missing_terms_with_context = semantic_phrase_coverage(
            cv_terms, job_phrases, job_text, threshold=config.SEMANTIC_THRESHOLD
        )
    else:
        keyword_coverage, matched_terms, missing_terms_with_context = 0.0, [], []

    missing_terms = [item["term"] for item in missing_terms_with_context]
    similarity_scores['keyword_exact'] = keyword_coverage
    similarity_scores['overall'] = round((similarity_scores['semantic'] * 0.5 + keyword_coverage * 0.5), 2)

    confidence = calculate_confidence_score(cv_text, job_text_clean)

    # --- 6. Feedback (13 argumentos) ---
    feedback = generate_detailed_feedback(
        similarity_scores,
        missing_terms,
        matched_terms,
        cv_text,
        job_text_clean,
        cv_sector_info,
        job_sector_info,
        experience_cv,
        experience_job,
        education_cv,
        education_job,
        confidence,
        sector_comparison,
        culture_phrases
    )

    # --- 7. Skills técnicas (regex) ---
    extracted_skills_cv = extract_technical_skills(cv_text)
    extracted_skills_job = extract_technical_skills(job_text_clean)

    sector_skills_suggestions = get_relevant_skills_for_sector(job_sector, main_lang, limit=10)

    return {
        **feedback,
        "missing_terms": missing_terms[:20],
        "missing_terms_with_context": missing_terms_with_context[:15],
        "cv_terms": cv_terms[:30],
        "job_terms": [phrase for phrase, _ in job_phrases][:30],
        "extracted_skills_cv": extracted_skills_cv,
        "extracted_skills_job": extracted_skills_job,
        "analysis_mode": mode,
        "sector_skills_suggestions": sector_skills_suggestions
    }
