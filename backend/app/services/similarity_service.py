from typing import List, Tuple, Dict, Any
import re

from sklearn.metrics.pairwise import cosine_similarity

from app.core.config import config
from app.core.models import get_embedding_model
from app.services.text_service import preprocess_text
from app.services.sector_service import detect_sector_from_text
from app.skills.loader import get_skill_sector
from app.services.keyword_service import extract_technical_skills
from app.utils.fuzzy import fuzzy_string_similarity
from app.core.constants import NOISE_TERMS

from app.core.models import _init_models
from app.utils.language import detect_language
from app.services.text_service import extract_relevant_text


def calculate_weighted_similarity(
    cv_text: str, job_text: str, cv_keywords: List[str], job_keywords: List[str]
) -> Dict[str, float]:
    _init_models()
    emb_model = get_embedding_model()
    
    cv_lang  = detect_language(cv_text)
    job_lang = detect_language(job_text)

    cv_clean  = preprocess_text(cv_text,  lang=cv_lang)   # spaCy español
    job_clean = preprocess_text(job_text, lang=job_lang)  # spaCy inglés
    
    if not cv_clean:
        cv_clean = cv_text[:config.MAX_TEXT_LENGTH]
    if not job_clean:
        job_clean = extract_relevant_text(job_text)[:config.MAX_TEXT_LENGTH]
    
    emb_cv = emb_model.encode(cv_clean[:config.MAX_TEXT_LENGTH])
    emb_job = emb_model.encode(job_clean[:config.MAX_TEXT_LENGTH])
    semantic_sim = float(cosine_similarity([emb_cv], [emb_job])[0][0])
    
    cv_set, job_set = set(cv_keywords), set(job_keywords)
    jaccard_sim = len(cv_set & job_set) / len(job_set) if job_set else 0.0
    
    partial_matches = 0
    for job_kw in job_set:
        for cv_kw in cv_set:
            if fuzzy_string_similarity(job_kw, cv_kw) >= config.FUZZY_THRESHOLD:
                partial_matches += 1
                break
    partial_sim = partial_matches / len(job_set) if job_set else 0.0
    
    tech_job = set(extract_technical_skills(job_text))
    tech_cv = set(extract_technical_skills(cv_text))
    tech_match = len(tech_cv & tech_job) / len(tech_job) if tech_job else 0.5
    
    keyword_sim = jaccard_sim * 0.7 + partial_sim * 0.3
    final_score = (semantic_sim * 0.40 + keyword_sim * 0.35 + tech_match * 0.25) * 100
    
    return {
        "overall": round(final_score, 2), "semantic": round(semantic_sim * 100, 2),
        "keyword_exact": round(jaccard_sim * 100, 2), "keyword_partial": round(partial_sim * 100, 2),
        "technical_skills": round(tech_match * 100, 2)
    }


