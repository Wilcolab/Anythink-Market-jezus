from typing import List, Optional, Sequence, Union

from asyncpg import Connection, Record
from pypika import Query

from app.db.errors import EntityDoesNotExist
from app.db.queries.queries import queries
from app.db.queries.tables import (
    Parameter,
    items,
    items_to_tags,
    favorites,
    tags as tags_table,
    users,
)
from app.db.repositories.base import BaseRepository
from app.db.repositories.profiles import ProfilesRepository
from app.db.repositories.tags import TagsRepository
from app.models.domain.items import Item
from app.models.domain.users import User

SELLER_USERNAME_ALIAS = "seller_username"
SLUG_ALIAS = "slug"

CAMEL_OR_SNAKE_CASE_TO_WORDS = r"^[a-z\d_\-]+|[A-Z\d_\-][^A-Z\d_\-]*"


class ItemsRepository(BaseRepository):  # noqa: WPS214
    def __init__(self, conn: Connection) -> None:
        super().__init__(conn)
        self._profiles_repo = ProfilesRepository(conn)
        self._tags_repo = TagsRepository(conn)

    async def create_item(  # noqa: WPS211
        self,
        *,
        slug: str,
        title: str,
        description: str,
        seller: User,
        body: Optional[str] = None,
        image: Optional[str] = None,
        tags: Optional[Sequence[str]] = None,
    ) -> Item:
        async with self.connection.transaction():
            item_row = await queries.create_new_item(
                self.connection,
                slug=slug,
                title=title,
                description=description,
                body=body,
                seller_username=seller.username,
                image=image
            )

            if tags:
                await self._tags_repo.create_tags_that_dont_exist(tags=tags)
                await self._link_item_with_tags(slug=slug, tags=tags)

        return await self._get_item_from_db_record(
            item_row=item_row,
            slug=slug,
            seller_username=item_row[SELLER_USERNAME_ALIAS],
            requested_user=seller,
        )

    async def update_item(  # noqa: WPS211
        self,
        *,
        item: Item,
        slug: Optional[str] = None,
        title: Optional[str] = None,
        body: Optional[str] = None,
        description: Optional[str] = None,
    ) -> Item:
        updated_item = item.copy(deep=True)
        updated_item.slug = slug or updated_item.slug
        updated_item.title = title or item.title
        updated_item.body = body or item.body
        updated_item.description = description or item.description

        async with self.connection.transaction():
            updated_item.updated_at = await queries.update_item(
                self.connection,
                slug=item.slug,
                seller_username=item.seller.username,
                new_slug=updated_item.slug,
                new_title=updated_item.title,
                new_body=updated_item.body,
                new_description=updated_item.description,
            )

        return updated_item

    async def delete_item(self, *, item: Item) -> None:
        async with self.connection.transaction():
            await queries.delete_item(
                self.connection,
                slug=item.slug,
                seller_username=item.seller.username,
            )

    async def filter_items(  # noqa: WPS211
        self,
        *,
        tag: Optional[str] = None,
        seller: Optional[str] = None,
        favorited: Optional[str] = None,
        limit: int = 20,
        offset: int = 0,
        requested_user: Optional[User] = None,
    ) -> List[Item]:
        query_params: List[Union[str, int]] = []
        query_params_count = 0

        # fmt: off
        query = Query.from_(
            items,
        ).select(
            items.id,
            items.slug,
            items.title,
            items.description,
            items.body,
            items.image,
            items.created_at,
            items.updated_at,
            Query.from_(
                users,
            ).where(
                users.id == items.seller_id,
            ).select(
                users.username,
            ).as_(
                SELLER_USERNAME_ALIAS,
            ),
        )
        # fmt: on

        if tag:
            query_params.append(tag)
            query_params_count += 1

            # fmt: off
            query = query.join(
                items_to_tags,
            ).on(
                (items.id == items_to_tags.item_id) & (
                    items_to_tags.tag == Query.from_(
                        tags_table,
                    ).where(
                        tags_table.tag == Parameter(query_params_count),
                    ).select(
                        tags_table.tag,
                    )
                ),
            )
            # fmt: on

        if seller:
            query_params.append(seller)
            query_params_count += 1

            # fmt: off
            query = query.join(
                users,
            ).on(
                (items.seller_id == users.id) & (
                    users.id == Query.from_(
                        users,
                    ).where(
                        users.username == Parameter(query_params_count),
                    ).select(
                        users.id,
                    )
                ),
            )
            # fmt: on

        if favorited:
            query_params.append(favorited)
            query_params_count += 1

            # fmt: off
            query = query.join(
                favorites,
            ).on(
                (items.id == favorites.item_id) & (
                    favorites.user_id == Query.from_(
                        users,
                    ).where(
                        users.username == Parameter(query_params_count),
                    ).select(
                        users.id,
                    )
                ),
            )
            # fmt: on

        query = query.limit(Parameter(query_params_count + 1)).offset(
            Parameter(query_params_count + 2),
        )
        query_params.extend([limit, offset])

        items_rows = await self.connection.fetch(query.get_sql(), *query_params)

        return [
            await self.get_item_by_slug(slug=item_row['slug'], requested_user=requested_user)
            for item_row in items_rows
        ]

    async def get_items_for_user_feed(
        self,
        *,
        user: User,
        limit: int = 20,
        offset: int = 0,
    ) -> List[Item]:
        items_rows = await queries.get_items_for_feed(
            self.connection,
            follower_username=user.username,
            limit=limit,
            offset=offset,
        )
        return [
            await self._get_item_from_db_record(
                item_row=item_row,
                slug=item_row[SLUG_ALIAS],
                seller_username=item_row[SELLER_USERNAME_ALIAS],
                requested_user=user,
            )
            for item_row in items_rows
        ]

    async def get_item_by_slug(
        self,
        *,
        slug: str,
        requested_user: Optional[User] = None,
    ) -> Item:
        item_row = await queries.get_item_by_slug(self.connection, slug=slug)
        if item_row:
            return await self._get_item_from_db_record(
                item_row=item_row,
                slug=item_row[SLUG_ALIAS],
                seller_username=item_row[SELLER_USERNAME_ALIAS],
                requested_user=requested_user,
            )

        raise EntityDoesNotExist("item with slug {0} does not exist".format(slug))

    async def get_tags_for_item_by_slug(self, *, slug: str) -> List[str]:
        tag_rows = await queries.get_tags_for_item_by_slug(
            self.connection,
            slug=slug,
        )
        return [row["tag"] for row in tag_rows]

    async def get_favorites_count_for_item_by_slug(self, *, slug: str) -> int:
        return (
            await queries.get_favorites_count_for_item(self.connection, slug=slug)
        )["favorites_count"]

    async def is_item_favorited_by_user(self, *, slug: str, user: User) -> bool:
        return (
            await queries.is_item_in_favorites(
                self.connection,
                username=user.username,
                slug=slug,
            )
        )["favorited"]

    async def add_item_into_favorites(self, *, item: Item, user: User) -> None:
        await queries.add_item_to_favorites(
            self.connection,
            username=user.username,
            slug=item.slug,
        )

    async def remove_item_from_favorites(
        self,
        *,
        item: Item,
        user: User,
    ) -> None:
        await queries.remove_item_from_favorites(
            self.connection,
            username=user.username,
            slug=item.slug,
        )

    async def _get_item_from_db_record(
        self,
        *,
        item_row: Record,
        slug: str,
        seller_username: str,
        requested_user: Optional[User],
    ) -> Item:
        title_query = Query.from_(items).select(items.title).where(items.slug == slug)
        result_rows = await self.connection.fetch(title_query.get_sql())
        if not len(result_rows):
            raise Exception(f'No item with slug {slug}')
        title = result_rows[0]['title']

        return Item(
            id_=item_row["id"],
            slug=slug,
            title=title,
            description=item_row["description"],
            body=item_row["body"],
            image=item_row["image"],
            seller=await self._profiles_repo.get_profile_by_username(
                username=seller_username,
                requested_user=requested_user,
            ),
            tags=await self.get_tags_for_item_by_slug(slug=slug),
            favorites_count=await self.get_favorites_count_for_item_by_slug(
                slug=slug,
            ),
            favorited=await self.is_item_favorited_by_user(
                slug=slug,
                user=requested_user,
            )
            if requested_user
            else False,
            created_at=item_row["created_at"],
            updated_at=item_row["updated_at"],
        )

    async def _link_item_with_tags(self, *, slug: str, tags: Sequence[str]) -> None:
        await queries.add_tags_to_item(
            self.connection,
            [{SLUG_ALIAS: slug, "tag": tag} for tag in tags],
        )
