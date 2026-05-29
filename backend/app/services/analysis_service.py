import re
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

#from app.services.action_verbs import calculate_action_verbs_score
#from app.services.quantified_achievements import calculate_quantified_achievements_score
from app.services.similarity_service import semantic_phrase_coverage

from app.services.action_verbs import analyze_action_verbs
from app.services.quantified_achievements import analyze_quantified_achievements

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


    job_phrases_raw = extract_relevant_phrases(job_text_clean, lang=job_lang)

    # RegEx para cazar y destruir textos de interfaz de LinkedIn, Indeed, Infojobs, etc.
    BOILERPLATE_REGEX = re.compile(
        r"(about the job|sobre el empleo|premium|job search|faster with|tiempo estimado|"
        r"estimado de proceso|semanas|postular|apply|solicitar|guardar|save|share|compartir|"
        r"report|denunciar|see more|ver más|linkedin|indeed|infojobs|publicado|posted|"
        r"visitas|solicitantes|proceso de selección|unirse al equipo|estimado de|visualizaciones)", 
        re.IGNORECASE
    )

    # Filtrar el ruido antes de deduplicar y exigir un mínimo de longitud
    job_phrases_filtered = [
        (phrase, score) for phrase, score in job_phrases_raw 
        if not BOILERPLATE_REGEX.search(phrase) and len(phrase.strip()) > 20
    ]

    # Deduplicar frases
    unique = {}
    for phrase, score in job_phrases_filtered:
        if phrase not in unique or score > unique[phrase]:
            unique[phrase] = score
    job_phrases = sorted(unique.items(), key=lambda x: x[1], reverse=True)[:25]



    # =========================================================================
    # 🔥 SALVAGUARDA CRÍTICA: Si las expresiones regulares no extrajeron nada,
    # dividimos el texto limpio de la oferta por líneas y les asignamos un score base.
    # ¡Esto asegura que NUNCA vuelva a quedar vacío!
    # =========================================================================
    if not job_phrases:
        raw_lines = [line.strip() for line in job_text_clean.splitlines() if len(line.strip()) > 20]
        # Si aun así está vacío, usamos el texto completo original separado por puntos
        if not raw_lines:
            raw_lines = [s.strip() for s in re.split(r'(?<=[.!?;:])\s+', job_text) if len(s.strip()) > 20]
        
        job_phrases = [(line, 0.50) for line in raw_lines[:25]] # Score por defecto de 0.50
    # =========================================================================

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
            cv_text, job_phrases, job_text, threshold=config.SEMANTIC_THRESHOLD # <-- cv_text aquí
        )
        #keyword_coverage, matched_terms, missing_terms_with_context = semantic_phrase_coverage(
        #    cv_terms, job_phrases, job_text, threshold=config.SEMANTIC_THRESHOLD
        #)
    else:
        keyword_coverage, matched_terms, missing_terms_with_context = 0.0, [], []

    missing_terms = [item["term"] for item in missing_terms_with_context]

    similarity_scores['keyword_exact']            = round(keyword_exact, 2)

    base_overall = similarity_scores['overall']
    similarity_scores['overall'] = round(base_overall * 0.70 + keyword_coverage * 0.30, 2)
    #similarity_scores['overall']                  = round(
    #    similarity_scores['semantic'] * 0.5 + keyword_coverage * 0.5, 2
    #)
    #similarity_scores['action_verbs']             = calculate_action_verbs_score(cv_text)
    #similarity_scores['quantified_achievements']  = calculate_quantified_achievements_score(cv_text)
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

    

    # ── Análisis de Verbos de Acción ──────────────────────────────────────────
    action_verbs_score, detected_verbs = analyze_action_verbs(cv_text)

    # Generador dinámico de recomendaciones de texto para Verbos de Acción
    action_verbs_tips = []
    if action_verbs_score < 40:
        action_verbs_tips = [
            "Tu currículum utiliza un lenguaje excesivamente pasivo o enfocado en tareas rutinarias.",
            "Reemplaza expresiones débiles como 'Responsable de la gestión de' o 'Encargado de' por verbos de acción contundentes al inicio de tus viñetas (ej: 'Lideré', 'Optimicé', 'Diseñé').",
            "Intenta que al menos el 35% de las oraciones de tu experiencia profesional arranquen con un verbo de impacto en pasado o infinitivo."
        ]
    elif action_verbs_score < 75:
        action_verbs_tips = [
            "Buen intento utilizando verbos dinámicos, pero su distribución es muy irregular.",
            "Hemos detectado términos clave valiosos, pero todavía quedan bloques completos que parecen listas de obligaciones. Añade fuerza usando palabras como 'Automaticé', 'Implementé' o 'Reduje' en tus puestos antiguos."
        ]
    else:
        action_verbs_tips = [
            "¡Excelente uso del lenguaje! Tu currículum tiene una densidad de verbos activos impecable, lo que demuestra proactividad y liderazgo según los estándares de los ATS modernos."
        ]

    # ── Análisis de Logros Cuantificables ─────────────────────────────────────
    quantified_score, quantified_sentences = analyze_quantified_achievements(cv_text)

    # Generador dinámico de recomendaciones de texto para Logros Cuantificables
    quantified_tips = []
    if quantified_score == 0:
        quantified_tips = [
            "¡Alerta Crítica! No hemos detectado ningún hito o logro respaldado por métricas numéricas, porcentajes o datos financieros.",
            "Los reclutadores y algoritmos ATS suelen descartar perfiles puramente teóricos. Añade números que respondan a: ¿Cuánto dinero ahorraste? ¿A cuántos usuarios impactaste? ¿En qué porcentaje aceleraste el sistema?",
            "Ejemplo práctico de cambio: Pasa de 'Desarrollo de API' a 'Desarrollo de API optimizada que redujo el tiempo de respuesta en un 45% para 12,000 usuarios activos'."
        ]
    elif quantified_score == 40:
        quantified_tips = [
            "Impacto numérico bajo: Solo hemos logrado indexar 1 hito cuantificable legítimo en tu trayectoria.",
            "Intenta inyectar métricas duras (%, $, volúmenes de clientes, plazos de entrega) en al menos 2 experiencias laborales previas adicionales para demostrar consistencia orientada a resultados."
        ]
    elif quantified_score == 75:
        quantified_tips = [
            "¡Buen camino! Cuentas con 2 logros cuantificados muy claros y atractivos.",
            "Para hacer tu perfil verdaderamente imbatible frente a otros candidatos, intenta rescatar una métrica de escala (ej: tamaño de presupuestos manejados o volumen de base de datos) en tu experiencia más reciente."
        ]
    else:
        quantified_tips = [
            "¡Sobresaliente! Tu trayectoria destaca con un fuerte enfoque en resultados tangibles. Has incorporado métricas en múltiples puntos estratégicos de tu carrera profesional."
        ]


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
        # Guardamos los scores, lo detectado y inyectamos los nuevos arrays de TIPS en texto real
        "action_verbs_metrics": {
            "score": action_verbs_score,
            "detected": detected_verbs,
            "tips": action_verbs_tips  # ← ¡NUEVO! Frases de sugerencia listas para usar
        },
        "quantified_achievements_metrics": {
            "score": quantified_score,
            "sentences": quantified_sentences,
            "tips": quantified_tips  # ← ¡NUEVO! Frases de sugerencia listas para usar
        }
    }
