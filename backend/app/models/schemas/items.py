from typing import List, Optional

from pydantic import BaseModel, Field

from app.models.domain.items import Item
from app.models.schemas.rwschema import RWSchema

DEFAULT_ITEMS_LIMIT = 20
DEFAULT_ITEMS_OFFSET = 0


class ItemForResponse(RWSchema, Item):
    tags: List[str] = Field(..., alias="tagList")


class ItemInResponse(RWSchema):
    item: ItemForResponse


class ItemInCreate(RWSchema):
    title: str
    description: str
    body: Optional[str] = None
    image: Optional[str] = None
    tags: List[str] = Field([], alias="tagList")


class ItemInUpdate(RWSchema):
    title: Optional[str] = None
    description: Optional[str] = None
    body: Optional[str] = None


class ListOfItemsInResponse(RWSchema):
    items: List[ItemForResponse]
    items_count: int


class ItemsFilters(BaseModel):
    tag: Optional[str] = None
    seller: Optional[str] = None
    favorited: Optional[str] = None
    limit: int = Field(DEFAULT_ITEMS_LIMIT, ge=1)
    offset: int = Field(DEFAULT_ITEMS_OFFSET, ge=0)
