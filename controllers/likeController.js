const Like = require("../models/Likes");
const User = require("../models/Users");
const Post = require("../models/Posts");

const { successResponse, failureResponse } = require("./utils");

//get this id from token after logging in
const MY_ID = "651e52d0c644f9a469fb85ee"; // This is Jay's Id
// const MY_ID = "651e538bc644f9a469fb85f2"; // this is Bharti's id
// const MY_ID = "651e5339c644f9a469fb85f0"; // this is Umesh's id
// const MY_ID = "651843db92a5df99aca59bb5"; // this is Havi's id

const createLike = async (req, res) => {
  try {
    let userId = MY_ID; //req.user._id from token
    let postId = req.params.postId;
    let existingLike = await Like.findOne({ userId, postId });
    let user = await User.findById(userId);
    let post = await Post.findById(postId);
    // if user exists and post exists
    if (user) {
      if (post) {
        // if like already exists
        if (existingLike) {
          failureResponse(res, "Like already exists");
        } else {
          await Like.create({ userId, postId });
          successResponse(res, "You have liked the post.");
        }
      } else {
        failureResponse(res, "Post not found");
      }
    } else {
      failureResponse(res, "User not found");
    }
  } catch (error) {
    failureResponse(res, error);
  }
};

const removeLike = async (req, res) => {
  try {
    let userId = MY_ID; //req.user._id from token
    let postId = req.params.postId;
    await Like.findOneAndDelete({ userId, postId });
    successResponse(res, "You have unliked the post.");
  } catch (error) {
    failureResponse(res, error);
  }
};

const getLikes = async (req, res) => {
  try {
    // implement logic that user is allowed to see the likes or not
    // same logic as getProfile
    let postId = req.params.postId;
    let likes = await Like.find({ postId }).populate("userId", "username");
    successResponse(res, likes);
  } catch (error) {
    failureResponse(res, error);
  }
};

module.exports = {
  createLike,
  removeLike,
  getLikes,
};
