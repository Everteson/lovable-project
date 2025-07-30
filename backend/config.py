import os
from typing import Optional

class Settings:
    """Configurações do backend."""
    
    # Database
    DATABASE_URL: str = "sqlite:///./database.db"
    
    # Security
    SECRET_KEY: str = os.getenv("SECRET_KEY", "minsk-art-secret-key-change-in-production")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    # File Upload
    MAX_FILE_SIZE: int = 10 * 1024 * 1024  # 10MB
    MAX_BACKGROUND_SIZE: int = 20 * 1024 * 1024  # 20MB
    MAX_PROFILE_SIZE: int = 5 * 1024 * 1024  # 5MB
    ALLOWED_EXTENSIONS: set = {".jpg", ".jpeg", ".png", ".gif", ".webp"}
    
    # Upload Directories
    UPLOAD_DIR: str = "uploads"
    PORTFOLIO_UPLOAD_DIR: str = "uploads/portfolio"
    PROFILE_UPLOAD_DIR: str = "uploads/profiles"
    BACKGROUND_UPLOAD_DIR: str = "uploads/backgrounds"
    
    # CORS
    ALLOWED_ORIGINS: list = [
        "http://localhost:3000",
        "http://localhost:5173",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:5173",
        "http://localhost:8000",
    ]
    
    # API
    API_PREFIX: str = "/api"
    
    # Default Admin
    DEFAULT_ADMIN_EMAIL: str = "admin@minsk.art"
    DEFAULT_ADMIN_PASSWORD: str = "admin123"  # Change in production!
    
    @classmethod
    def get_database_url(cls) -> str:
        """Get database URL."""
        return cls.DATABASE_URL
    
    @classmethod
    def create_upload_dirs(cls) -> None:
        """Create upload directories if they don't exist."""
        dirs = [
            cls.UPLOAD_DIR,
            cls.PORTFOLIO_UPLOAD_DIR,
            cls.PROFILE_UPLOAD_DIR,
            cls.BACKGROUND_UPLOAD_DIR
        ]
        for directory in dirs:
            os.makedirs(directory, exist_ok=True)

# Global settings instance
settings = Settings()
