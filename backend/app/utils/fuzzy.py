from rapidfuzz import fuzz


def fuzzy_string_similarity(s1: str, s2: str) -> float:
    if not s1 or not s2:
        return 0.0

    return fuzz.ratio(
        s1.lower(),
        s2.lower()
    ) / 100.0