from datetime import datetime
from typing import Optional

from pypika import Parameter as CommonParameter, Query, Table


class Parameter(CommonParameter):
    def __init__(self, count: int) -> None:
        super().__init__("${0}".format(count))


class TypedTable(Table):
    __table__ = ""

    def __init__(
        self,
        name: Optional[str] = None,
        schema: Optional[str] = None,
        alias: Optional[str] = None,
        query_cls: Optional[Query] = None,
    ) -> None:
        if name is None:
            if self.__table__:
                name = self.__table__
            else:
                name = self.__class__.__name__

        super().__init__(name, schema, alias, query_cls)


class Users(TypedTable):
    __table__ = "users"

    id: int
    username: str


class Items(TypedTable):
    __table__ = "items"

    id: int
    slug: str
    title: str
    description: str
    body: str
    seller_id: int
    created_at: datetime
    updated_at: datetime


class Tags(TypedTable):
    __table__ = "tags"

    tag: str


class ItemsToTags(TypedTable):
    __table__ = "items_to_tags"

    item_id: int
    tag: str


class Favorites(TypedTable):
    __table__ = "favorites"

    item_id: int
    user_id: int


users = Users()
items = Items()
tags = Tags()
items_to_tags = ItemsToTags()
favorites = Favorites()
