from fastapi import APIRouter
from app.api.v1.shop import router as shop_router

api_router = APIRouter()
api_router.include_router(shop_router, prefix="/shop", tags=["shop"])
