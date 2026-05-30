from dataclasses import dataclass

#0.70

@dataclass
class Config:
    MIN_TERM_LENGTH: int = 3
    MAX_TERM_LENGTH: int = 50
    SEMANTIC_THRESHOLD: float = 0.55
    KEYWORD_DIVERSITY: float = 0.6
    MAX_TEXT_LENGTH: int = 10000
    TOP_N_KEYWORDS: int = 40
    CACHE_SIZE: int = 100
    BATCH_SIZE: int = 10
    TIMEOUT_SECONDS: int = 30
    FUZZY_THRESHOLD: float = 0.85

config = Config()