def semantic_term_coverage(
    cv_terms: List[str],
    job_terms_with_scores: List[Tuple[str, float]],
    job_text: str,
    threshold: float = 0.50
) -> Tuple[float, List[str], List[Dict[str, Any]]]:
    """Versión robusta con filtro técnico usando skills del sector."""
    if not cv_terms:
        return 0.0, [], []
    
    # Fallback si no hay términos de oferta
    if not job_terms_with_scores:
        # intentar obtener frases relevantes directamente del texto (ya deberían venir)
        # pero si no hay, devolver vacío
        return 0.0, [], []
    
    _init_models()
    emb_model = get_embedding_model()
    
    # Filtrar ruido básico
    filtered_terms = []
    filtered_scores = []
    lang = detect_language(job_text)
    for term, score in job_terms_with_scores:
        term_lower = term.lower()
        if len(term_lower) < 3:
            continue
        if term_lower in NOISE_TERMS:
            continue
        if len(term_lower.split()) > 3:
            continue
        if re.search(r'\d{3,}', term_lower):
            continue
        filtered_terms.append(term)
        filtered_scores.append(score)
    
    if not filtered_terms:
        filtered_terms = [t for t, _ in job_terms_with_scores[:30]]
        filtered_scores = [0.3] * len(filtered_terms)
    
    try:
        cv_embs = emb_model.encode(cv_terms)
        job_embs = emb_model.encode(filtered_terms)
        sim_matrix = cosine_similarity(job_embs, cv_embs)
    except Exception as e:
        print(f"Error en embeddings: {e}")
        return 0.0, [], []
    
    matched = []
    missing = []
    
    for i, (job_term, original_score) in enumerate(zip(filtered_terms, filtered_scores)):
        best_sim = float(sim_matrix[i].max()) if i < len(sim_matrix) else 0.0
        
        # El contexto es la propia frase (job_term)
        term_info = {
            "term": job_term,
            "score": round(original_score, 3),
            "semantic_score": round(best_sim, 3),
            "context": job_term   # <- aquí está el cambio: la frase misma como contexto
        }
        
        if best_sim >= threshold:
            matched.append(job_term)
        else:
            missing.append(term_info)
    
    # ========== FILTRO TÉCNICO ==========
    # Obtener sector y skills de referencia
    sector_info = detect_sector_from_text(job_text)
    sector = sector_info.get("sector", "general")
    sector_skills = get_skill_sector(sector, lang)
    
    def is_technical(term: str) -> bool:
        term_low = term.lower()
        if term_low in sector_skills:
            return True
        words = term_low.split()
        if any(w in sector_skills and len(w) >= 3 for w in words):
            return True
        non_tech = {
            "colectivo", "lgtb", "fisio", "yoga", "gourmet", "retribución", "familia",
            "aventura", "discriminación", "primando", "ofrecemos", "tenemos", "celebramos",
            "organizamos", "cosquilleo", "tripa", "millones", "personas", "jornada",
            "turnos", "presencial", "remoto", "hacemos", "meetups", "mogollón", "sacamos"
        }
        return not any(w in non_tech for w in words)
    
    missing = [item for item in missing if is_technical(item['term'])]
    
    # Eliminar términos redundantes (mismo contexto)
    def filter_redundant_terms(missing_list):
        context_groups = {}
        for item in missing_list:
            ctx = item['context']  # ahora es la propia frase
            if ctx not in context_groups:
                context_groups[ctx] = []
            context_groups[ctx].append(item)
        filtered = []
        for ctx, items in context_groups.items():
            items.sort(key=lambda x: (len(x['term']), x['score']), reverse=True)
            filtered.append(items[0])
        return filtered
    
    missing = filter_redundant_terms(missing)
    
    # Ordenar por relevancia (score más alto)
    missing_sorted = sorted(missing, key=lambda x: x['score'], reverse=True)[:15]
    coverage = round(len(matched) / len(filtered_terms) * 100, 2) if filtered_terms else 0.0
    print(f"📊 Términos relevantes: {len(filtered_terms)} | Matched: {len(matched)} | Missing: {len(missing)}")
    
    return coverage, matched, missing_sorted


def semantic_phrase_coverage(
    cv_terms: List[str],
    job_phrases_with_scores: List[Tuple[str, float]],
    job_text: str,
    threshold: float = 0.60
) -> Tuple[float, List[str], List[Dict[str, Any]]]:
    """
    Compara frases de la oferta (con señales) con términos del CV.
    job_phrases_with_scores: lista de (frase, score_signal)
    threshold: umbral de similitud coseno (0.6 por defecto)
    """

    # Eliminar frases duplicadas exactas (mismo texto)
    unique_phrases = {}
    for phrase, score in job_phrases_with_scores:
        if phrase not in unique_phrases or score > unique_phrases[phrase]:
            unique_phrases[phrase] = score
    job_phrases_with_scores = [(p, s) for p, s in unique_phrases.items()]


    if not cv_terms or not job_phrases_with_scores:
        return 0.0, [], []

    _init_models()
    emb_model = get_embedding_model()

    # Extraer solo las frases
    job_phrases = [phrase for phrase, _ in job_phrases_with_scores]
    original_scores = [score for _, score in job_phrases_with_scores]

    try:
        cv_embs = emb_model.encode(cv_terms)
        job_embs = emb_model.encode(job_phrases)
        sim_matrix = cosine_similarity(job_embs, cv_embs)
    except Exception as e:
        print(f"Error en embeddings: {e}")
        return 0.0, [], []

    matched = []
    missing = []

    for i, (phrase, orig_score) in enumerate(zip(job_phrases, original_scores)):
        best_sim = float(sim_matrix[i].max()) if i < len(sim_matrix) else 0.0

        term_info = {
            "term": phrase,
            "score": round(orig_score, 3),
            "semantic_score": round(best_sim, 3),
            "context": phrase  # la propia frase como contexto
        }

        if best_sim >= threshold:
            matched.append(phrase)
        else:
            missing.append(term_info)

    # Filtrar por puntuación de señal (solo frases con señal mínima)
    missing = [item for item in missing if item["score"] >= 0.4]

    # Ordenar por score de señal (mayor primero)
    missing_sorted = sorted(missing, key=lambda x: x['score'], reverse=True)[:15]

    coverage = round(len(matched) / len(job_phrases) * 100, 2) if job_phrases else 0.0
    print(f"📊 Frases relevantes: {len(job_phrases)} | Matched: {len(matched)} | Missing: {len(missing)}")

    return coverage, matched, missing_sorted
