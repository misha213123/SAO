import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

FRONTEND_URL = os.getenv("FRONTEND_URL", "https://sao-web-rho.vercel.app")

app = FastAPI(
    title="Anime Wardrobe API",
    version="0.1.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[FRONTEND_URL, "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def root() -> dict[str, str]:
    return {
        "service": "anime-wardrobe-api",
        "status": "ok",
        "docs": "/docs",
        "health": "/health",
    }


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "healthy"}


@app.get("/api/v1/shop/products")
def products() -> dict[str, object]:
    return {
        "currency": "crowns",
        "items": [
            {"id": 1, "name": "Ночной охотник", "price": 1280, "category": "clothes"},
            {"id": 2, "name": "Ледяной странник", "price": 1100, "category": "clothes"},
            {"id": 3, "name": "Лунный клинок", "price": 1450, "category": "weapon"},
        ],
    }
