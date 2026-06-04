from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from fastapi.responses import Response
from pydantic import BaseModel
from typing import Dict, Any

from app.services.analysis_service import analyze_cv_logic
from app.services.report_pdf.pdf_generator import generar_informe_pdf

router = APIRouter()

# Modelo para recibir los datos del análisis ya calculado
class AnalisisData(BaseModel):
    data: Dict[str, Any]


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


@router.post("/api/download-pdf")
async def download_analysis_pdf(analisis: AnalisisData):
    """
    Genera un PDF con el informe del análisis ATS a partir de los resultados ya obtenidos.
    """
    try:
        pdf_bytes = generar_informe_pdf(analisis.data)
        return Response(
            content=pdf_bytes,
            media_type="application/pdf",
            headers={"Content-Disposition": "attachment; filename=informe_ats.pdf"}
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generando PDF: {str(e)}")