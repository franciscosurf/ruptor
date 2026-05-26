from langdetect import detect, LangDetectException


def detect_language(text: str) -> str:
    """
    Detecta idioma principal del texto.
    Devuelve:
    - 'es'
    - 'en'
    """

    try:

        lang = detect(text[:300])

        return "es" if lang == "es" else "en"

    except LangDetectException:

        return "en"