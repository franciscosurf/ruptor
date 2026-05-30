# app/services/focus_service.py
import re
from typing import List

def extract_achievement_sentences(cv_text: str) -> List[str]:
    """
    Extrae frases de logros reales, ignorando fechas, 
    números de teléfono y datos de contacto.
    """
    if not cv_text:
        return []
    
    # Separamos por líneas y limpiamos
    lines = [line.strip() for line in cv_text.split('\n') if line.strip()]
    achievements = []
    
    for line in lines:
        # 1. Filtro de longitud básico
        if len(line) <= 20:
            continue
            
        # 2. FILTRO DE SEGURIDAD INTERNET/CONTACTO
        # Si tiene un email o enlaces de portafolio, no es un logro.
        if '@' in line or any(k in line.lower() for k in ['teléfono', 'linkedin', 'github', 'www.']):
            continue
            
        # 3. LIMPIEZA TEMPORAL PARA EVALUACIÓN
        # Creamos una copia de la línea y le borramos los años (4 dígitos que empiecen por 19 o 20)
        # Así evitamos que "Julio 2017" o "Democracia 2024" activen el disparador.
        clean_line = re.sub(r'\b(19|20)\d{2}\b', '', line)
        
        # Borramos números de teléfono (patrones de más de 6 dígitos seguidos o con espacios)
        clean_line = re.sub(r'(\+?\d[\s-]?){7,}', '', clean_line)
        
        # 4. EVALUACIÓN DE LOGRO REAL
        # Buscamos si en el texto limpio queda un porcentaje (%), símbolo de dinero ($, €, £)
        # o algún número de impacto (ej. "Mantenimiento de 3 plataformas", "Ahorro de 2 semanas")
        # Excluimos números sueltos de un solo dígito que huelen a versiones (como ES6 o Webpack 5)
        quantified_pattern = re.compile(r'(%|\$|€|£|\b\d{2,}\b|\b\d+\s*\+|más de \d+)')
        
        if quantified_pattern.search(clean_line):
            achievements.append(line)
            
    return achievements