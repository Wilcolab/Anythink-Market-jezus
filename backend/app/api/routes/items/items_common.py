from fastapi import APIRouter, Depends, HTTPException, Query
from starlette import status

from app.api.dependencies.items import get_item_by_slug_from_path
from app.api.dependencies.authentication import get_current_user_authorizer
from app.api.dependencies.database import get_repository
from app.db.repositories.items import ItemsRepository
from app.models.domain.items import Item
from app.models.domain.users import User
from app.models.schemas.items import (
    DEFAULT_ITEMS_LIMIT,
    DEFAULT_ITEMS_OFFSET,
    ItemForResponse,
    ItemInResponse,
    ListOfItemsInResponse,
)
from app.resources import strings

router = APIRouter()


@router.get(
    "/feed",
    response_model=ListOfItemsInResponse,
    name="items:get-user-feed-items",
)
async def get_items_for_user_feed(
    limit: int = Query(DEFAULT_ITEMS_LIMIT, ge=1),
    offset: int = Query(DEFAULT_ITEMS_OFFSET, ge=0),
    user: User = Depends(get_current_user_authorizer()),
    items_repo: ItemsRepository = Depends(get_repository(ItemsRepository)),
) -> ListOfItemsInResponse:
    items = await items_repo.get_items_for_user_feed(
        user=user,
        limit=limit,
        offset=offset,
    )
    items_for_response = [
        ItemForResponse(**item.dict()) for item in items
    ]
    return ListOfItemsInResponse(
        items=items_for_response,
        items_count=len(items),
    )


@router.post(
    "/{slug}/favorite",
    response_model=ItemInResponse,
    name="items:mark-item-favorite",
)
async def mark_item_as_favorite(
    item: Item = Depends(get_item_by_slug_from_path),
    user: User = Depends(get_current_user_authorizer()),
    items_repo: ItemsRepository = Depends(get_repository(ItemsRepository)),
) -> ItemInResponse:
    if not item.favorited:
        await items_repo.add_item_into_favorites(item=item, user=user)

        return ItemInResponse(
            item=ItemForResponse.from_orm(
                item.copy(
                    update={
                        "favorited": True,
                        "favorites_count": item.favorites_count + 1,
                    },
                ),
            ),
        )

    raise HTTPException(
        status_code=status.HTTP_400_BAD_REQUEST,
        detail=strings.ITEM_IS_ALREADY_FAVORITED,
    )


@router.delete(
    "/{slug}/favorite",
    response_model=ItemInResponse,
    name="items:unmark-item-favorite",
)
async def remove_item_from_favorites(
    item: Item = Depends(get_item_by_slug_from_path),
    user: User = Depends(get_current_user_authorizer()),
    items_repo: ItemsRepository = Depends(get_repository(ItemsRepository)),
) -> ItemInResponse:
    if item.favorited:
        await items_repo.remove_item_from_favorites(item=item, user=user)

        return ItemInResponse(
            item=ItemForResponse.from_orm(
                item.copy(
                    update={
                        "favorited": False,
                        "favorites_count": item.favorites_count - 1,
                    },
                ),
            ),
        )

    raise HTTPException(
        status_code=status.HTTP_400_BAD_REQUEST,
        detail=strings.ITEM_IS_NOT_FAVORITED,
    )
