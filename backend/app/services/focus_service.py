# app/services/focus_service.py
import re
from typing import List

def extract_achievement_sentences(cv_text: str) -> List[str]:
    """
    Extrae frases de logros reales, ignorando fechas, números de teléfono,
    datos de contacto y direcciones postales (Soporta Español e Inglés).
    """
    if not cv_text:
        return []
    
    # Separamos por líneas y limpiamos
    lines = [line.strip() for line in cv_text.split('\n') if line.strip()]
    achievements = []
    
    # Palabras clave de contacto combinadas
    contact_keywords = [
        'teléfono', 'telefono', 'phone', 'telephone', 'mobile', 'cell', 
        'linkedin', 'github', 'www.', 'email', 'correo', 'contact'
    ]
    
    # Palabras clave de direcciones (ES / EN)
    address_keywords = [
        'calle', 'c/', 'avda', 'avenida', 'plaza', 'piso', 'población', 'provincia', 'c.p.', 'cod. postal',
        'street', 'st.', 'st ', 'avenue', 'ave.', 'road', 'rd.', 'boulevard', 'blvd', 'drive', 'dr.', 
        'zip code', 'postcode', 'p.o. box', 'address', 'suite', 'apt', 'apartment'
    ]
    
    for line in lines:
        # 1. Filtro de longitud básico
        if len(line) <= 20:
            continue
            
        # 2. FILTRO DE SEGURIDAD INTERNET/CONTACTO
        if '@' in line or any(k in line.lower() for k in contact_keywords):
            continue
            
        # 3. FILTRO SISTEMÁTICO DE DIRECCIONES (ES e Internacional)
        # Si la línea no tiene una métrica fuerte (%, €, $, £, ¥), buscamos si es una dirección
        if not any(metric in line for metric in ['%', '€', '$', '£', '¥']):
            # Código postal estándar de 5 dígitos (España, USA, etc.)
            has_zip_code = bool(re.search(r'\b\d{5}\b', line))
            
            # Código postal de Reino Unido (ej: SW1A 1AA, EC1A 1BB)
            has_uk_postcode = bool(re.search(r'\b[A-Z]{1,2}\d[A-Z\d]?\s*\d[A-Z]{2}\b', line, re.IGNORECASE))
            
            has_address_keyword = any(k in line.lower() for k in address_keywords)
            
            if has_zip_code or has_uk_postcode or has_address_keyword:
                continue # Saltamos la línea de la dirección
            
        # 4. LIMPIEZA TEMPORAL PARA EVALUACIÓN
        # Borramos los años (4 dígitos que empiecen por 19 o 20)
        clean_line = re.sub(r'\b(19|20)\d{2}\b', '', line)
        
        # Borramos números de teléfono
        clean_line = re.sub(r'(\+?\d[\s-]?){7,}', '', clean_line)
        
        # 5. EVALUACIÓN DE LOGRO REAL (Métricas ES / EN)
        # Añadidos disparadores como "more than X" u "over X" para detectar impactos en inglés
        quantified_pattern = re.compile(
            r'(%|\$|€|£|¥|\b\d{2,}\b|\b\d+\s*\+|más de \d+|more than \d+|over \d+)'
        )
        
        if quantified_pattern.search(clean_line):
            achievements.append(line)
            
    return achievements