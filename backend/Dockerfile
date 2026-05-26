FROM python:3.11-slim

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .

# Instala PyTorch CPU-only ANTES que requirements.txt
# Sin esto, sentence-transformers arrastra PyTorch+CUDA (~6GB)
RUN pip install --no-cache-dir \
    torch==2.2.0 --index-url https://download.pytorch.org/whl/cpu

RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

RUN pip install --no-cache-dir \
    https://github.com/explosion/spacy-models/releases/download/es_core_news_md-3.7.0/es_core_news_md-3.7.0-py3-none-any.whl \
    https://github.com/explosion/spacy-models/releases/download/en_core_web_md-3.7.0/en_core_web_md-3.7.0-py3-none-any.whl

RUN pip install --no-cache-dir \
    langdetect==1.0.9 \
    pdfplumber==0.11.0 \
    python-docx==1.1.2 \
    "python-multipart>=0.0.7" \
    && pip install --no-cache-dir --no-deps keybert==0.8.5 rich

COPY . .

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]