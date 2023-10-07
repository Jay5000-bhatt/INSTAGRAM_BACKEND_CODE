const mongoose = require("mongoose");

const postSchema = new mongoose.Schema({
  contentUrl: {
    type: String,
    required: true,
  },
  description: String,
  tags: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
});

const Post = mongoose.model("Post", postSchema);

module.exports = Post;
