from fastapi import APIRouter

from app.api.routes.items import items_common, items_resource

router = APIRouter()

router.include_router(items_common.router, prefix="/items")
router.include_router(items_resource.router, prefix="/items")
