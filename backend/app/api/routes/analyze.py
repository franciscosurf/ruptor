from fastapi import APIRouter, UploadFile, File, Form

from app.services.analysis_service import analyze_cv_logic

router = APIRouter()


@router.post("/analyze-cv/")
async def analyze_cv(
    cv_file: UploadFile = File(...),
    job_description: str = Form(...),
    mode: str = Form("balanced")
):
    return await analyze_cv_logic(
        cv_file,
        job_description,
        mode
    )
