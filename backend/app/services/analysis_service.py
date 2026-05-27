from typing import Dict, Any

from app.core.config import config


from fastapi import UploadFile

from app.utils.file_extractor import extract_text
from app.utils.language import detect_language

from app.services.keyword_service import extract_technical_skills


from app.analysis.keyword_extractor import extract_keywords_advanced
from app.services.similarity_service import (
    calculate_weighted_similarity
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
from app.services.text_scoring import extract_culture_phrases

from app.services.recruiter_visibility import calculate_recruiter_visibility

from app.services.text_service import extract_relevant_text
from app.services.text_scoring import extract_relevant_phrases

from app.services.job_title_matcher import calculate_job_title_match
from app.core.models import get_embedding_model

from app.services.action_verbs import calculate_action_verbs_score
from app.services.quantified_achievements import calculate_quantified_achievements_score
from app.services.similarity_service import semantic_phrase_coverage


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

    # ── Idiomas (cada texto en el suyo) ──────────────────────────────────────
    cv_lang  = detect_language(cv_text)
    job_lang = detect_language(job_text)

    # ── Sectores ──────────────────────────────────────────────────────────────
    cv_sector_info  = detect_sector_from_text(cv_text)
    job_sector_info = detect_sector_from_text(job_text)
    cv_sector  = cv_sector_info.get("sector", "general")
    job_sector = job_sector_info.get("sector", "general")

    # ── Umbrales ──────────────────────────────────────────────────────────────
    if mode == "strict":
        config.SEMANTIC_THRESHOLD = get_threshold_by_sector(job_sector, "strict")
        config.FUZZY_THRESHOLD = 0.90
    elif mode == "flexible":
        config.SEMANTIC_THRESHOLD = get_threshold_by_sector(job_sector, "flexible")
        config.FUZZY_THRESHOLD = 0.75
    else:
        config.SEMANTIC_THRESHOLD = get_threshold_by_sector(job_sector, "balanced")
        config.FUZZY_THRESHOLD = 0.85

    sector_comparison = compare_skills_between_sectors(cv_sector, job_sector, job_lang)

    # ── Filtrar oferta ────────────────────────────────────────────────────────
    job_text_clean = extract_relevant_text(job_text)
    job_phrases    = extract_relevant_phrases(job_text_clean, min_score=0.4, lang=job_lang)

    # Deduplicar frases
    unique = {}
    for phrase, score in job_phrases:
        if phrase not in unique or score > unique[phrase]:
            unique[phrase] = score
    job_phrases = sorted(unique.items(), key=lambda x: x[1], reverse=True)[:25]

    # ── Keywords CV ───────────────────────────────────────────────────────────
    cv_keywords_weighted = extract_keywords_advanced(
        cv_text, top_n=config.TOP_N_KEYWORDS, force_lang=cv_lang
    )
    cv_terms = [kw for kw, _ in cv_keywords_weighted]

    # ── Experiencia y educación ───────────────────────────────────────────────
    experience_job = extract_experience_years(job_text_clean)
    experience_cv  = extract_experience_years(cv_text)
    education_job  = extract_education_level(job_text_clean)
    education_cv   = extract_education_level(cv_text)

    # ── Skills técnicas ───────────────────────────────────────────────────────
    extracted_skills_cv  = extract_technical_skills(cv_text)
    extracted_skills_job = extract_technical_skills(job_text_clean)  # original para no perder skills

    cv_skills_set  = set(extracted_skills_cv)
    job_skills_set = set(extracted_skills_job)
    missing_tech_skills = list(job_skills_set - cv_skills_set)

    keyword_exact = (
        len(cv_skills_set & job_skills_set) / len(job_skills_set) * 100
        if job_skills_set else 0.0
    )

    # ── Similitud semántica ───────────────────────────────────────────────────
    job_simple_terms = [phrase for phrase, _ in job_phrases]
    similarity_scores = calculate_weighted_similarity(
        cv_text, job_text_clean, cv_terms, job_simple_terms
    )

    # ── Coverage semántico ────────────────────────────────────────────────────
    if job_phrases:
        keyword_coverage, matched_terms, missing_terms_with_context = semantic_phrase_coverage(
            cv_terms, job_phrases, job_text, threshold=config.SEMANTIC_THRESHOLD
        )
    else:
        keyword_coverage, matched_terms, missing_terms_with_context = 0.0, [], []

    missing_terms = [item["term"] for item in missing_terms_with_context]

    similarity_scores['keyword_exact']            = round(keyword_exact, 2)
    similarity_scores['overall']                  = round(
        similarity_scores['semantic'] * 0.5 + keyword_coverage * 0.5, 2
    )
    similarity_scores['action_verbs']             = calculate_action_verbs_score(cv_text)
    similarity_scores['quantified_achievements']  = calculate_quantified_achievements_score(cv_text)
    similarity_scores['recruiter_visibility']     = calculate_recruiter_visibility(cv_text)

    # ── Métricas adicionales ──────────────────────────────────────────────────
    title_match          = calculate_job_title_match(cv_text, job_text, embedding_model=get_embedding_model())
    confidence           = calculate_confidence_score(cv_text, job_text_clean)
    sector_skills_suggestions = get_relevant_skills_for_sector(job_sector, job_lang, limit=10)

    # ── Cultura: siempre sobre texto ORIGINAL ─────────────────────────────────
    culture_phrases = extract_culture_phrases(job_text, lang=job_lang)


    print("="*50)
    print("DEBUG: keyword_exact =", similarity_scores.get('keyword_exact'))
    print("DEBUG: technical_skills =", similarity_scores.get('technical_skills'))
    print("DEBUG: missing_terms =", missing_terms[:5])
    print("DEBUG: missing_tech_skills =", missing_tech_skills[:5])
    print("DEBUG: experience_cv / experience_job =", experience_cv, "/", experience_job)
    print("DEBUG: cv_sector vs job_sector =", cv_sector, job_sector)

    # ── Feedback ──────────────────────────────────────────────────────────────
    feedback = generate_detailed_feedback(
        similarity_scores, missing_terms, matched_terms,
        cv_text, job_text_clean,
        cv_sector_info, job_sector_info,
        experience_cv, experience_job,
        education_cv, education_job,
        confidence, sector_comparison,
        culture_phrases, missing_tech_skills
    )

    return {
        **feedback,
        "cv_raw_text": cv_text,
        "job_title_match":             title_match,
        "company_culture":             [{"text": p, "score": s} for p, s in culture_phrases],
        "missing_terms":               missing_terms[:20],
        "missing_terms_with_context":  missing_terms_with_context[:15],
        "cv_terms":                    cv_terms[:30],
        "job_terms":                   job_simple_terms[:30],
        "extracted_skills_cv":         extracted_skills_cv,
        "extracted_skills_job":        extracted_skills_job,
        "analysis_mode":               mode,
        "sector_skills_suggestions":   sector_skills_suggestions,
    }
