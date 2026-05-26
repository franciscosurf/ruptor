from fastapi import APIRouter
from datetime import datetime

from app.skills.loader import get_all_sectors
from app.core.models import (
    _embedding_model,
    _nlp_es,
    _nlp_en,
    _embedding_cache,
)

router = APIRouter()


@router.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "version": "4.0",
        "models": {
            "sentence_transformer": "loaded" if _embedding_model else "no",
            "spacy_es": "loaded" if _nlp_es else "no",
            "spacy_en": "loaded" if _nlp_en else "no",
        },
        "available_sectors": get_all_sectors(),
        "cache_size": len(_embedding_cache),
        "timestamp": datetime.now().isoformat(),
    }