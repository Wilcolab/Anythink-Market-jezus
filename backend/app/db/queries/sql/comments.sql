-- name: get-comments-for-item-by-slug
SELECT c.id,
       c.body,
       c.created_at,
       c.updated_at,
       (SELECT username FROM users WHERE id = c.seller_id) as seller_username
FROM comments c
         INNER JOIN items a ON c.item_id = a.id AND (a.slug = :slug);

-- name: get-comment-by-id-and-slug^
SELECT c.id,
       c.body,
       c.created_at,
       c.updated_at,
       (SELECT username FROM users WHERE id = c.seller_id) as seller_username
FROM comments c
         INNER JOIN items a ON c.item_id = a.id AND (a.slug = :item_slug)
WHERE c.id = :comment_id;

-- name: create-new-comment<!
WITH users_subquery AS (
        (SELECT id, username FROM users WHERE username = :seller_username)
)
INSERT
INTO comments (body, seller_id, item_id)
VALUES (:body,
        (SELECT id FROM users_subquery),
        (SELECT id FROM items WHERE slug = :item_slug))
RETURNING
    id,
    body,
        (SELECT username FROM users_subquery) AS seller_username,
    created_at,
    updated_at;

-- name: delete-comment-by-id!
DELETE
FROM comments
WHERE id = :comment_id
  AND seller_id = (SELECT id FROM users WHERE username = :seller_username);
