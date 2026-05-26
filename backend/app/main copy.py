"""
ATS Beater IA - Backend para análisis de CV contra ofertas de trabajo
Versión: 4.0 - Detección de sector y skills desde archivos JSON
"""

import re
import io
import json
import asyncio
from typing import List, Dict, Tuple, Optional, Any
from collections import Counter
from datetime import datetime
from concurrent.futures import ThreadPoolExecutor
import math
from pathlib import Path

from fastapi import FastAPI, UploadFile, File, Form, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import spacy
from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity
from keybert import KeyBERT
from langdetect import detect, LangDetectException
import pdfplumber
import docx
import numpy as np

from app.experience_analyzer import (
    extract_experience_years,
    get_experience_years,
    compare_experience
)

from app.cv_optimizer import generate_cv_optimizations

# ============================================================================
# IMPORT DEL SISTEMA DE SECTORES
# ============================================================================

from app.skills.loader import (
    load_skill_sector,
    get_skill_sector,
    detect_sector_from_text,
    get_all_sectors,
    get_relevant_skills_for_sector,
    compare_skills_between_sectors
)

# Siglas técnicas permitidas (mínimo 3 letras)
TECH_ACRONYMS = {
    "api", "ui", "ux", "git", "crm", "cli", "sdk", "pdf", "xml", "html", 
    "css", "js", "ts", "sql", "rpc", "soap", "http", "tcp", "ip", "dns", "ssl", 
    "ssh", "ftp", "smtp", "pop", "jwt", "oauth", "saml", "ldap", "gps", "gis",
    "cad", "cam", "bim", "plc", "scada", "rtos", "fpga", "soc", "dsp", "gpu",
    "cpu", "ram", "rom", "bios", "pci", "usb", "hdmi", "vga", "lte", "5g", "wifi",
    "ble", "mcu", "ide", "ttl", "vpn", "nat", "dhcp", "arp", "icmp", "rip", "ospf",
    "mpls", "vlan", "stp", "rstp", "lacp", "lldp", "cdp", "vpc", "hci", "nvme",
    "raid", "iscsi", "fc", "nfs", "smb", "cifs", "afs", "ncp", "spx", "ipx",
    "x25", "atm", "sonet", "sdh", "wdm", "otn", "ptp", "ntp", "glonass", "galileo",
    "beidou", "irnss", "qzss", "sbas", "egnos", "waas", "msas", "sdcm", "adc",
    "dac", "pwm", "gpio", "i2c", "spi", "can", "lin", "flexray", "most", "ethernet",
    "avb", "tsn", "profinet", "ethercat", "powerlink", "sercos", "cclink", "melsec"
}


# ============================================================================
# CONFIGURACIÓN
# ============================================================================



class Config:
    """Configuración centralizada de la aplicación"""
    MIN_TERM_LENGTH: int = 3
    MAX_TERM_LENGTH: int = 50
    SEMANTIC_THRESHOLD: float = 0.70
    KEYWORD_DIVERSITY: float = 0.6
    MAX_TEXT_LENGTH: int = 10000
    TOP_N_KEYWORDS: int = 40
    CACHE_SIZE: int = 100
    BATCH_SIZE: int = 10
    TIMEOUT_SECONDS: int = 30
    FUZZY_THRESHOLD: float = 0.85

config = Config()

# ============================================================================
# INICIALIZACIÓN DE APPS Y MODELOS
# ============================================================================

