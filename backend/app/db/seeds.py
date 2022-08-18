from sqlalchemy import create_engine
from sqlalchemy.sql import text
import random
import string
import os
env_var = os.environ

# SQLAlchemy >= 1.4 deprecated the use of `postgres://` in favor of `postgresql://`
# for the database connection url
database_url = env_var['DATABASE_URL'].replace("postgres://", "postgresql://")

engine = create_engine(database_url, echo=True)

user_insert_statement = text("""INSERT INTO users(username, email, salt, bio, hashed_password) VALUES(:username, :email, :salt, :bio, :hashed_password)""")
select_last_user_id = text("""SELECT * FROM users ORDER BY id DESC LIMIT 1""")
item_statement = text("""INSERT INTO items(slug, title, description, seller_id) VALUES(:slug, :title, :description, :seller_id)""")
select_last_item_id = text("""SELECT * FROM items ORDER BY id DESC LIMIT 1""")
comment_statement = text("""INSERT INTO comments(body, seller_id, item_id) VALUES(:body, :seller_id, :item_id)""")

letters = string.ascii_lowercase

with engine.connect() as con:
    for i in range(100):

        random_username = ''.join(random.choice(letters) for i in range(10))
        user = {'username': random_username, 'email':f'{random_username}@mail.com', 'salt': 'abc', 'bio': 'bio', 'hashed_password':'12345689'}
        con.execute(user_insert_statement, **user)

        result = con.execute(select_last_user_id)
        for row in result:
            generated_user_id = row['id']

        item = {'slug':f'slug-{random_username}', 'title':f'title{i}','description':f'desc{i}', 'seller_id':generated_user_id}
        con.execute(item_statement, **item)

        item_result = con.execute(select_last_item_id)
        for row in item_result:
            generated_item_id = row['id']
        comment = {'body': f'comment{i}', 'seller_id': generated_user_id, 'item_id': generated_item_id}
        con.execute(comment_statement, **comment)
