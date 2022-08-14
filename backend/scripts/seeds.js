require("dotenv").config();
const mongoose = require("mongoose");
require("../models/User");
require("../models/Item");
require("../models/Comment");

const User = mongoose.model("User");
const Item = mongoose.model("Item");
const Comment = mongoose.model("Comment");

const connectedToDatabase = () => {
  const connection = process.env.MONGODB_URI || "mongodb://localhost:27017";
  mongoose.connect(connection);
  mongoose.set("debug", true);
};

async function main() {
  connectedToDatabase();
  for (let i = 0; i < 100; i++) {
    const user = new User();
    user.username = `user${i}`;
    user.email = `user${i}@gmail.com`;
    await user.save();

    const item = new Item({
      slug: `slug${i}`,
      title: `title ${i}`,
      description: `description ${i}`,
      seller: user,
    });
    await item.save();

    const comment = new Comment({
      body: `body ${i}`,
      seller: user,
      item: item,
    });
    await comment.save();
  }
}

main()
  .then(() => {
    console.log("Finished DB seeding");
    process.exit(0);
  })
  .catch((err) => {
    console.log(`Error while running DB seed: ${err.message}`);
    process.exit(1);
  });
