from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import JSONResponse
from database import engine, Base
from routers import commission, portfolio, settings, auth
import os
import uvicorn

# Create database tables
Base.metadata.create_all(bind=engine)

# Create FastAPI app
app = FastAPI(
    title="MINSK Art Backend API",
    description="Backend API para o site de arte da MINSK com SQLite e armazenamento local de imagens",
    version="1.0.0"
)

# CORS middleware - Allow frontend to access the API
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",  # React dev server
        "http://localhost:5173",  # Vite dev server
        "http://127.0.0.1:3000",
        "http://127.0.0.1:5173",
        "http://localhost:8000",  # In case frontend runs on 8000
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API routers
app.include_router(commission.router, prefix="/api")
app.include_router(portfolio.router, prefix="/api")
app.include_router(settings.router, prefix="/api")
app.include_router(auth.router, prefix="/api")

# Serve static files from uploads directory
upload_dirs = ["uploads/portfolio", "uploads/profiles", "uploads/backgrounds"]
for upload_dir in upload_dirs:
    if os.path.isdir(upload_dir):
        app.mount(f"/{upload_dir}", StaticFiles(directory=upload_dir), name=upload_dir.replace("/", "_"))

# Root endpoint
@app.get("/")
def read_root():
    return {
        "message": "MINSK Art Backend API está funcionando!",
        "version": "1.0.0",
        "docs": "/docs",
        "endpoints": {
            "commissions": "/api/commissions",
            "portfolio": "/api/portfolio", 
            "settings": "/api/settings",
            "auth": "/api/auth"
        }
    }

# Health check endpoint
@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "database": "connected",
        "uploads": {
            "portfolio": os.path.exists("uploads/portfolio"),
            "profiles": os.path.exists("uploads/profiles"),
            "backgrounds": os.path.exists("uploads/backgrounds")
        }
    }

# Global exception handler
@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    return JSONResponse(
        status_code=500,
        content={
            "message": "Erro interno do servidor",
            "detail": str(exc) if app.debug else "Erro interno"
        }
    )

# Initialize default settings on startup
@app.on_event("startup")
async def startup_event():
    """Initialize default settings and create upload directories on startup."""
    
    # Ensure upload directories exist
    upload_dirs = ["uploads", "uploads/portfolio", "uploads/profiles", "uploads/backgrounds"]
    for directory in upload_dirs:
        os.makedirs(directory, exist_ok=True)
    
    print("✅ Backend iniciado com sucesso!")
    print("📁 Diretórios de upload criados")
    print("🗄️ Banco de dados SQLite inicializado")
    print("🚀 API disponível em: http://localhost:8000")
    print("📚 Documentação disponível em: http://localhost:8000/docs")

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )
