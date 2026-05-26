import re


NOISE_PATTERN = re.compile(
    r'^[\+\-\*\#\@\!\%\^&\(\)\[\]\{\}\|\;\:\"\'\<\>\,]'
    r'|.*[\(\)\[\]\{\}\=\<\>].*|^https?://|^\+?\d[\d\s\-]{5,}|^\d+$|^[\s\W]+$|^_+$',
    re.IGNORECASE
)



def clean_text(text: str) -> str:
    text = text.replace("\r", " ")
    text = re.sub(r'\s+', ' ', text)
    return text.strip()



def remove_noise_lines(text: str) -> str:
    lines = text.splitlines()

    cleaned = []

    for line in lines:
        line = line.strip()

        if not line:
            continue

        if NOISE_PATTERN.search(line):
            continue

        cleaned.append(line)

    return "\n".join(cleaned)



def normalize_text(text: str) -> str:
    text = clean_text(text)
    text = remove_noise_lines(text)
    return text.lower()