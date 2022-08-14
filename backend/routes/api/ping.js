const router = require("express").Router();
const asyncHandler = require("express-async-handler");
const auth = require("../auth");
const { sendEvent } = require("../../lib/event");

router.get("/",
  auth.optional,
  asyncHandler(async (req, res) => {

    try {
      const result = await sendEvent('ping')
      return res.json(result);
    } catch (e) {
      console.error(e)
      return res.sendStatus(500);
    }
  }));

module.exports = router;
