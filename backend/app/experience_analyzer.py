"""
experience_analyzer.py - Módulo para análisis de experiencia laboral
"""

import re
from datetime import datetime
from typing import Dict, Any, List, Tuple


# ============================================================================
# Funciones auxiliares de parseo de fechas (sin dateutil)
# ============================================================================
MONTH_NAMES = {
    'enero':1, 'febrero':2, 'marzo':3, 'abril':4, 'mayo':5, 'junio':6,
    'julio':7, 'agosto':8, 'septiembre':9, 'octubre':10, 'noviembre':11, 'diciembre':12,
    'ene':1, 'feb':2, 'mar':3, 'abr':4, 'may':5, 'jun':6, 'jul':7, 'ago':8,
    'sep':9, 'sept':9, 'oct':10, 'nov':11, 'dic':12,
    'january':1, 'february':2, 'march':3, 'april':4, 'june':6, 'july':7,
    'august':8, 'september':9, 'october':10, 'november':11, 'december':12,
    'jan':1, 'feb':2, 'mar':3, 'apr':4, 'jun':6, 'jul':7, 'aug':8,
    'sep':9, 'oct':10, 'nov':11, 'dec':12
}


def _parse_month_year(date_str: str) -> datetime:
    """
    Parsea fechas en formato "Mes Año" (español/inglés) o solo "Año".
    Devuelve un objeto datetime (día 1 del mes).
    """
    date_str = date_str.strip().lower()
    
    # Meses en español e inglés
    months = {
        'enero': 1, 'febrero': 2, 'marzo': 3, 'abril': 4, 'mayo': 5, 'junio': 6,
        'julio': 7, 'agosto': 8, 'septiembre': 9, 'octubre': 10, 'noviembre': 11, 'diciembre': 12,
        'ene': 1, 'feb': 2, 'mar': 3, 'abr': 4, 'may': 5, 'jun': 6,
        'jul': 7, 'ago': 8, 'sep': 9, 'sept': 9, 'oct': 10, 'nov': 11, 'dic': 12,
        'january': 1, 'february': 2, 'march': 3, 'april': 4, 'june': 6, 'july': 7,
        'august': 8, 'september': 9, 'october': 10, 'november': 11, 'december': 12,
        'jan': 1, 'feb': 2, 'mar': 3, 'apr': 4, 'jun': 6, 'jul': 7, 'aug': 8,
        'sep': 9, 'oct': 10, 'nov': 11, 'dec': 12
    }
    
    # Solo año
    if date_str.isdigit() and len(date_str) == 4:
        return datetime(int(date_str), 1, 1)
    
    # Mes Año
    parts = date_str.split()
    if len(parts) >= 2:
        month_name = parts[0]
        if month_name in months:
            try:
                year = int(parts[1])
                return datetime(year, months[month_name], 1)
            except:
                pass
    
    # Fallback: devolver fecha mínima (no debería ocurrir)
    return datetime(1900, 1, 1)


def _calculate_months_between(start: datetime, end: datetime) -> int:
    """Calcula meses completos entre dos fechas."""
    if start > end:
        start, end = end, start
    months = (end.year - start.year) * 12 + (end.month - start.month)
    return max(0, months)


# ============================================================================
# Funciones principales
# ============================================================================

def extract_experience_years(text: str) -> int:
    """
    Extrae años de experiencia laboral del texto.
    Primero busca declaraciones explícitas; si no, calcula a partir de fechas de trabajo.
    """
    result = _extract_experience_detailed(text)
    return int(result["total_years"])


def get_experience_years(text: str) -> int:
    return extract_experience_years(text)


def compare_experience(cv_years: float, job_years: float) -> Dict[str, Any]:
    """Compara experiencia del CV vs requerida"""
    if job_years == 0:
        return {
            "match_percentage": 100,
            "difference": 0,
            "status": "no_requirement",
            "recommendation": "No se especifica requisito de experiencia"
        }
    if cv_years >= job_years:
        match = min(100, (cv_years / job_years) * 100)
        return {
            "match_percentage": round(match, 2),
            "difference": round(cv_years - job_years, 1),
            "status": "exceeds" if cv_years > job_years else "meets",
            "recommendation": f"Cumples con los {job_years} años requeridos"
        }
    else:
        match = (cv_years / job_years) * 100
        gap = job_years - cv_years
        return {
            "match_percentage": round(match, 2),
            "difference": round(cv_years - job_years, 1),
            "status": "below",
            "recommendation": f"Te faltan {round(gap, 1)} años de experiencia"
        }


