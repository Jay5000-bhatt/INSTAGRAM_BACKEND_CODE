const Post = require("../models/Posts");
const User = require("../models/Users");
const Comment = require("../models/Comments");
const Like = require("../models/Likes");

const { successResponse, failureResponse } = require("./utils");
const { default: mongoose } = require("mongoose");

// const MY_ID = "651e52d0c644f9a469fb85ee"; // This is Jay's Id
// const MY_ID = "651e538bc644f9a469fb85f2"; // this is Bharti's id
// const MY_ID = "651e5339c644f9a469fb85f0"; // this is Umesh's id
// const MY_ID = "651843db92a5df99aca59bb5"; // this is Havi's id

const createPost = async (req, res) => {
  try {
    let { contentUrl, description, tags } = req.body;
    let userId = MY_ID; // fetch from token through req.user._id;
    await Post.create({
      contentUrl,
      description,
      tags,
      userId,
    });
    successResponse(res, "Post Created Successfully.");
  } catch (error) {
    failureResponse(res, error);
  }
};

const deletePost = async (req, res) => {
  try {
    let userId = MY_ID; // fetch from token through req.user._id;
    let postId = req.params.postId;
    let post = await Post.deleteOne({ _id: postId, userId });
    if (!post.deletedCount) failureResponse(res, "Post not found.");
    else {
      successResponse(res, "Post Deleted Successfully.");
    }
  } catch (error) {
    failureResponse(res, error);
  }
};

const updatePost = async (req, res) => {
  try {
    const postId = req.params.postId; // Assuming you pass the post ID as a parameter in the URL
    const { description, tags } = req.body;
    
    const post = await Post.findById(postId); // Assuming you have a Post model and you're using an ORM like Mongoose

    if (post) {
      if (description) {
        // Check if description is provided, update if yes
        post.description = description;
      }
      if (tags) {
        // Check if tags is provided, update if yes
        post.tags = tags;
      }
      await post.save(); // Save the updated post

      return res
        .status(200)
        .json({ message: "Post updated successfully", updatedPost: post });
    } else {
      return res.status(404).json({ message: "Post not found" });
    }
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

const userNewsFeed = async (req, res) => {
  // 1. Get all user who we follow
  // 2. Calculate Score for each user //initially it will be 0
  // 3. Using comments and likes we evaluate score by adding 1 for each comment and like
  // 4. Sort the users according to score
  // 5. Get all posts of these users(users who we follow)
  // 6. Sort the posts according to score
  try {
    const userId = MY_ID; // fetch from token through req.user._id;
    const user = await User.findById(userId);

    // check if user exists
    if (user) {
      // 1. Get all user who we follow
      const followingUsers = user.following;

      // 2. Calculate Score for each user //initially it will be 0
      const usersScore = {};
      followingUsers.forEach((userId) => {
        usersScore[userId.toString()] = 0;
      });

      // 3. Using comments and likes we evaluate score by adding 1 for each comment and like

      // fetching all likes and comments done by the user (i.e. me)
      const comments = await Comment.find({ userId });
      const likes = await Like.find({ userId });

      let allPromises = [];

      // adding score for comments
      comments.forEach((comment) => {
        const postId = comment.postId.toString();
        allPromises.push(
          Post.findById(postId)
            .then((post) => {
              const userId = post.userId.toString();
              usersScore[userId] += 1;
            })
            .catch((err) => {
              console.log("ERROR IN COMMENTS: ", err);
            })
        );
      });

      // adding score for likes
      likes.forEach((like) => {
        const postId = like.postId.toString();
        allPromises.push(
          Post.findById(postId)
            .then((post) => {
              const userId = post.userId.toString();
              usersScore[userId] += 1;
            })
            .catch((err) => {
              console.log("ERROR IN LIKES: ", err);
            })
        );
      });

      await Promise.all(allPromises);

      // 4. Sort the users according to score
      let userScoreArray = [];
      Object.keys(usersScore).forEach((userId) => {
        userScoreArray.push({
          userId: userId,
          score: usersScore[userId],
        });
      });

      // sorting users according to score in Descending order
      userScoreArray = userScoreArray.sort(
        (entry1, entry2) => entry2.score - entry1.score
      );

      // 5. Get all posts of these users(users who we follow)
      let allFollowingUserPosts = await Post.find({
        userId: { $in: followingUsers },
      });

      // 6. Sort the posts according to score
      allFollowingUserPosts = allFollowingUserPosts.sort((post1, post2) => {
        const user1 = post1.userId.toString();
        const user2 = post2.userId.toString();

        const post1Score = usersScore[user1]; //userScore = { userId1: score1, userId2: score2, ... }
        const post2Score = usersScore[user2];
        return post2Score - post1Score;
      });

      successResponse(res, allFollowingUserPosts);
    } else {
      failureResponse(res, "User not found.");
    }
  } catch (error) {
    failureResponse(res, error);
  }
};

module.exports = {
  createPost,
  deletePost,
  updatePost,
  userNewsFeed,
};
