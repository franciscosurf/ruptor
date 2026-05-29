import io

import pdfplumber
import docx

from fastapi import UploadFile, HTTPException


async def extract_text(file: UploadFile) -> str:
    content = await file.read()

    filename = (file.filename or "").lower()

    try:

        # PDF
        if filename.endswith(".pdf"):

            with pdfplumber.open(io.BytesIO(content)) as pdf:

                text_parts = []

                for page in pdf.pages:
                    page_text = page.extract_text()

                    if page_text:
                        text_parts.append(page_text)

                return "\n".join(text_parts).strip()

        # DOCX
        elif filename.endswith(".docx"):

            doc = docx.Document(io.BytesIO(content))

            return "\n".join(
                p.text for p in doc.paragraphs
            ).strip()

        # TXT
        else:

            #content = await file.read()
            #text = content.decode("utf-8").strip()
            #print("📄 Texto recibido en backend (primeros 500 chars):", text[:500])
            #return text

            try:
                return content.decode("utf-8").strip()

            except UnicodeDecodeError:
                return content.decode("latin-1").strip()

    except Exception as e:

        raise HTTPException(
            status_code=400,
            detail=f"Error leyendo archivo: {str(e)}"
        )