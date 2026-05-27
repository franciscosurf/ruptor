from app.core.patterns import NOISE_PATTERN

def calculate_confidence_score(
    cv_text: str,
    job_text: str
) -> float:

    confidence = 100.0

    if len(cv_text) < 200:
        confidence -= 20

    if len(job_text) < 200:
        confidence -= 20

    noise_cv = len(NOISE_PATTERN.findall(cv_text))
    noise_job = len(NOISE_PATTERN.findall(job_text))

    if noise_cv > 10:
        confidence -= 15

    if noise_job > 10:
        confidence -= 15

    return max(0, min(100, confidence))
