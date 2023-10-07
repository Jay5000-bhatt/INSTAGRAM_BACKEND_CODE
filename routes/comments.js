const express = require("express");
const router = express.Router();

const {
  createComment,
  deleteComment,
  likeComment,
  replyComment,
  getPostComments,
} = require("../controllers/commentController");

const authtication = require("../middleware/auth");

// create comment
router.post("/:postId", authtication, createComment);

// delete comment
router.delete("/:commentId", authtication, deleteComment);

// like comment
router.post("/like/:commentId", authtication, likeComment);

// reply comment
router.post("/reply/:commentId", authtication, replyComment);

// get all comments for a post
router.get("/:postId", authtication, getPostComments);

module.exports = router;
