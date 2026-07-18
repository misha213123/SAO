from fastapi import APIRouter

router = APIRouter()


@router.get("/products")
def list_products() -> list[dict[str, object]]:
    return [
        {"id": "night-runner", "title": "Куртка ночного бегуна", "price": 1280, "currency": "crowns"},
        {"id": "sky-idol", "title": "Комплект небесной идолки", "price": 1650, "currency": "crowns"},
    ]
