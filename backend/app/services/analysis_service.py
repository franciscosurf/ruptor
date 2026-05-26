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

from app.services.text_scoring import extract_relevant_text  # ← añadir este import

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

    # Idiomas: cada texto usa el suyo
    cv_lang  = detect_language(cv_text)
    job_lang = detect_language(job_text)
    main_lang = job_lang   # para compatibilidad

    # Detectar sectores
    cv_sector_info = detect_sector_from_text(cv_text)
    job_sector_info = detect_sector_from_text(job_text)
    cv_sector = cv_sector_info.get("sector", "general")
    job_sector = job_sector_info.get("sector", "general")

    # Configurar umbrales según modo y sector
    if mode == "strict":
        config.SEMANTIC_THRESHOLD = get_threshold_by_sector(job_sector, "strict")
        config.FUZZY_THRESHOLD = 0.90
    elif mode == "flexible":
        config.SEMANTIC_THRESHOLD = get_threshold_by_sector(job_sector, "flexible")
        config.FUZZY_THRESHOLD = 0.75
    else:
        config.SEMANTIC_THRESHOLD = get_threshold_by_sector(job_sector, "balanced")
        config.FUZZY_THRESHOLD = 0.85

    # Comparar skills entre sectores
    sector_comparison = compare_skills_between_sectors(cv_sector, job_sector, main_lang)

    # Limpiar la oferta: quitar beneficios, cultura, etc.
    from app.services.text_service import extract_relevant_text
    job_text_clean = extract_relevant_text(job_text)   # string

    # Extraer frases relevantes de la oferta (según señales)
    from app.services.text_scoring import extract_relevant_phrases
    job_phrases = extract_relevant_phrases(job_text_clean, min_score=0.4, lang=job_lang)
    job_phrases = sorted(job_phrases, key=lambda x: x[1], reverse=True)[:20]  # top 20

    # Extraer keywords del CV (KeyBERT, sin cambios)
    cv_keywords_weighted = extract_keywords_advanced(cv_text, top_n=config.TOP_N_KEYWORDS, force_lang=cv_lang)
    cv_terms = [kw for kw, _ in cv_keywords_weighted]

    # Extraer experiencia y educación (usar texto limpio para la oferta)
    experience_job = extract_experience_years(job_text_clean)
    experience_cv = extract_experience_years(cv_text)
    education_job = extract_education_level(job_text_clean)
    education_cv = extract_education_level(cv_text)

    # Calcular similitud semántica y de keywords (usamos job_phrases como job_keywords)
    # Para la similitud, necesitamos los términos simples de la oferta (pueden ser las frases)
    job_simple_terms = [phrase for phrase, _ in job_phrases]
    similarity_scores = calculate_weighted_similarity(cv_text, job_text_clean, cv_terms, job_simple_terms)

    # Cobertura semántica de términos faltantes (usando las frases relevantes)
    if job_phrases:
        keyword_coverage, matched_terms, missing_terms_with_context = semantic_term_coverage(
            cv_terms, job_phrases, job_text_clean, threshold=config.SEMANTIC_THRESHOLD
        )
    else:
        keyword_coverage, matched_terms, missing_terms_with_context = 0.0, [], []

    missing_terms = [item["term"] for item in missing_terms_with_context]
    similarity_scores['keyword_exact'] = keyword_coverage
    similarity_scores['overall'] = round((similarity_scores['semantic'] * 0.5 + keyword_coverage * 0.5), 2)

    confidence = calculate_confidence_score(cv_text, job_text_clean)

    # Generar feedback (con 13 argumentos, incluyendo cv_sector_info y sector_comparison)
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
        sector_comparison
    )

    # Skills técnicas (extraídas con regex)
    extracted_skills_cv = extract_technical_skills(cv_text)
    extracted_skills_job = extract_technical_skills(job_text_clean)

    # Sugerencias de habilidades del sector
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


