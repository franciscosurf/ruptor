from typing import Optional, Any

import spacy

from sentence_transformers import SentenceTransformer
from keybert import KeyBERT


_embedding_model: Optional[SentenceTransformer] = None
_kw_model: Optional[KeyBERT] = None

_nlp_es: Any = None
_nlp_en: Any = None

_embedding_cache = {}


def _init_models():

    global _embedding_model
    global _kw_model
    global _nlp_es
    global _nlp_en

    if _embedding_model is None:

        try:
            _embedding_model = SentenceTransformer(
                "paraphrase-multilingual-MiniLM-L12-v2"
            )

        except Exception:

            _embedding_model = SentenceTransformer(
                "all-MiniLM-L6-v2"
            )

        _kw_model = KeyBERT(model=_embedding_model)

    if _nlp_es is None:

        try:
            _nlp_es = spacy.load("es_core_news_md")
        except:
            _nlp_es = None

    if _nlp_en is None:

        try:
            _nlp_en = spacy.load("en_core_web_md")
        except:
            _nlp_en = None


def get_embedding_model():

    _init_models()

    return _embedding_model


def get_kw_model():

    _init_models()

    return _kw_model


def get_nlp(lang: str):

    _init_models()

    return _nlp_es if lang == "es" else _nlp_en