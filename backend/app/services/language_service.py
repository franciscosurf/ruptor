from langdetect import detect

def detect_language(text: str) -> str:
    try:
        lang = detect(text[:300])
        return "es" if lang == "es" else "en"
    except:
        return "en"