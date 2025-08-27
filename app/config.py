from pydantic_settings import BaseSettings
from typing import Optional

class Settings(BaseSettings):
    database_url: str = "sqlite:///./marketplace.db"
    secret_key: str = "your-secret-key-here-change-in-production"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 30
    stripe_secret_key: str = "sk_test_your_stripe_test_key"
    stripe_publishable_key: str = "pk_test_your_stripe_test_key"
    
    class Config:
        env_file = ".env"

settings = Settings()