def _extract_experience_detailed2(text: str) -> Dict[str, Any]:
    """
    Extrae experiencia: primero busca declaraciones explícitas; si no, calcula desde fechas de trabajo.
    """
    text_lower = text.lower()

    # 1. Frases que indican que NO hay requisito fijo
    no_req_phrases = [
        "depending on experience", "depending on your experience",
        "dependiendo de la experiencia", "según experiencia",
        "no experience required", "sin experiencia requerida"
    ]
    for phrase in no_req_phrases:
        if phrase in text_lower:
            return {"total_years": 0, "detected_by": "not_specified", "confidence": "low", "details": "Sin requisito fijo"}

    # 2. Declaraciones explícitas
    explicit_patterns = [
        r'(\d+(?:\.\d+)?)\+?\s*(?:years?|yrs?)\s+(?:of\s+)?(?:experience|exp)',
        r'(\d+)\+\s*(?:years?|yrs?)',
        r'at\s+least\s+(\d+)\s*(?:years?|yrs?)',
        r'minimum\s+(\d+)\s*(?:years?|yrs?)',
        r'(\d+(?:\.\d+)?)\+?\s*(?:años?)\s+(?:de\s+)?(?:experiencia|exp)',
        r'al\s+menos\s+(\d+)\s*(?:años?|años de experiencia)',
        r'mínimo\s+(\d+)\s*(?:años?|años de experiencia)',
    ]
    for pattern in explicit_patterns:
        match = re.search(pattern, text_lower)
        if match:
            years = float(match.group(1))
            if 1 <= years <= 50:
                return {"total_years": years, "detected_by": "explicit", "confidence": "high", "details": f"Declarado: {years} años"}

    # 3. Rango explícito (ej: 3-5 años de experiencia)
    range_pattern = r'(\d+)\s*[-–—]\s*(\d+)\s*(?:years?|años?)\s+(?:of\s+)?(?:experience|exp|experiencia)'
    match = re.search(range_pattern, text_lower)
    if match:
        avg = (float(match.group(1)) + float(match.group(2))) / 2
        return {"total_years": round(avg, 1), "detected_by": "range", "confidence": "medium", "details": f"Rango {match.group(1)}-{match.group(2)} años"}

    # 4. Extraer experiencia desde fechas de trabajo (sumando periodos)
    # 4. Extraer experiencia desde fechas de trabajo (sumando periodos)
    current_year = datetime.now().year
    current_month = datetime.now().month
    total_months = 0

    # Diccionario de meses (español e inglés, completos y abreviados)
    months = {
        'enero':1, 'febrero':2, 'marzo':3, 'abril':4, 'mayo':5, 'junio':6,
        'julio':7, 'agosto':8, 'septiembre':9, 'octubre':10, 'noviembre':11, 'diciembre':12,
        'ene':1, 'feb':2, 'mar':3, 'abr':4, 'may':5, 'jun':6, 'jul':7, 'ago':8,
        'sep':9, 'sept':9, 'oct':10, 'nov':11, 'dic':12,
        'january':1, 'february':2, 'march':3, 'april':4, 'june':6, 'july':7,
        'august':8, 'september':9, 'october':10, 'november':11, 'december':12,
        'jan':1, 'feb':2, 'mar':3, 'apr':4, 'jun':6, 'jul':7, 'aug':8, 'sep':9, 'oct':10, 'nov':11, 'dec':12
    }
    # Lista de nombres de meses para construir el patrón regex
    month_names = '|'.join(months.keys())
    # Patrón para un mes seguido de año (ej: "Marzo 2019" o "Nov 2014")
    month_year_pattern = r'\b(' + month_names + r')\s+(\d{4})\b'
    # Patrón para el extremo derecho: puede ser otro "mes año" o "presente"
    end_pattern = r'(' + month_year_pattern + r'|\b(?:present|actual|current|ahora|hoy)\b)'

    # Patrón completo: inicio (mes año) separado por guiones y fin
    full_pattern = re.compile(
        r'\b(' + month_year_pattern + r')\s*[-–—]\s*(' + end_pattern + r')',
        re.IGNORECASE
    )

    # Buscar todos los rangos
    for match in full_pattern.finditer(text):
        # Grupo 1: todo el inicio (ej "Marzo 2019")
        start_full = match.group(1)
        start_month_name = match.group(2).lower()
        start_year = int(match.group(3))
        # Grupo 4: todo el final (ej "Presente" o "Septiembre 2018")
        end_full = match.group(4).lower()
        start_month = months.get(start_month_name, 1)
        start_date = datetime(start_year, start_month, 1)

        if end_full in ('present', 'actual', 'current', 'ahora', 'hoy'):
            end_date = datetime(current_year, current_month, 1)
        else:
            # end_full tiene formato "mes año"
            # Extraer mes y año de end_full usando el mismo patrón de meses
            end_match = re.search(month_year_pattern, end_full, re.IGNORECASE)
            if end_match:
                end_month_name = end_match.group(1).lower()
                end_year = int(end_match.group(2))
                end_month = months.get(end_month_name, 1)
                end_date = datetime(end_year, end_month, 1)
            else:
                continue

        # Calcular meses
        months_diff = (end_date.year - start_date.year) * 12 + (end_date.month - start_date.month)
        if months_diff > 0:
            total_months += months_diff

    # También buscar rangos de solo años (ej: 2014-2017) pero cuidado con falsos positivos
    # Para evitar duplicados, solo si no se han encontrado rangos con mes (o complementar)
    # Pero en tu CV los rangos tienen mes, así que no haría falta. Aún así, lo dejamos por si acaso.
    if total_months == 0:
        year_range_pattern = re.compile(r'\b(\d{4})\s*[-–—]\s*(\d{4})\b')
        for match in year_range_pattern.finditer(text):
            start_year = int(match.group(1))
            end_year = int(match.group(2))
            if end_year > start_year:
                total_months += (end_year - start_year) * 12

    if total_months > 0:
        total_years = total_months / 12
        return {"total_years": round(total_years, 1), "detected_by": "dates", "confidence": "high", "details": f"Calculado desde fechas: {total_years} años"}

    return {"total_years": 0, "detected_by": "none", "confidence": "low", "details": "No se detectó experiencia"}


