from fastapi import APIRouter, UploadFile, File, Form

from app.services.analysis_service import analyze_cv_logic
from app.cv_optimizer import generate_cv_optimizations

router = APIRouter()


@router.post("/optimize-cv/")
async def optimize_cv(
    cv_file: UploadFile = File(...),
    job_description: str = Form(...)
):
    result = await analyze_cv_logic(cv_file, job_description)

    missing_terms = result.get("missing_terms", [])

    if not missing_terms:
        return {
            "success": True,
            "has_optimizations": False,
            "message": "Tu CV ya está bien optimizado"
        }

    optimizations = generate_cv_optimizations(
        missing_terms=missing_terms,
        job_text=job_description,
        profession=result.get("job_sector", {}).get("sector", "general")
    )

    return {
        "success": True,
        "has_optimizations": True,
        "score": result.get("ats_score", 0),
        "optimizations": optimizations,
        "missing_terms_count": len(missing_terms)
    }