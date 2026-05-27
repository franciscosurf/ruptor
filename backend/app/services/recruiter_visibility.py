import re

def calculate_recruiter_visibility(cv_text: str) -> float:
    """
    Calcula un score de 0 a 100 que estima la probabilidad de que un reclutador
    humano encuentre el CV atractivo y legible después de superar los filtros ATS.
    """
    score = 0.0
    cv_lower = cv_text.lower()
    
    # 1. Claridad de secciones (25%)
    # Detectar encabezados típicos
    section_headers = ['experiencia', 'educación', 'habilidades', 'idiomas', 'proyectos']
    sections_found = sum(1 for header in section_headers if re.search(rf'\b{header}\b', cv_lower))
    section_score = min(1.0, sections_found / 3) * 0.25
    score += section_score
    
    # 2. Uso de viñetas o listas (20%)
    bullet_chars = ['•', '-', '*', '·', '◦', '‣', '⁃', r'\d+\.']
    bullet_pattern = '|'.join(re.escape(b) for b in bullet_chars)
    bullet_lines = sum(1 for line in cv_text.splitlines() if re.match(rf'^\s*(?:{bullet_pattern})', line))
    bullet_score = min(1.0, bullet_lines / 5) * 0.20
    score += bullet_score
    
    # 3. Logros cuantificables (30%)
    quantifiers = [
        r'\b\d+%', r'\b\d+\s*(?:veces|unidades)', r'aument[óo]', r'reduj[oó]', 
        r'increment[oó]', r'ahorro', r'€', r'\$\d+', r'\d+\s*k€', r'mejor[óo]'
    ]
    quant_matches = sum(1 for pattern in quantifiers if re.search(pattern, cv_lower))
    quant_score = min(1.0, quant_matches / 3) * 0.30
    score += quant_score
    
    # 4. Formato de una sola columna (15%) - heurística: ausencia de tablas o columnas?
    # Detectamos tablas HTML o múltiples columnas con regex simple
    has_columns = re.search(r'<table|grid|c\s+l\s+o\s+l\s+u\s+m\s+n|col-', cv_lower)
    column_score = 0.15 if not has_columns else 0.05
    score += column_score
    
    # 5. Longitud óptima (10%) - entre 1 y 2 páginas (aprox 300-600 palabras por página)
    word_count = len(cv_text.split())
    if 300 <= word_count <= 1200:
        length_score = 0.10
    elif 200 <= word_count < 300 or 1200 < word_count <= 1500:
        length_score = 0.05
    else:
        length_score = 0.0
    score += length_score
    
    # Bonus: presencia de logros con números (ya está incluido en quantifiers)
    # Bonus extra por verbos de acción
    action_verbs = ['lideré', 'gestioné', 'implementé', 'diseñé', 'creé', 'optimicé', 'aumenté']
    action_count = sum(1 for verb in action_verbs if re.search(rf'\b{verb}\b', cv_lower))
    if action_count >= 2:
        score = min(1.0, score + 0.05)
    
    return round(score * 100, 2)