def _extract_experience_detailed(text: str) -> Dict[str, Any]:
    """
    Extrae experiencia laboral desde:
    1. Declaraciones explícitas (ej: "5 years of experience")
    2. Rangos explícitos (ej: "3-5 years")
    3. Fechas de experiencia laboral (ej: "Marzo 2019 – Presente")

    Compatible con inglés y español.
    """

    text_lower = text.lower()

    # =========================================================
    # 1. Frases que indican que NO hay requisito fijo
    # =========================================================

    no_req_phrases = [
        "depending on experience",
        "depending on your experience",
        "based on experience",
        "according to experience",

        "dependiendo de la experiencia",
        "según experiencia",
        "segun experiencia",
        "en función de la experiencia",
        "sin experiencia requerida",
        "no experience required",
        "experience not required"
    ]

    for phrase in no_req_phrases:
        if phrase in text_lower:
            return {
                "total_years": 0,
                "detected_by": "not_specified",
                "confidence": "low",
                "details": "Sin requisito fijo"
            }

    # =========================================================
    # 2. Declaraciones explícitas
    # =========================================================

    explicit_patterns = [

        # English
        r'(\d+(?:\.\d+)?)\+?\s*(?:years?|yrs?)\s+(?:of\s+)?(?:experience|exp)',
        r'(\d+)\+\s*(?:years?|yrs?)',
        r'at\s+least\s+(\d+)\s*(?:years?|yrs?)',
        r'minimum\s+(\d+)\s*(?:years?|yrs?)',

        # Spanish
        r'(\d+(?:\.\d+)?)\+?\s*(?:años?)\s+(?:de\s+)?(?:experiencia|exp)',
        r'al\s+menos\s+(\d+)\s*(?:años?)',
        r'mínimo\s+(\d+)\s*(?:años?)',
        r'minimo\s+(\d+)\s*(?:años?)',
    ]

    for pattern in explicit_patterns:
        match = re.search(pattern, text_lower, re.IGNORECASE)

        if match:
            years = float(match.group(1))

            if 1 <= years <= 50:
                return {
                    "total_years": years,
                    "detected_by": "explicit",
                    "confidence": "high",
                    "details": f"Declarado explícitamente: {years} años"
                }

    # =========================================================
    # 3. Rangos explícitos
    # Ej: 3-5 years of experience
    # =========================================================

    range_pattern = (
        r'(\d+)\s*[-–—]\s*(\d+)\s*'
        r'(?:years?|yrs?|años?)\s+'
        r'(?:of\s+)?(?:experience|exp|experiencia)'
    )

    match = re.search(range_pattern, text_lower, re.IGNORECASE)

    if match:

        start = float(match.group(1))
        end = float(match.group(2))

        avg = (start + end) / 2

        return {
            "total_years": round(avg, 1),
            "detected_by": "range",
            "confidence": "medium",
            "details": f"Rango detectado: {start}-{end} años"
        }

    # =========================================================
    # 4. Calcular experiencia desde fechas laborales
    # =========================================================

    current_date = datetime.now()

    total_months = 0

    # ---------------------------------------------------------
    # Meses español + inglés
    # ---------------------------------------------------------

    months = {

        # Español completos
        'enero': 1,
        'febrero': 2,
        'marzo': 3,
        'abril': 4,
        'mayo': 5,
        'junio': 6,
        'julio': 7,
        'agosto': 8,
        'septiembre': 9,
        'setiembre': 9,
        'octubre': 10,
        'noviembre': 11,
        'diciembre': 12,

        # Español abreviados
        'ene': 1,
        'feb': 2,
        'mar': 3,
        'abr': 4,
        'may': 5,
        'jun': 6,
        'jul': 7,
        'ago': 8,
        'sep': 9,
        'sept': 9,
        'oct': 10,
        'nov': 11,
        'dic': 12,

        # English full
        'january': 1,
        'february': 2,
        'march': 3,
        'april': 4,
        'may': 5,
        'june': 6,
        'july': 7,
        'august': 8,
        'september': 9,
        'october': 10,
        'november': 11,
        'december': 12,

        # English abbreviated
        'jan': 1,
        'feb': 2,
        'mar': 3,
        'apr': 4,
        'jun': 6,
        'jul': 7,
        'aug': 8,
        'sep': 9,
        'sept': 9,
        'oct': 10,
        'nov': 11,
        'dec': 12,
    }

    month_names = '|'.join(
        sorted(months.keys(), key=len, reverse=True)
    )

    # ---------------------------------------------------------
    # Regex principal
    # Detecta:
    #
    # Marzo 2019 – Presente
    # Jul 2017 - Sept 2018
    # Nov 2014 – Jun 2017
    # ---------------------------------------------------------

    full_pattern = re.compile(

        rf'(?P<start_month>{month_names})\s+'
        rf'(?P<start_year>\d{{4}})\s*'
        rf'[-–—]\s*'
        rf'('
        rf'(?P<end_month>{month_names})\s+'
        rf'(?P<end_year>\d{{4}})'
        rf'|'
        rf'(?P<present>'
        rf'present|presente|current|actual|'
        rf'now|ahora|today|hoy'
        rf')'
        rf')',

        re.IGNORECASE
    )

    # ---------------------------------------------------------
    # Extraer rangos
    # ---------------------------------------------------------

    for match in full_pattern.finditer(text_lower):

        try:

            # Inicio
            start_month_name = match.group('start_month').lower()
            start_year = int(match.group('start_year'))

            start_month = months[start_month_name]

            start_date = datetime(start_year, start_month, 1)

            # Fin
            if match.group('present'):

                end_date = datetime(
                    current_date.year,
                    current_date.month,
                    1
                )

            else:

                end_month_name = match.group('end_month').lower()
                end_year = int(match.group('end_year'))

                end_month = months[end_month_name]

                end_date = datetime(end_year, end_month, 1)

            # Validación
            if end_date <= start_date:
                continue

            # Diferencia en meses
            months_diff = (
                (end_date.year - start_date.year) * 12
                + (end_date.month - start_date.month)
            )

            # Evitar absurdos
            if 0 < months_diff < 600:
                total_months += months_diff

        except Exception:
            continue

    # =========================================================
    # 5. Fallback: rangos de años simples
    # Ej: 2014-2017
    # =========================================================

    if total_months == 0:

        year_range_pattern = re.compile(
            r'\b(19\d{2}|20\d{2})\s*[-–—]\s*(19\d{2}|20\d{2})\b'
        )

        for match in year_range_pattern.finditer(text):

            start_year = int(match.group(1))
            end_year = int(match.group(2))

            if end_year > start_year:

                years_diff = end_year - start_year

                if years_diff < 50:
                    total_months += years_diff * 12

    # =========================================================
    # Resultado final
    # =========================================================

    if total_months > 0:

        total_years = round(total_months / 12, 1)

        return {
            "total_years": total_years,
            "detected_by": "dates",
            "confidence": "high",
            "details": (
                f"Calculado desde fechas laborales: "
                f"{total_years} años"
            )
        }

    return {
        "total_years": 0,
        "detected_by": "none",
        "confidence": "low",
        "details": "No se detectó experiencia"
    }
