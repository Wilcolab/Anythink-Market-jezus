from typing import Optional

from fastapi import Depends, HTTPException, Path, Query
from starlette import status

from app.api.dependencies.authentication import get_current_user_authorizer
from app.api.dependencies.database import get_repository
from app.db.errors import EntityDoesNotExist
from app.db.repositories.items import ItemsRepository
from app.models.domain.items import Item
from app.models.domain.users import User
from app.models.schemas.items import (
    DEFAULT_ITEMS_LIMIT,
    DEFAULT_ITEMS_OFFSET,
    ItemsFilters,
)
from app.resources import strings
from app.services.items import check_user_can_modify_item


def get_items_filters(
    tag: Optional[str] = None,
    seller: Optional[str] = None,
    favorited: Optional[str] = None,
    limit: int = Query(DEFAULT_ITEMS_LIMIT, ge=1),
    offset: int = Query(DEFAULT_ITEMS_OFFSET, ge=0),
) -> ItemsFilters:
    return ItemsFilters(
        tag=tag,
        seller=seller,
        favorited=favorited,
        limit=limit,
        offset=offset,
    )


async def get_item_by_slug_from_path(
    slug: str = Path(..., min_length=1),
    user: Optional[User] = Depends(get_current_user_authorizer(required=False)),
    items_repo: ItemsRepository = Depends(get_repository(ItemsRepository)),
) -> Item:
    try:
        return await items_repo.get_item_by_slug(slug=slug, requested_user=user)
    except EntityDoesNotExist:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=strings.ITEM_DOES_NOT_EXIST_ERROR,
        )


def check_item_modification_permissions(
    current_item: Item = Depends(get_item_by_slug_from_path),
    user: User = Depends(get_current_user_authorizer()),
) -> None:
    if not check_user_can_modify_item(current_item, user):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=strings.USER_IS_NOT_SELLER_OF_ITEM,
        )
