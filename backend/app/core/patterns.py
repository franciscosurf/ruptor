import re
from typing import List

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