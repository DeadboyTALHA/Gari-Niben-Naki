from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    # Database
    database_url: str

    # JWT
    secret_key: str
    algorithm: str = 'HS256'
    access_token_expire_minutes: int = 1440

    # Cloudinary
    cloudinary_cloud_name: str = ''
    cloudinary_api_key: str = ''
    cloudinary_api_secret: str = ''

    # Email
    mail_username: str = ''
    mail_password: str = ''
    mail_from: str = ''
    mail_server: str = 'smtp.gmail.com'
    mail_port: int = 587

    # Stripe
    stripe_secret_key: str = ''
    stripe_webhook_secret: str = ''

    # App
    frontend_url: str = 'http://localhost:3000'
    environment: str = 'development'

    class Config:
        env_file = '.env'
        case_sensitive = False


@lru_cache()
def get_settings() -> Settings:
    return Settings()


settings = get_settings()