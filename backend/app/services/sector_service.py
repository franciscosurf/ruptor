from typing import Dict, Any

from app.skills.loader import (
    detect_sector_from_text,
    compare_skills_between_sectors,
    get_relevant_skills_for_sector,
)


def detect_cv_and_job_sectors(cv_text: str, job_text: str):
    cv_sector = detect_sector_from_text(cv_text)
    job_sector = detect_sector_from_text(job_text)

    return cv_sector, job_sector



def build_sector_comparison(
    cv_sector: str,
    job_sector: str,
    lang: str
) -> Dict[str, Any]:
    return compare_skills_between_sectors(
        cv_sector,
        job_sector,
        lang
    )



def get_sector_suggestions(
    sector: str,
    lang: str,
    limit: int = 10
):
    return get_relevant_skills_for_sector(
        sector,
        lang,
        limit=limit
    )