async def analyze_cv_logic2(
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

    main_lang = detect_language(job_text)

    # ← AÑADIR ESTAS DOS LÍNEAS
    # Filtra el ruido de la oferta (beneficios, cultura, empresa)
    # ANTES de cualquier análisis. El CV se pasa siempre completo.
    job_text_clean = extract_relevant_text(job_text)
    if isinstance(job_text_clean, tuple):
        job_text_clean = job_text_clean[0]   # toma solo el texto


    # ← CAMBIO CLAVE: cada texto usa su propio idioma
    cv_lang  = detect_language(cv_text)   # "es"
    job_lang = detect_language(job_text)  # "en"

    cv_sector_info = detect_sector_from_text(cv_text)
    job_sector_info = detect_sector_from_text(job_text)
    cv_sector = cv_sector_info.get("sector", "general")
    job_sector = job_sector_info.get("sector", "general")

    # ============================================================
    # 1. Configurar umbrales según modo y sector (como en el original)
    # ============================================================
    if mode == "strict":
        config.SEMANTIC_THRESHOLD = get_threshold_by_sector(job_sector, "strict")
        config.FUZZY_THRESHOLD = 0.90
    elif mode == "flexible":
        config.SEMANTIC_THRESHOLD = get_threshold_by_sector(job_sector, "flexible")
        config.FUZZY_THRESHOLD = 0.75
    else:
        config.SEMANTIC_THRESHOLD = get_threshold_by_sector(job_sector, "balanced")
        config.FUZZY_THRESHOLD = 0.85

    # ============================================================
    # 2. Comparar skills entre sectores (para feedback y sector_comparison)
    # ============================================================
    sector_comparison = compare_skills_between_sectors(cv_sector, job_sector, main_lang)

    # Extraer experiencia y educación
    experience_job = extract_experience_years(job_text_clean)
    experience_cv = extract_experience_years(cv_text)
    education_job = extract_education_level(job_text_clean)
    education_cv = extract_education_level(cv_text)

    # Extraer keywords (sin top_n fijo, se usa el de config)
    # ← Cada texto extrae keywords en su propio idioma
    cv_keywords_weighted  = extract_keywords_advanced(
        cv_text,  top_n=config.TOP_N_KEYWORDS, force_lang=cv_lang   # "es"
    )
    job_keywords_weighted = extract_keywords_advanced(
        job_text, top_n=config.TOP_N_KEYWORDS, force_lang=job_lang  # "en"
    )
    
    cv_terms = [kw for kw, _ in cv_keywords_weighted]
    job_terms = [kw for kw, _ in job_keywords_weighted]

    # Calcular similitud
    similarity_scores = calculate_weighted_similarity(cv_text, job_text_clean, cv_terms, job_terms)

    # ============================================================
    # 3. Llamar a semantic_term_coverage con el umbral configurado
    # ============================================================
    if job_keywords_weighted and len(job_keywords_weighted) > 0:
        keyword_coverage, matched_terms, missing_terms_with_context = semantic_term_coverage(
            cv_terms, job_keywords_weighted, job_text,  # ← pasa job_text (original), no job_text_clean
            threshold=config.SEMANTIC_THRESHOLD
        )
    else:
        keyword_coverage, matched_terms, missing_terms_with_context = 0.0, [], []

    missing_terms = [item["term"] for item in missing_terms_with_context]

    # ============================================================
    # 4. Actualizar scores con el coverage obtenido (como en el original)
    # ============================================================
    similarity_scores['keyword_exact'] = keyword_coverage
    similarity_scores['overall'] = round((similarity_scores['semantic'] * 0.5 + keyword_coverage * 0.5), 2)

    confidence = calculate_confidence_score(cv_text, job_text_clean)

    # ============================================================
    # 5. Llamar a generate_detailed_feedback con 13 argumentos (como en el original)
    #    Asegúrate de que la función en feedback_service.py acepte 13 parámetros
    # ============================================================
    feedback = generate_detailed_feedback(
        similarity_scores,
        missing_terms,
        matched_terms,
        cv_text,
        job_text_clean,
        cv_sector_info,       # ← se pasa cv_sector_info (original)
        job_sector_info,      # ← se pasa job_sector_info
        experience_cv,
        experience_job,
        education_cv,
        education_job,
        confidence,
        sector_comparison      # ← se pasa sector_comparison
    )

    extracted_skills_cv = extract_technical_skills(cv_text)
    extracted_skills_job = extract_technical_skills(job_text_clean)

    sector_skills_suggestions = get_relevant_skills_for_sector(job_sector, main_lang, limit=10)

    return {
        **feedback,
        "missing_terms": missing_terms[:20],
        "missing_terms_with_context": missing_terms_with_context[:15],
        "cv_terms": cv_terms[:30],
        "job_terms": job_terms[:30],
        "extracted_skills_cv": extracted_skills_cv,
        "extracted_skills_job": extracted_skills_job,
        "analysis_mode": mode,
        "sector_skills_suggestions": sector_skills_suggestions,
        "job_text_used": job_text_clean[:300] + "..."  # ← opcional, útil para debug

    }