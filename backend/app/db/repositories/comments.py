from typing import List, Optional

from asyncpg import Connection, Record

from app.db.errors import EntityDoesNotExist
from app.db.queries.queries import queries
from app.db.repositories.base import BaseRepository
from app.db.repositories.profiles import ProfilesRepository
from app.models.domain.items import Item
from app.models.domain.comments import Comment
from app.models.domain.users import User


class CommentsRepository(BaseRepository):
    def __init__(self, conn: Connection) -> None:
        super().__init__(conn)
        self._profiles_repo = ProfilesRepository(conn)

    async def get_comment_by_id(
        self,
        *,
        comment_id: int,
        item: Item,
        user: Optional[User] = None,
    ) -> Comment:
        comment_row = await queries.get_comment_by_id_and_slug(
            self.connection,
            comment_id=comment_id,
            item_slug=item.slug,
        )
        if comment_row:
            return await self._get_comment_from_db_record(
                comment_row=comment_row,
                seller_username=comment_row["seller_username"],
                requested_user=user,
            )

        raise EntityDoesNotExist(
            "comment with id {0} does not exist".format(comment_id),
        )

    async def get_comments_for_item(
        self,
        *,
        item: Item,
        user: Optional[User] = None,
    ) -> List[Comment]:
        comments_rows = await queries.get_comments_for_item_by_slug(
            self.connection,
            slug=item.slug,
        )
        return [
            await self._get_comment_from_db_record(
                comment_row=comment_row,
                seller_username=comment_row["seller_username"],
                requested_user=user,
            )
            for comment_row in comments_rows
        ]

    async def create_comment_for_item(
        self,
        *,
        body: str,
        item: Item,
        user: User,
    ) -> Comment:
        comment_row = await queries.create_new_comment(
            self.connection,
            body=body,
            item_slug=item.slug,
            seller_username=user.username,
        )
        return await self._get_comment_from_db_record(
            comment_row=comment_row,
            seller_username=comment_row["seller_username"],
            requested_user=user,
        )

    async def delete_comment(self, *, comment: Comment) -> None:
        await queries.delete_comment_by_id(
            self.connection,
            comment_id=comment.id_,
            seller_username=comment.seller.username,
        )

    async def _get_comment_from_db_record(
        self,
        *,
        comment_row: Record,
        seller_username: str,
        requested_user: Optional[User],
    ) -> Comment:
        return Comment(
            id_=comment_row["id"],
            body=comment_row["body"],
            seller=await self._profiles_repo.get_profile_by_username(
                username=seller_username,
                requested_user=requested_user,
            ),
            created_at=comment_row["created_at"],
            updated_at=comment_row["updated_at"],
        )
