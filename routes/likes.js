const express = require("express");
const router = express.Router();

const {
  createLike,
  removeLike,
  getLikes,
} = require("../controllers/likeController");

const authtication = require("../middleware/auth");

// create like
router.post("/:postId", authtication, createLike);

// remove like
router.delete("/:postId", authtication, removeLike);

// get all likes of a post
router.get("/:postId", getLikes);

module.exports = router;
