from fastapi import HTTPException



def validate_text_length(text: str, min_length: int = 50):
    if not text:
        raise HTTPException(
            status_code=400,
            detail="Texto vacío"
        )

    if len(text.strip()) < min_length:
        raise HTTPException(
            status_code=400,
            detail=f"Texto demasiado corto. Mínimo {min_length} caracteres"
        )



def validate_cv_and_job(cv_text: str, job_text: str):
    validate_text_length(cv_text)
    validate_text_length(job_text)



def validate_file_uploaded(file):
    if not file:
        raise HTTPException(
            status_code=400,
            detail="Archivo no recibido"
        )