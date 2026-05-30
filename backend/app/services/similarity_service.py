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

    cv_clean  = preprocess_text(cv_text,  lang=cv_lang)   # spaCy según idioma
    job_clean = preprocess_text(job_text, lang=job_lang)
    
    if not cv_clean:
        cv_clean = cv_text[:config.MAX_TEXT_LENGTH]
    if not job_clean:
        job_clean = extract_relevant_text(job_text)[:config.MAX_TEXT_LENGTH]
    
    emb_cv = emb_model.encode(cv_clean[:config.MAX_TEXT_LENGTH])
    emb_job = emb_model.encode(job_clean[:config.MAX_TEXT_LENGTH])
    semantic_sim = float(cosine_similarity([emb_cv], [emb_job])[0][0])
    
    # ============================================================
    # NUEVO: Calcular keyword exact basado en habilidades técnicas (regex)
    # ============================================================
    cv_skills = set(extract_technical_skills(cv_text))
    job_skills = set(extract_technical_skills(job_text))
    
    if job_skills:
        jaccard_sim = len(cv_skills & job_skills) / len(job_skills)
    else:
        jaccard_sim = 0.0
    
    # Mantenemos partial_matches para las keywords de KeyBERT (opcional, podrías eliminarlo)
    # Para no perder funcionalidad, seguimos calculando partial_sim con las keywords de KeyBERT,
    # pero podrías usar las skills también si quieres. Por simplicidad lo dejamos como estaba.
    # No obstante, si quieres que keyword_partial también use skills, lo puedes cambiar.
    partial_matches = 0
    for job_kw in job_keywords:
        for cv_kw in cv_keywords:
            if fuzzy_string_similarity(job_kw, cv_kw) >= config.FUZZY_THRESHOLD:
                partial_matches += 1
                break
    partial_sim = partial_matches / len(job_keywords) if job_keywords else 0.0
    
    # technical_skills se mantiene igual (ya usa regex)
    tech_job = set(extract_technical_skills(job_text))
    tech_cv = set(extract_technical_skills(cv_text))
    tech_match = len(tech_cv & tech_job) / len(tech_job) if tech_job else 0.5
    
    keyword_sim = jaccard_sim * 0.7 + partial_sim * 0.3
    final_score = (semantic_sim * 0.40 + keyword_sim * 0.35 + tech_match * 0.25) * 100
    
    return {
        "overall": round(final_score, 2), 
        "semantic": round(semantic_sim * 100, 2),
        "keyword_exact": round(jaccard_sim * 100, 2), 
        "keyword_partial": round(partial_sim * 100, 2),
        "technical_skills": round(tech_match * 100, 2)
    }

def semantic_phrase_coverage(
    cv_text: str,  # ← CAMBIADO: Ahora recibe el string completo del CV para segmentar oraciones
    job_phrases_with_scores: List[Tuple[str, float]],
    job_text: str,
    threshold: float = 0.60
) -> Tuple[float, List[str], List[Dict[str, Any]]]:
    """
    Calcula la cobertura semántica comparando las frases clave de la oferta (JD)
    contra oraciones reales del CV, evitando la pérdida de contexto.
    """
    if not cv_text or not job_phrases_with_scores:
        return 0.0, [], []

    _init_models()
    emb_model = get_embedding_model()

    # 1. Segmentar el CV en oraciones completas y limpiar fragmentos vacíos o ruidos
    # Separamos por puntos, signos de puntuación o saltos de línea (\n)
    cv_sentences = re.split(r'(?<=[.!?;:])\s+|\n+', cv_text)
    cv_sentences = [s.strip() for s in cv_sentences if len(s.strip()) > 12]
    
    # Salvaguarda por si el CV es un bloque de texto plano sin separadores claros
    if not cv_sentences:
        cv_sentences = [cv_text.strip()]

    # 2. Procesar y limpiar las frases requeridas por la oferta de empleo
    seen_phrases = set()
    deduped_phrases_with_scores = []
    for phrase, score in job_phrases_with_scores:
        p_clean = phrase.strip().lower()
        if p_clean not in seen_phrases and len(p_clean) > 5:
            seen_phrases.add(p_clean)
            deduped_phrases_with_scores.append((phrase, score))

    job_phrases = [phrase for phrase, _ in deduped_phrases_with_scores]
    original_scores = [score for _, score in deduped_phrases_with_scores]

    if not job_phrases:
        return 0.0, [], []

    try:
        # Generar embeddings cruzando ORACIONES completas de la oferta vs ORACIONES del CV
        cv_embs = emb_model.encode(cv_sentences)
        job_embs = emb_model.encode(job_phrases)
        sim_matrix = cosine_similarity(job_embs, cv_embs)
    except Exception as e:
        print(f"Error generando embeddings en semantic_phrase_coverage: {e}")
        return 0.0, [], []

    matched = []
    missing = []

    # 3. Evaluar la similitud de cada frase requerida frente a todo el CV
    for i, (phrase, orig_score) in enumerate(zip(job_phrases, original_scores)):
        # Obtener el score de similitud de la oración del CV que más se le parece
        best_sim = float(sim_matrix[i].max()) if i < len(sim_matrix) and len(cv_sentences) > 0 else 0.0
        
        # Encontrar el índice de esa oración para extraer el fragmento exacto como contexto real
        best_match_idx = sim_matrix[i].argmax() if i < len(sim_matrix) and len(cv_sentences) > 0 else 0
        cv_context_sentence = cv_sentences[best_match_idx] if cv_sentences else phrase

        term_info = {
            "term": phrase,
            "score": round(orig_score, 3),
            "semantic_score": round(best_sim, 3),
            # Si supera el umbral, guardamos la frase real del usuario en su CV, si no, la de referencia de la oferta
            "context": cv_context_sentence if best_sim >= threshold else phrase  
        }

        if best_sim >= threshold:
            matched.append(phrase)
        else:
            # Solo sugerir si la frase es verdaderamente relevante (score >= 0.4)
            if orig_score >= 0.4:
                missing.append(term_info)

    # 4. Cálculo ponderado inteligente de la cobertura (en escala de 0.0 a 100.0)
    total_possible_score = sum(original_scores)
    if total_possible_score > 0:
        matched_indices = [idx for idx, p in enumerate(job_phrases) if p in matched]
        earned_score = sum(original_scores[idx] for idx in matched_indices)
        coverage_score = (earned_score / total_possible_score) * 100
    else:
        coverage_score = (len(matched) / len(job_phrases) * 100) if job_phrases else 0.0

    # Ordenar por el score de importancia de la oferta (las más críticas primero)
    missing_sorted = sorted(missing, key=lambda x: x['score'], reverse=True)[:15]
    print(f"📊 Frases Oferta: {len(job_phrases)} | Matched: {len(matched)} | Missing Sugeridas: {len(missing_sorted)}")

    return round(coverage_score, 2), matched, missing_sorted

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