app = FastAPI(
    title="ATS Beater IA",
    description="API para analizar CV contra ofertas de trabajo y superar filtros ATS",
    version="4.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

_executor = ThreadPoolExecutor(max_workers=4)

# Modelos de IA
_embedding_model: Optional[SentenceTransformer] = None
_kw_model: Optional[KeyBERT] = None
_nlp_es: Any = None
_nlp_en: Any = None

# Cache para embeddings
_embedding_cache: Dict[str, np.ndarray] = {}

# ============================================================================
# PATRONES DE TEXTO
# ============================================================================

RELEVANT_START_PATTERNS: List[str] = [
    r'main\s+responsibilities', r'what\s+you\s+will\s+do', r'what\s+you\s+can\s+expect',
    r'responsibilities\s*[:]?', r'duties\s*[:]?', r'tasks\s*[:]?', r'core\s+requirements',
    r'what\s+you\s+offer', r'skills\s*[:]?', r'qualifications\s*[:]?', r'knowledge\s*[:]?',
    r'experience\s*[:]?', r'education\s*[:]?', r'competencies\s*[:]?', r'abilities\s*[:]?',
    r'expectations\s*[:]?', r'key\s+requirements', r'technical\s+skills', r'professional\s+experience',
    r'beneficial\s+qualifications', r'nice\s+to\s+have', r'additional\s+skills', r'job\s+description',
    r'role\s+description', r'what\s+we\s+are\s+looking\s+for', r'responsabilidades', r'requisitos',
    r'habilidades', r'competencias', r'experiencia', r'educación', r'cualificaciones',
    r'requisitos\s+importantes',           # Español
    r'tecnologías\s+que\s+usamos',
    r'stack\s+técnico',
    r'herramientas\s+que\s+utilizamos',
    r'lo\s+que\s+buscamos',
    r'key\s+requirements',                 # Inglés
    r'tech\s+stack',
    r'tools\s+we\s+use',
    r'essential\s+skills',
    # Español - para esta oferta
    r'¿qué\s+harás',                      # "¿Qué harás?"
    r'¿qué\s+buscamos\s+en\s+ti',         # "¿Qué buscamos en ti?"
    r'requisitos',                        # "Requisitos"
    r'experiencia\s+profesional',         # "Experiencia profesional"
    r'lo\s+que\s+buscamos',               # "Lo que buscamos"
    r'tus\s+funciones',                   # "Tus funciones"
    r'tecnologías\s+que\s+usamos',
    r'stack\s+técnico',
    r'herramientas\s+que\s+utilizamos',
    
    # Inglés
    r'what\s+you\s+will\s+do',
    r'what\s+we\s+are\s+looking\s+for',
    r'requirements',
    r'responsibilities',
    r'key\s+responsibilities',
    r'technical\s+skills',
    r'essential\s+skills',
    # Español - nuevos patrones para ofertas como esta
    r'¿qué\s+harás',                     # ¿Qué harás?
    r'¿qué\s+buscamos\s+en\s+ti',        # ¿Qué buscamos en ti?
    r'tus\s+funciones',                  # Tus funciones
    r'requisitos',                       # Requisitos (suelto)
    r'requisitos\s+del\s+puesto',
    r'experiencia\s+profesional',
    r'lo\s+que\s+buscamos',
    r'tecnologías\s+que\s+usamos',
    r'stack\s+técnico',
    r'herramientas\s+que\s+utilizamos',
    r'responsabilidades',
    r'qué\s+te\s+ofrecemos',  # Ojo, esto es irrelevante, pero lo pondremos para ignorarlo después
]

IRRELEVANT_START_PATTERNS: List[str] = [
    r'what\s+we\s+offer', r'benefits', r'about\s+us', r'about\s+the\s+company', r'how\s+to\s+apply',
    r'how\s+to\s+reach\s+us', r'contact', r'more\s+about', r'diversity', r'inclusion',
    r'equal\s+opportunity', r'pension', r'insurance', r'salary', r'remuneration', r'flexible',
    r'training', r'development', r'health', r'safety', r'environment', r'culture', r'values',
    r'mission', r'vision', r'history', r'location', r'address', r'phone', r'email', r'website',
    r'social\s+media', r'qué ofrecemos', r'beneficios', r'sobre nosotros', r'cómo aplicar',
    r'contacto', r'salario', r'ubicación', r'proceso de entrevista', r'entrevista',

    # NUEVOS PATRONES PARA ESPAÑOL
    r'requisitos\s+importantes',
    r'requisitos\s+del\s+puesto',
    r'qué\s+sabes\s+hacer',
    r'tus\s+funciones',
    r'lo\s+que\s+buscamos',
    r'buscamos\s+a\s+alguien',
    r'tecnologías\s+que\s+usamos',
    r'stack\s+técnico',
    r'herramientas\s+que\s+utilizamos',
    r'responsabilidades\s+del\s+puesto',
    r'misión\s+del\s+puesto',
    
    # NUEVOS PATRONES PARA INGLÉS
    r'key\s+requirements',
    r'what\s+you\s+will\s+do',
    r'your\s+responsibilities',
    r'tech\s+stack',
    r'tools\s+we\s+use',
    r'core\s+competencies',
    r'essential\s+skills',
    r'desirable\s+skills',
    r'nice\s+to\s+have',
]

NOISE_PATTERN = re.compile(
    r'^[\+\-\*\#\@\!\%\^&\(\)\[\]\{\}\|\;\:\"\'\<\>\,]'
    r'|.*[\(\)\[\]\{\}\=\<\>].*|^https?://|^\+?\d[\d\s\-]{5,}|^\d+$|^[\s\W]+$|^_+$'
    r'|^[a-zA-Z0-9_\.]+\.(py|js|java|cpp|h)$',
    re.IGNORECASE
)

CODE_PATTERN = re.compile(
    r'[a-z_][a-z0-9_]*(\.[a-z_][a-z0-9_]*)*|[A-Z][a-zA-Z0-9_]*|__\w+__'
    r'|def\s+\w+\s*\(|class\s+\w+|import\s+\w+|from\s+\w+\s+import',
    re.IGNORECASE
)

TECH_SKILL_PATTERNS = re.compile(
    r'\b(python|java|javascript|react|angular|vue|node\.?js|aws|azure|'
    r'docker|kubernetes|sql|mongodb|postgresql|tensorflow|pytorch|'
    r'machine learning|deep learning|nlp|computer vision|cloud|devops|'
    r'agile|scrum|git|ci/cd|api|rest|graphql|html|css|typescript|php|'
    r'ruby|swift|kotlin|flutter|django|flask|spring|express|pandas|'
    r'numpy|scikit-learn|keras|power bi|tableau|excel|'
    r'seo|sem|google ads|facebook ads|analytics|crm|salesforce|hubspot|'
    r'email marketing|content marketing|social media|'
    r'photoshop|illustrator|indesign|figma|sketch|adobe xd|'
    r'jira|confluence|trello|asana|monday|notion|'
    r'quickbooks|sage|oracle|sap)\b',
    re.IGNORECASE
)

SOFT_SKILLS_PATTERN = re.compile(
    r'\b(leadership|communication|teamwork|problem solving|critical thinking|'
    r'creativity|adaptability|time management|organization|negotiation|'
    r'conflict resolution|emotional intelligence|mentoring|coaching|'
    r'liderazgo|comunicación|trabajo en equipo|resolución de problemas|'
    r'pensamiento crítico|creatividad|adaptabilidad|gestión del tiempo)\b',
    re.IGNORECASE
)

EXPERIENCE_PATTERN = re.compile(
    r'(\d+)\+?\s*(?:years?|años?|yrs?|años de experiencia|years of experience|yr exp|años de exp)',
    re.IGNORECASE
)

EDUCATION_PATTERN = re.compile(
    r'\b(bachelor|master|phd|doctorate|degree|licenciatura|maestría|doctorado|'
    r'bsc|msc|bs|ba|ma|mba|ingeniería|ingeniero|grado|postgrado|diplomado|'
    r'especialización|certificación|certified|certificado)\b',
    re.IGNORECASE
)

EDUCATION_LEVELS = {
    "doctorado": 5, "phd": 5, "doctorate": 5, "maestría": 4, "master": 4, "mba": 4,
    "postgrado": 3, "grado": 3, "licenciatura": 3, "ingeniería": 3, "ingeniero": 3,
    "bachelor": 3, "diplomado": 2, "especialización": 2, "certificación": 1, "certified": 1,
}

# ============================================================================
# TÉRMINOS DE RUIDO (SIN IMPORTAR DE PROFESSION_DATA)
# ============================================================================

NOISE_TERMS: set = {
    # SOLO palabras realmente inútiles
    "the", "and", "for", "are", "was", "had", "has", "but", "not", "you",
    "all", "any", "can", "may", "our", "out", "its", "per", "etc", "will",
    "would", "could", "should", "might", "must", "from", "with", "have",
    
    # Ruido de entrevista (NO términos técnicos)
    "interview", "recruiter", "call", "process", "stage", "final", "initial",
    "application", "apply", "chat", "hear", "listen", "talk", "speak",
    
    # Verbos genéricos
    "working", "using", "making", "creating", "providing", "helping", "doing",
    "need", "want", "looking", "hesitate", "love", "read", "sure", "okay",
    
    # Sustantivos genéricos
    "level", "framework", "role", "squad", "tribe", "mission", "banking",
    
    # Nombres de empresas
    "monzo", "google", "amazon", "microsoft", "apple", "facebook", "meta",
    
    # Beneficios (NO términos técnicos)
    "benefits", "salary", "pension", "insurance", "perks", "culture", "values",
    "diversity", "inclusion", "mission", "vision",
}

NOISE_TERMS.update({
    # Términos de beneficios/cultura
    "colectivo", "lgtb", "fisio", "yoga", "gourmet", "retribución", "flexible", "familia",
    "mogollón", "aventura", "discriminación", "primando", "estabilidad", "futuro",
    "innovadores", "cercano", "transparente", "autonomía", "descuentos", "exclusivos",
    "competitiva", "continua", "selección", "entrevista", "revisión", "perfil",
    "dueño", "propietario", "dueña", "jornada", "turnos", "presencial", "remoto",
    # Verbos en primera persona del plural (ofrecemos, tenemos)
    "ofrecemos", "tenemos", "disfrutamos", "celebramos", "organizamos",
    # Frases cortas
    "full", "opcional", "nivel", "alto", "bajo", "medio", "gratis", "libre",
    # Palabras de relleno
    "cosquilleo", "tripa", "plataforma", "millones", "personas", "gente", "equipo",
    "compañero", "compañera", "jefe", "empresa", "cliente", "usuario", "cac", "ctr",
})

# ============================================================================
# FUNCIONES DE INICIALIZACIÓN
# ============================================================================

def _init_models() -> None:
    global _embedding_model, _kw_model, _nlp_es, _nlp_en
    
    if _embedding_model is None:
        try:
            _embedding_model = SentenceTransformer('dccuchile/bert-base-spanish-wwm-uncased')
        except Exception as e:
            print(f"Error cargando modelo BERT español: {e}. Usando modelo por defecto.")
            _embedding_model = SentenceTransformer("all-MiniLM-L6-v2")
        _kw_model = KeyBERT(model=_embedding_model)
    
    if _nlp_es is None:
        try:
            _nlp_es = spacy.load("es_core_news_lg")
        except OSError:
            try:
                _nlp_es = spacy.load("es_core_news_md")
            except OSError:
                print("Modelo spaCy español no encontrado")
                _nlp_es = None
    
    if _nlp_en is None:
        try:
            _nlp_en = spacy.load("en_core_web_lg")
        except OSError:
            try:
                _nlp_en = spacy.load("en_core_web_md")
            except OSError:
                print("Modelo spaCy inglés no encontrado")
                _nlp_en = None


def get_embedding_model() -> SentenceTransformer:
    _init_models()
    return _embedding_model


def get_kw_model() -> KeyBERT:
    _init_models()
    return _kw_model


def get_nlp(lang: str) -> Any:
    _init_models()
    return _nlp_es if lang == "es" else _nlp_en

# ============================================================================
# FUNCIONES DE UTILIDAD
# ============================================================================

def detect_language(text: str) -> str:
    try:
        lang = detect(text[:300])
        return "es" if lang == "es" else "en"
    except LangDetectException:
        return "en"


async def extract_text(file: UploadFile) -> str:
    content = await file.read()
    filename = (file.filename or "").lower()
    try:
        if filename.endswith(".pdf"):
            with pdfplumber.open(io.BytesIO(content)) as pdf:
                text_parts = []
                for page in pdf.pages:
                    page_text = page.extract_text()
                    if page_text:
                        text_parts.append(page_text)
                return "\n".join(text_parts).strip()
        elif filename.endswith(".docx"):
            doc = docx.Document(io.BytesIO(content))
            return "\n".join(p.text for p in doc.paragraphs).strip()
        else:
            try:
                return content.decode("utf-8").strip()
            except UnicodeDecodeError:
                return content.decode("latin-1").strip()
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error al leer: {str(e)}")


def extract_relevant_text(text: str) -> str:
    """
    Extrae los párrafos que contienen información técnica (requisitos, responsabilidades, habilidades)
    basándose en la densidad de términos técnicos vs términos no técnicos.
    No depende de encabezados de sección.
    """
    # Dividir en párrafos (separados por líneas en blanco)
    paragraphs = re.split(r'\n\s*\n', text)
    if not paragraphs:
        return text[:10000]

    # Detectar el sector y cargar las skills técnicas para ese sector
    from app.skills.loader import detect_sector_from_text, get_skill_sector
    sector_info = detect_sector_from_text(text)
    sector = sector_info.get("sector", "general")
    lang = detect_language(text)
    tech_skills = get_skill_sector(sector, lang)  # set de habilidades técnicas

    # Palabras que indican secciones no técnicas (beneficios, cultura, empresa, proceso)
    non_tech_keywords = {
        "ofrecemos", "beneficio", "flexibilidad", "salario", "seguro", "vacaciones", "gimnasio", "yoga",
        "cultura", "misión", "visión", "valores", "diversidad", "inclusión", "igualdad", "conciliación",
        "jornada", "turno", "remoto", "presencial", "horario", "retribución", "plan de carrera",
        "formación", "descuento", "evento", "meetup", "afterwork", "clases de inglés",
        "proceso de selección", "entrevista", "reclutamiento", "top employer", "nuestra historia"
    }

    relevant_paragraphs = []
    for para in paragraphs:
        para_lower = para.lower()
        # Dividir el párrafo en palabras (limpias)
        words = re.findall(r'\b[a-záéíóúüñç]+\b', para_lower)
        if not words:
            continue

        # Contar cuántas palabras del párrafo están en las skills técnicas
        tech_count = sum(1 for w in words if w in tech_skills)
        # Contar cuántas palabras están en lista negra (beneficios, cultura)
        non_tech_count = sum(1 for kw in non_tech_keywords if kw in para_lower)

        # Un párrafo es relevante si tiene al menos 1 palabra técnica y menos de 2 palabras no técnicas,
        # o si la proporción de términos técnicos es alta.
        if tech_count > 0 and non_tech_count < 2:
            relevant_paragraphs.append(para)
        elif tech_count >= 2 and non_tech_count <= tech_count:
            # Aunque haya alguna palabra no técnica, si hay suficientes técnicas, puede ser relevante
            relevant_paragraphs.append(para)

    # Si no encontramos nada, devolvemos el texto original (limitado)
    if not relevant_paragraphs:
        return text[:10000]

    result = '\n\n'.join(relevant_paragraphs)
    return result[:15000]  # límite de longitud



def preprocess_text(text: str, lang: str = "es") -> str:
    """Lematiza y limpia el texto usando spaCy"""
    nlp = get_nlp(lang)
    if not nlp:
        return text
    
    doc = nlp(text[:10000])
    tokens = []
    for token in doc:
        if not token.is_stop and not token.is_punct and not token.is_space:
            lemmatized = token.lemma_.lower()
            if len(lemmatized) >= 3:
                tokens.append(lemmatized)
    
    return " ".join(tokens)


def extract_technical_skills(text: str) -> List[str]:
    # Primero con regex
    regex_skills = list(set(TECH_SKILL_PATTERNS.findall(text.lower())))
    
    # Segundo, buscar skills de todos los sectores (para no perder ninguna)
    from app.skills.loader import get_all_sectors, get_skill_sector
    all_skills = set(regex_skills)
    
    # Detectar idioma para buscar en JSON
    lang = detect_language(text)
    
    # Cargar skills de todos los sectores
    for sector in get_all_sectors():
        sector_skills = get_skill_sector(sector, lang)
        for skill in sector_skills:
            # Si es una palabra de 2 letras, descartar
            if len(skill) == 2:
                continue
            # Si es de 3 letras, solo mantener si está en TECH_ACRONYMS
            if len(skill) == 3 and skill not in TECH_ACRONYMS:
                continue

            else:
                if skill.lower() in text.lower():
                    all_skills.add(skill.lower())
    
    return list(all_skills)


def extract_soft_skills(text: str) -> List[str]:
    skills = SOFT_SKILLS_PATTERN.findall(text.lower())
    return list(set(skills))


def extract_education_level(text: str) -> Tuple[str, int]:
    text_lower = text.lower()
    highest_level = "ninguno"
    highest_weight = 0
    for level, weight in EDUCATION_LEVELS.items():
        if level in text_lower and weight > highest_weight:
            highest_weight = weight
            highest_level = level
    return highest_level, highest_weight


def fuzzy_string_similarity(s1: str, s2: str) -> float:
    if not s1 or not s2:
        return 0.0
    s1, s2 = s1.lower(), s2.lower()
    if s1 == s2:
        return 1.0
    len1, len2 = len(s1), len(s2)
    matrix = [[0] * (len2 + 1) for _ in range(len1 + 1)]
    for i in range(len1 + 1):
        matrix[i][0] = i
    for j in range(len2 + 1):
        matrix[0][j] = j
    for i in range(1, len1 + 1):
        for j in range(1, len2 + 1):
            cost = 0 if s1[i-1] == s2[j-1] else 1
            matrix[i][j] = min(matrix[i-1][j] + 1, matrix[i][j-1] + 1, matrix[i-1][j-1] + cost)
    distance = matrix[len1][len2]
    max_len = max(len1, len2)
    return 1 - (distance / max_len) if max_len > 0 else 0


def calculate_confidence_score(cv_text: str, job_text: str) -> float:
    confidence = 100.0
    if len(cv_text) < 200:
        confidence -= 20
    if len(job_text) < 200:
        confidence -= 20
    noise_cv = len(NOISE_PATTERN.findall(cv_text)) / max(len(cv_text.split()), 1)
    noise_job = len(NOISE_PATTERN.findall(job_text)) / max(len(job_text.split()), 1)
    if noise_cv > 0.1:
        confidence -= 15
    if noise_job > 0.1:
        confidence -= 15
    return max(0, min(100, confidence))


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

# ============================================================================
# EXTRACCIÓN DE KEYWORDS
# ============================================================================

def is_technical_term(term: str, sector_skills: set, lang: str = "es") -> bool:
    """
    Determina si un término es técnicamente relevante para el sector.
    Usa coincidencia exacta, parcial o listas negras de palabras no técnicas.
    """
    term_lower = term.lower()
    # 1. Coincidencia exacta con skills del sector
    if term_lower in sector_skills:
        return True

    # 2. Coincidencia parcial: alguna palabra de la frase está en skills
    words = term_lower.split()
    for word in words:
        if word in sector_skills and len(word) >= 3:
            return True

    # 3. Si es una frase de 2-3 palabras, filtrar por palabras claramente no técnicas
    if len(words) > 1:
        non_tech_words = {
            "colectivo", "lgtb", "fisio", "yoga", "gourmet", "retribución", "familia",
            "aventura", "discriminación", "primando", "ofrecemos", "tenemos", "celebramos",
            "organizamos", "cosquilleo", "tripa", "millones", "personas", "jornada",
            "turnos", "presencial", "remoto", "hacemos", "meetups", "mogollón", "sacamos",
            "library", "tooling", "tailwind", "opcional", "trabajo", "estás", "es full",
            "técnico", "ayudar", "del equipo", "personas que", "esta aventura"
        }
        for word in words:
            if word in non_tech_words:
                return False

    # 4. Por defecto, si la palabra tiene al menos 4 letras y no es un verbo muy común,
    # podría ser técnica, pero lo dejamos fuera para no ensuciar.
    return False

def extract_keywords_advanced(text: str, top_n: int = 60, force_lang: str = None) -> List[Tuple[str, float]]:
    _init_models()
    
    # 1. Dividir el texto en fragmentos: oraciones (punto y salto de línea)
    # Usamos split con lookbehind positivo: (?<=[.!?;:])\s+  y también split por \n+
    chunks = re.split(r'(?<=[.!?;:])\s+|\n+', text)
    chunks = [c.strip() for c in chunks if len(c.strip()) > 20]  # ignorar fragmentos muy cortos
    
    # Si no hay suficientes fragmentos, usar todo el texto
    if len(chunks) < 2:
        chunks = [text[:10000]]
    
    all_keywords = []
    for chunk in chunks[:10]:  # limitar a 10 fragmentos para rendimiento
        # Extraer keywords de cada fragmento por separado
        relevant_text = extract_relevant_text(chunk)
        if not relevant_text.strip() or len(relevant_text) < 50:
            relevant_text = chunk[:5000]
        
        try:
            kw_model_instance = get_kw_model()
            lang = force_lang or detect_language(relevant_text)
            stop_words = None
            candidates = kw_model_instance.extract_keywords(
                relevant_text,
                keyphrase_ngram_range=(1, 2),   # unigramas y bigramas
                #stop_words=stop_words,
                stop_words = 'spanish' if lang == 'es' else 'english',
                top_n=top_n // len(chunks) + 5,
                use_mmr=True,
                diversity=0.6,
                nr_candidates=100,
            )
            all_keywords.extend(candidates)
        except Exception:
            continue
    
    # 2. Eliminar duplicados y sumar scores por keyword
    keyword_scores = {}
    for kw, score in all_keywords:
        kw_clean = kw.lower().strip()
        if kw_clean in keyword_scores:
            keyword_scores[kw_clean] = max(keyword_scores[kw_clean], score)
        else:
            keyword_scores[kw_clean] = score
    
    # 3. Convertir a lista y aplicar filtros estándar (ruido, longitud, adjetivos, bigramas cruzados)
    filtered = []
    for kw, score in sorted(keyword_scores.items(), key=lambda x: x[1], reverse=True):
        kw_lower = kw
        # ... aquí aplicas tus filtros actuales (NOISE_TERMS, longitud, adjetivos, etc.)
        # Además, para bigramas, verificas que aparezcan en el mismo fragmento original
        if ' ' in kw_lower:
            # Buscar si el bigrama aparece en algún fragmento original
            found = False
            for chunk in chunks:
                if kw_lower in chunk.lower():
                    found = True
                    break
            if not found:
                continue
        filtered.append((kw_lower, score))
    
    return filtered[:top_n]

# ============================================================================
# SIMILITUD Y COVERAGE
# ============================================================================

def calculate_weighted_similarity(
    cv_text: str, job_text: str, cv_keywords: List[str], job_keywords: List[str]
) -> Dict[str, float]:
    _init_models()
    emb_model = get_embedding_model()
    
    cv_clean = preprocess_text(cv_text)
    job_clean = preprocess_text(job_text)
    
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

def _find_term_context(term: str, job_text: str) -> str:
    """
    Devuelve la línea completa (hasta el siguiente salto de línea) que contiene el término.
    Si no se encuentra, intenta con una ventana de oraciones (fallback).
    """
    term_lower = term.lower()
    # 1. Dividir por líneas (respetando saltos)
    lines = job_text.splitlines()
    for line in lines:
        if term_lower in line.lower():
            return line.strip()
    
    # 2. Fallback: dividir por oraciones (por si el texto no tiene saltos de línea)
    sentences = re.split(r'(?<=[.!?;:])\s+', job_text)
    for sentence in sentences:
        if term_lower in sentence.lower():
            return sentence.strip()
    
    return term


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
        fallback_skills = extract_technical_skills(job_text)
        if fallback_skills:
            job_terms_with_scores = [(skill, 0.5) for skill in fallback_skills[:40]]
        else:
            sector = detect_sector_from_text(job_text).get("sector", "general")
            lang = detect_language(job_text)
            sector_skills = get_skill_sector(sector, lang)
            if sector_skills:
                job_terms_with_scores = [(skill, 0.4) for skill in list(sector_skills)[:40]]
            else:
                return 0.0, [], [{
                    "term": "NO_SE_EXTRAJERON_TERMINOS",
                    "score": 0,
                    "semantic_score": 0,
                    "context": "No se detectaron términos técnicos en la oferta."
                }]
    
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
        # (Opcional: más filtros lingüísticos)
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
    sentences = re.split(r'[.!?\n]+', job_text)
    
    for i, (job_term, original_score) in enumerate(zip(filtered_terms, filtered_scores)):
        best_sim = float(sim_matrix[i].max()) if i < len(sim_matrix) else 0.0
        context = ""
        context = _find_term_context(job_term, job_text)  # incluye una oración antes y después



        term_info = {
            "term": job_term,
            "score": round(original_score, 3),
            "semantic_score": round(best_sim, 3),
            "context": context or job_term
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
        # Coincidencia exacta o parcial con skills del sector
        if term_low in sector_skills:
            return True
        words = term_low.split()
        if any(w in sector_skills and len(w) >= 3 for w in words):
            return True
        # Palabras claramente no técnicas
        non_tech = {
            "colectivo", "lgtb", "fisio", "yoga", "gourmet", "retribución", "familia",
            "aventura", "discriminación", "primando", "ofrecemos", "tenemos", "celebramos",
            "organizamos", "cosquilleo", "tripa", "millones", "personas", "jornada",
            "turnos", "presencial", "remoto", "hacemos", "meetups", "mogollón", "sacamos"
        }
        return not any(w in non_tech for w in words)
    
    missing = [item for item in missing if is_technical(item['term'])]
    

    # Eliminar términos redundantes dentro del mismo contexto
    def filter_redundant_terms(missing_list):
        """
        Agrupa por contexto y, dentro de cada grupo, elimina términos que son
        subcadenas de otro término más largo o que tienen un score menor.
        """
        # Agrupar por contexto
        context_groups = {}
        for item in missing_list:
            ctx = item['context']
            if ctx not in context_groups:
                context_groups[ctx] = []
            context_groups[ctx].append(item)
        
        filtered = []
        for ctx, items in context_groups.items():
            # Ordenar por longitud del término (descendente) y luego por score (descendente)
            items.sort(key=lambda x: (len(x['term']), x['score']), reverse=True)
            best = items[0]  # el más largo y con mayor score
            filtered.append(best)
            # Opcional: si hay otros que no son subcadenas del mejor, podrían añadirse, pero es raro
            # Para este caso, nos quedamos solo con el mejor por contexto.
        return filtered

    missing = filter_redundant_terms(missing)

    # Ordenar por relevancia
    missing_sorted = sorted(missing, key=lambda x: x['score'], reverse=True)[:15]
    coverage = round(len(matched) / len(filtered_terms) * 100, 2) if filtered_terms else 0.0
    print(f"📊 Términos relevantes: {len(filtered_terms)} | Matched: {len(matched)} | Missing: {len(missing)}")
    
    return coverage, matched, missing_sorted

# ============================================================================
# FEEDBACK
# ============================================================================

def generate_detailed_feedback(
    scores: Dict[str, float], missing_terms: List[str], matched_terms: List[str],
    cv_text: str, job_text: str, cv_sector_info: Dict[str, Any], job_sector_info: Dict[str, Any],
    experience_cv: int, experience_job: int, education_cv: Tuple[str, int], education_job: Tuple[str, int],
    confidence: float, sector_comparison: Dict[str, Any] = None
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
            "priority": "Alta", "action": "Añadir palabras clave de la oferta",
            "examples": missing_terms[:5], "impact": "Aumentará el match con el ATS"
        })
    
    if scores.get('technical_skills', 0) < 50:
        tech_needed = extract_technical_skills(job_text)[:5]
        if tech_needed:
            recommendations.append({
                "priority": "Alta", "action": "Incluir habilidades técnicas específicas",
                "examples": tech_needed, "impact": "Los ATS buscan skills técnicas exactas"
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
        "confidence_score": round(confidence, 2)
    }


import spacy
from spacy.lang.es.stop_words import STOP_WORDS as ES_STOP_WORDS
from spacy.lang.en.stop_words import STOP_WORDS as EN_STOP_WORDS

def is_relevant_keyword(keyword: str, lang: str = "es") -> bool:
    """
    Determina si una keyword es relevante (técnica) o es ruido.
    Usa reglas lingüísticas y longitud.
    """
    kw_lower = keyword.lower().strip()
    # 1. Longitud de frase > 3 palabras -> ruido
    if len(kw_lower.split()) > 3:
        return False
    
    # 2. Contiene 3 o más dígitos seguidos -> ruido
    if re.search(r'\d{3,}', kw_lower):
        return False
    
    # 3. Cargar modelo spaCy según idioma
    nlp = get_nlp(lang)
    if nlp:
        doc = nlp(kw_lower)
        # Contar tipos de palabras
        has_verb = any(token.pos_ == "VERB" for token in doc)
        has_noun = any(token.pos_ in ("NOUN", "PROPN") for token in doc)
        has_adj = any(token.pos_ == "ADJ" for token in doc)
        has_aux = any(token.pos_ == "AUX" for token in doc)
        has_pron = any(token.pos_ == "PRON" for token in doc)
        has_adp = any(token.pos_ == "ADP" for token in doc)  # preposición
        
        # Si hay verbo y no hay sustantivo/adjetivo -> probable ruido
        if has_verb and not (has_noun or has_adj):
            return False
        # Si la mayoría son preposiciones, pronombres o auxiliares -> ruido
        total = len(doc)
        if total > 0:
            function_words = sum([has_aux, has_adp, has_pron])
            if function_words / total > 0.5:
                return False
    
    # 4. Detectar verbos conjugados por regex (para idiomas)
    # Patrón para verbos en español: formas como "trabajarás", "ofrecemos", "puedes"
    spanish_verb_endings = (r'[aeiou]r[áa]s$', r'[aeiou]mos$', r'[aeiou]s$', r'[aeiou]n$')
    english_verb_forms = (r'ing$', r'ed$', r's$', r'will\s+', r'can\s+', r'may\s+')
    if lang == "es":
        for pattern in spanish_verb_endings:
            if re.search(pattern, kw_lower):
                # Si además no es un sustantivo conocido (ej: "programación" termina en -ción, no es verbo)
                if not re.search(r'ción$', kw_lower):
                    return False
    else:
        for pattern in english_verb_forms:
            if re.search(pattern, kw_lower):
                # Excepción: palabras como "testing" pueden ser sustantivo
                if kw_lower not in ("testing", "programming", "coding"):
                    return False
    
    # 5. Palabras vacías en medio (preposiciones, artículos, conjunciones)
    empty_words = {"en", "de", "la", "el", "los", "las", "con", "para", "por", "sin", 
                   "sobre", "mediante", "través", "durante", "a", "ante", "bajo", 
                   "cabe", "contra", "desde", "entre", "hacia", "hasta", "según", "tras",
                   "and", "or", "of", "for", "to", "with", "without", "by", "through"}
    tokens = kw_lower.split()
    if any(token in empty_words for token in tokens):
        # Si la frase tiene más de una palabra y contiene una palabra vacía, filtrar
        if len(tokens) > 1:
            return False
    
    return True


# ============================================================================
# ENDPOINTS
# ============================================================================

@app.get("/")
async def root() -> Dict[str, str]:
    return {"message": "ATS Beater API funcionando", "status": "ok", "version": "4.0"}


@app.get("/health")
async def health_check() -> Dict[str, Any]:
    return {
        "status": "healthy", "version": "4.0",
        "models": {"sentence_transformer": "loaded" if _embedding_model else "no",
                   "spacy_es": "loaded" if _nlp_es else "no",
                   "spacy_en": "loaded" if _nlp_en else "no"},
        "available_sectors": get_all_sectors(),
        "cache_size": len(_embedding_cache), "timestamp": datetime.now().isoformat()
    }


@app.get("/sectors")
async def list_sectors() -> Dict[str, Any]:
    """Devuelve la lista de sectores disponibles"""
    return {"sectors": get_all_sectors()}


@app.post("/analyze-cv/")
async def analyze_cv(
    cv_file: UploadFile = File(...), job_description: str = Form(...), mode: str = Form("balanced")
) -> Dict[str, Any]:
    try:
        if not cv_file:
            raise HTTPException(status_code=400, detail="No se recibió archivo")
        
        cv_text = await extract_text(cv_file)
        job_text = job_description.strip()
        
        if not cv_text or len(cv_text.strip()) < 50:
            return {"error": "CV vacío o muy poco texto", "ats_score": 0, "level": "Error"}
        if not job_text or len(job_text.strip()) < 50:
            return {"error": "Descripción del puesto muy corta", "ats_score": 0, "level": "Error"}
        
        # Detectar idioma
        main_lang = detect_language(job_text)
        
        # Detectar sectores del CV y la oferta
        cv_sector_info = detect_sector_from_text(cv_text)
        job_sector_info = detect_sector_from_text(job_text)
        
        cv_sector = cv_sector_info.get("sector", "general")
        job_sector = job_sector_info.get("sector", "general")
        
        # Configurar umbrales según sector
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
        
        # Extraer experiencia y educación
        experience_job = extract_experience_years(job_text)
        experience_cv = extract_experience_years(cv_text)
        education_job = extract_education_level(job_text)
        education_cv = extract_education_level(cv_text)
        
        # Extraer keywords
        cv_keywords_weighted = extract_keywords_advanced(cv_text, top_n=config.TOP_N_KEYWORDS, force_lang=main_lang)
        job_keywords_weighted = extract_keywords_advanced(job_text, top_n=config.TOP_N_KEYWORDS, force_lang=main_lang)
        
        cv_terms = [kw for kw, _ in cv_keywords_weighted]
        job_terms = [kw for kw, _ in job_keywords_weighted]
        
        # Calcular similitud
        similarity_scores = calculate_weighted_similarity(cv_text, job_text, cv_terms, job_terms)
        
        if job_keywords_weighted and len(job_keywords_weighted) > 0:
            keyword_coverage, matched_terms, missing_terms_with_context = semantic_term_coverage(
                cv_terms, job_keywords_weighted, job_text, threshold=config.SEMANTIC_THRESHOLD
            )
        else:
            keyword_coverage, matched_terms, missing_terms_with_context = 0.0, [], []
        
        missing_terms = [item['term'] for item in missing_terms_with_context]
        similarity_scores['keyword_exact'] = keyword_coverage
        similarity_scores['overall'] = round((similarity_scores['semantic'] * 0.5 + keyword_coverage * 0.5), 2)
        
        confidence = calculate_confidence_score(cv_text, job_text)
        
        feedback = generate_detailed_feedback(
            similarity_scores, missing_terms, matched_terms, cv_text, job_text,
            cv_sector_info, job_sector_info, experience_cv, experience_job,
            education_cv, education_job, confidence, sector_comparison
        )
        
        extracted_skills_cv = extract_technical_skills(cv_text)
        extracted_skills_job = extract_technical_skills(job_text)
        
        #  de skills del sector
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
            "sector_skills_suggestions": sector_skills_suggestions
        }
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error: {str(e)}")
        return {"error": f"Error: {str(e)}", "ats_score": 0, "level": "Error"}


@app.post("/optimize-cv/")
async def optimize_cv(cv_file: UploadFile = File(...), job_description: str = Form(...)) -> Dict[str, Any]:
    try:
        cv_text = await extract_text(cv_file)
        job_text = job_description.strip()
        
        if not cv_text or len(cv_text.strip()) < 50:
            return {"error": "CV vacío", "success": False}
        if not job_text or len(job_text.strip()) < 50:
            return {"error": "Descripción muy corta", "success": False}
        
        main_lang = detect_language(job_text)
        job_sector_info = detect_sector_from_text(job_text)
        
        cv_keywords_weighted = extract_keywords_advanced(cv_text, top_n=config.TOP_N_KEYWORDS, force_lang=main_lang)
        job_keywords_weighted = extract_keywords_advanced(job_text, top_n=config.TOP_N_KEYWORDS, force_lang=main_lang)
        cv_terms = [kw for kw, _ in cv_keywords_weighted]
        
        _, _, missing_terms_with_context = semantic_term_coverage(
            cv_terms, job_keywords_weighted, job_text, threshold=config.SEMANTIC_THRESHOLD
        )
        missing_terms = [item['term'] for item in missing_terms_with_context] if missing_terms_with_context else []
        
        if cv_terms and job_keywords_weighted:
            similarity_scores = calculate_weighted_similarity(cv_text, job_text, cv_terms, [t for t, _ in job_keywords_weighted])
            current_score = similarity_scores.get('overall', 0)
        else:
            current_score = 0
        
        if not missing_terms:
            return {"success": True, "has_optimizations": False, "message": "Tu CV ya está muy bien optimizado", "score": current_score}
        
        optimizations = generate_cv_optimizations(
            missing_terms=missing_terms, job_text=job_text, profession=job_sector_info.get("sector", "general")
        )
        
        return {"success": True, "has_optimizations": True, "score": current_score, "optimizations": optimizations, "missing_terms_count": len(missing_terms)}
    
    except Exception as e:
        print(f"Error: {str(e)}")
        return {"error": str(e), "success": False}


@app.post("/export-report/")
async def export_report(cv_file: UploadFile = File(...), job_description: str = Form(...), format: str = Form("text")) -> Dict[str, Any]:
    try:
        cv_text = await extract_text(cv_file)
        job_text = job_description.strip()
        
        if not cv_text or not job_text:
            raise HTTPException(status_code=400, detail="Datos incompletos")
        
        main_lang = detect_language(job_text)
        cv_sector_info = detect_sector_from_text(cv_text)
        job_sector_info = detect_sector_from_text(job_text)
        
        cv_keywords_weighted = extract_keywords_advanced(cv_text, top_n=30, force_lang=main_lang)
        job_keywords_weighted = extract_keywords_advanced(job_text, top_n=30, force_lang=main_lang)
        
        cv_terms = [kw for kw, _ in cv_keywords_weighted]
        
        scores = calculate_weighted_similarity(cv_text, job_text, cv_terms, [t for t, _ in job_keywords_weighted])
        coverage, matched, missing = semantic_term_coverage(cv_terms, job_keywords_weighted, job_text)
        
        sector_comparison = compare_skills_between_sectors(cv_sector_info.get("sector", "general"), job_sector_info.get("sector", "general"), main_lang)
        
        experience_cv = extract_experience_years(cv_text)
        experience_job = extract_experience_years(job_text)
        education_cv = extract_education_level(cv_text)
        education_job = extract_education_level(job_text)
        confidence = calculate_confidence_score(cv_text, job_text)
        
        feedback = generate_detailed_feedback(
            scores, missing, matched, cv_text, job_text,
            cv_sector_info, job_sector_info, experience_cv, experience_job,
            education_cv, education_job, confidence, sector_comparison
        )
        
        if format == "json":
            return feedback
        else:
            report_lines = [
                "=" * 60, "ATS BEATER - REPORTE DE ANÁLISIS v4.0",
                f"Fecha: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}", "=" * 60, "",
                f"PUNTUACIÓN ATS: {feedback.get('ats_score', 0)}/100",
                f"NIVEL: {feedback.get('level', 'N/A')}",
                f"SECTOR CV: {cv_sector_info.get('sector', 'general').upper()}",
                f"SECTOR OFERTA: {job_sector_info.get('sector', 'general').upper()}",
                f"CONFIANZA: {feedback.get('confidence_score', 0)}%", "",
                f"RESUMEN: {feedback.get('summary', 'N/A')}", "",
                "-" * 40, "MÉTRICAS DETALLADAS:", "-" * 40
            ]
            
            for key, value in feedback.get('detailed_scores', {}).items():
                report_lines.append(f"  • {key.replace('_', ' ').title()}: {value}%")
            
            if sector_comparison:
                report_lines.extend(["", "-" * 40, "COMPARATIVA DE SECTORES:", "-" * 40])
                report_lines.append(f"  • Match de skills: {sector_comparison.get('match_percentage', 0)}%")
                if sector_comparison.get('missing_skills'):
                    report_lines.append(f"  • Skills faltantes del sector: {', '.join(sector_comparison.get('missing_skills', [])[:10])}")
            
            report_lines.extend(["", "-" * 40, "EXPERIENCIA Y EDUCACIÓN:", "-" * 40])
            exp_match = feedback.get('experience_match', {})
            report_lines.append(f"  • Experiencia: {exp_match.get('detected', 0)} / {exp_match.get('required', 0)} años ({exp_match.get('match', 0)}%)")
            edu_match = feedback.get('education_match', {})
            report_lines.append(f"  • Educación: {edu_match.get('detected_level', 'ninguno')} / {edu_match.get('required_level', 'ninguno')} ({edu_match.get('match', 0)}%)")
            report_lines.extend(["", "-" * 40, "TÉRMINOS CLAVE FALTANTES:", "-" * 40])
            
            for term in feedback.get('priority_missing_terms', [])[:10]:
                report_lines.append(f"  • {term}")
            
            report_lines.extend(["", "=" * 60])
            return {"report": "\n".join(report_lines), "format": "text"}
            
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")

# ============================================================================
# EJECUCIÓN
# ============================================================================

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)