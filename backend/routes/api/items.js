var router = require("express").Router();
var mongoose = require("mongoose");
var Item = mongoose.model("Item");
var Comment = mongoose.model("Comment");
var User = mongoose.model("User");
var auth = require("../auth");
const { sendEvent } = require("../../lib/event");

// Preload item objects on routes with ':item'
router.param("item", function(req, res, next, slug) {
  Item.findOne({ slug: slug })
    .populate("seller")
    .then(function(item) {
      if (!item) {
        return res.sendStatus(404);
      }

      req.item = item;

      return next();
    })
    .catch(next);
});

router.param("comment", function(req, res, next, id) {
  Comment.findById(id)
    .then(function(comment) {
      if (!comment) {
        return res.sendStatus(404);
      }

      req.comment = comment;

      return next();
    })
    .catch(next);
});

router.get("/", auth.optional, function(req, res, next) {
  var query = {};
  var limit = 100;
  var offset = 0;

  if (typeof req.query.limit !== "undefined") {
    limit = req.query.limit;
  }

  if (typeof req.query.offset !== "undefined") {
    offset = req.query.offset;
  }

  if (typeof req.query.tag !== "undefined") {
    query.tagList = { $in: [req.query.tag] };
  }

  Promise.all([
    req.query.seller ? User.findOne({ username: req.query.seller }) : null,
    req.query.favorited ? User.findOne({ username: req.query.favorited }) : null
  ])
    .then(function(results) {
      var seller = results[0];
      var favoriter = results[1];

      if (seller) {
        query.seller = seller._id;
      }

      if (favoriter) {
        query._id = { $in: favoriter.favorites };
      } else if (req.query.favorited) {
        query._id = { $in: [] };
      }

      return Promise.all([
        Item.find(query)
          .limit(Number(limit))
          .skip(Number(offset))
          .sort({ createdAt: "desc" })
          .exec(),
        Item.count(query).exec(),
        req.payload ? User.findById(req.payload.id) : null
      ]).then(async function(results) {
        var items = results[0];
        var itemsCount = results[1];
        var user = results[2];
        return res.json({
          items: await Promise.all(
            items.map(async function(item) {
              item.seller = await User.findById(item.seller);
              return item.toJSONFor(user);
            })
          ),
          itemsCount: itemsCount
        });
      });
    })
    .catch(next);
});

router.get("/feed", auth.required, function(req, res, next) {
  var limit = 20;
  var offset = 0;

  if (typeof req.query.limit !== "undefined") {
    limit = req.query.limit;
  }

  if (typeof req.query.offset !== "undefined") {
    offset = req.query.offset;
  }

  User.findById(req.payload.id).then(function(user) {
    if (!user) {
      return res.sendStatus(401);
    }

    Promise.all([
      Item.find({ seller: { $in: user.following } })
        .limit(Number(limit))
        .skip(Number(offset))
        .populate("seller")
        .exec(),
      Item.count({ seller: { $in: user.following } })
    ])
      .then(function(results) {
        var items = results[0];
        var itemsCount = results[1];

        return res.json({
          items: items.map(function(item) {
            return item.toJSONFor(user);
          }),
          itemsCount: itemsCount
        });
      })
      .catch(next);
  });
});

router.post("/", auth.required, function(req, res, next) {
  User.findById(req.payload.id)
    .then(function(user) {
      if (!user) {
        return res.sendStatus(401);
      }

      var item = new Item(req.body.item);

      item.seller = user;

      return item.save().then(function() {
        sendEvent('item_created', { item: req.body.item })
        return res.json({ item: item.toJSONFor(user) });
      });
    })
    .catch(next);
});

// return a item
router.get("/:item", auth.optional, function(req, res, next) {
  Promise.all([
    req.payload ? User.findById(req.payload.id) : null,
    req.item.populate("seller").execPopulate()
  ])
    .then(function(results) {
      var user = results[0];

      return res.json({ item: req.item.toJSONFor(user) });
    })
    .catch(next);
});

// update item
router.put("/:item", auth.required, function(req, res, next) {
  User.findById(req.payload.id).then(function(user) {
    if (req.item.seller._id.toString() === req.payload.id.toString()) {
      if (typeof req.body.item.title !== "undefined") {
        req.item.title = req.body.item.title;
      }

      if (typeof req.body.item.description !== "undefined") {
        req.item.description = req.body.item.description;
      }

      if (typeof req.body.item.image !== "undefined") {
        req.item.image = req.body.item.image;
      }

      if (typeof req.body.item.tagList !== "undefined") {
        req.item.tagList = req.body.item.tagList;
      }

      req.item
        .save()
        .then(function(item) {
          return res.json({ item: item.toJSONFor(user) });
        })
        .catch(next);
    } else {
      return res.sendStatus(403);
    }
  });
});

// delete item
router.delete("/:item", auth.required, function(req, res, next) {
  User.findById(req.payload.id)
    .then(function(user) {
      if (!user) {
        return res.sendStatus(401);
      }

      if (req.item.seller._id.toString() === req.payload.id.toString()) {
        return req.item.remove().then(function() {
          return res.sendStatus(204);
        });
      } else {
        return res.sendStatus(403);
      }
    })
    .catch(next);
});

// Favorite an item
router.post("/:item/favorite", auth.required, function(req, res, next) {
  var itemId = req.item._id;

  User.findById(req.payload.id)
    .then(function(user) {
      if (!user) {
        return res.sendStatus(401);
      }

      return user.favorite(itemId).then(function() {
        return req.item.updateFavoriteCount().then(function(item) {
          return res.json({ item: item.toJSONFor(user) });
        });
      });
    })
    .catch(next);
});

// Unfavorite an item
router.delete("/:item/favorite", auth.required, function(req, res, next) {
  var itemId = req.item._id;

  User.findById(req.payload.id)
    .then(function(user) {
      if (!user) {
        return res.sendStatus(401);
      }

      return user.unfavorite(itemId).then(function() {
        return req.item.updateFavoriteCount().then(function(item) {
          return res.json({ item: item.toJSONFor(user) });
        });
      });
    })
    .catch(next);
});

// return an item's comments
router.get("/:item/comments", auth.optional, function(req, res, next) {
  Promise.resolve(req.payload ? User.findById(req.payload.id) : null)
    .then(function(user) {
      return req.item
        .populate({
          path: "comments",
          populate: {
            path: "seller"
          },
          options: {
            sort: {
              createdAt: "desc"
            }
          }
        })
        .execPopulate()
        .then(function(item) {
          return res.json({
            comments: req.item.comments.map(function(comment) {
              return comment.toJSONFor(user);
            })
          });
        });
    })
    .catch(next);
});

// create a new comment
router.post("/:item/comments", auth.required, function(req, res, next) {
  User.findById(req.payload.id)
    .then(function(user) {
      if (!user) {
        return res.sendStatus(401);
      }

      var comment = new Comment(req.body.comment);
      comment.item = req.item;
      comment.seller = user;

      return comment.save().then(function() {
        req.item.comments = req.item.comments.concat([comment]);

        return req.item.save().then(function(item) {
          res.json({ comment: comment.toJSONFor(user) });
        });
      });
    })
    .catch(next);
});

router.delete("/:item/comments/:comment", auth.required, function(
  req,
  res,
  next
) {
  if (req.comment.seller.toString() === req.payload.id.toString()) {
    req.item.comments.remove(req.comment._id);
    req.item
      .save()
      .then(
        Comment.find({ _id: req.comment._id })
          .remove()
          .exec()
      )
      .then(function() {
        res.sendStatus(204);
      });
  } else {
    res.sendStatus(403);
  }
});

module.exports = router;
