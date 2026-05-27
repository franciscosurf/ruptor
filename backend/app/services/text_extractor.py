import io
import pdfplumber
import docx

from fastapi import UploadFile

async def extract_text(file: UploadFile) -> str:
    content = await file.read()
    filename = file.filename.lower()

    if filename.endswith(".pdf"):
        with pdfplumber.open(io.BytesIO(content)) as pdf:
            return "\n".join(
                page.extract_text() or ""
                for page in pdf.pages
            )

    elif filename.endswith(".docx"):
        doc = docx.Document(io.BytesIO(content))

        return "\n".join(
            p.text for p in doc.paragraphs
        )

    return content.decode("utf-8", errors="ignore")