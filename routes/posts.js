const express = require("express");

const router = express.Router();
const {
  createPost,
  deletePost,
  updatePost,
  userNewsFeed,
} = require("../controllers/postController");

const authtication = require("../middleware/auth");

// create post
router.post("/createPost", authtication, createPost);

// update post
router.put("/updatePost/:postId", authtication, updatePost);

// delete post
router.delete("/:postId", authtication, deletePost);

// User News Feed
router.get("/userNewsFeed", authtication, userNewsFeed);

module.exports = router;
