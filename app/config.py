from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import Field

class Settings(BaseSettings):
    APP_NAME: str = Field(default="AgencyOS")
    VERSION: str = Field(default="1.0.0")
    DEBUG: bool = Field(default=True)
    
    # Database Configuration
    DATABASE_URL: str = Field(default="sqlite+aiosqlite:///./agencyos.db")
    
    # Model Configuration
    MODEL_DIR: str = Field(default="./models/")
    DEFAULT_MODEL: str = Field(default="tinyllama")
    MAX_TOKENS: int = Field(default=512)
    MAX_CONTEXT: int = Field(default=2048)
    
    # Logging Configuration
    LOG_LEVEL: str = Field(default="INFO")
    
    # Business Logic Thresholds
    RISK_THRESHOLD: int = Field(default=70)
    BUDGET_OVERRUN_THRESHOLD: float = Field(default=0.20)
    APPROVAL_SCORE_THRESHOLD: int = Field(default=75)
    CONFIDENCE_THRESHOLD: float = Field(default=0.5)

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

settings = Settings()
