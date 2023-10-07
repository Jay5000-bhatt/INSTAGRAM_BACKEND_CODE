const { default: mongoose } = require("mongoose");
const User = require("../models/Users");
const Posts = require("../models/Posts");
const Like = require("../models/Likes");
const Comments = require("../models/Comments");
const { successResponse, failureResponse } = require("./utils");
const jwt = require("jsonwebtoken");

const secret = "mySecret";
const bcrypt = require("bcrypt");
const Post = require("../models/Posts");

//get this id from token after logging in
// const MY_ID = "651e52d0c644f9a469fb85ee"; // This is Jay's Id
const MY_ID = "651e538bc644f9a469fb85f2"; // this is Bharti's id
// const MY_ID = "651e5339c644f9a469fb85f0"; // this is Havi's id
// const MY_ID = "651e53c1c644f9a469fb85f4"; // this is Umesh's id

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      failureResponse(res, "Please provide email and password", 400);
    } else {
      const user = await User.findOne({ email });
      if (user) {
        const passwordMatch = await bcrypt.compare(password, user.password);
        if (passwordMatch) {
          // create token
          const token = jwt.sign({ email: user.email }, secret, {
            expiresIn: "1h",
          });
          // res.send({ message: "Login Successful", token });
          successResponse(res, { message: "Login Successful", token });
        }
        // if password does not match
        else {
          // return res.status(400).json({ message: "Password is incorrect" });
          failureResponse(res, "Password is incorrect", 400);
        }
      }
      // if email doesn't exist in Database
      else {
        // return res.status(400).json({ message: "User not found" });
        failureResponse(res, "User not found", 400);
      }
    }
  } catch (error) {
    failureResponse(res, error);
  }
};

const signup = (req, res) => {
  let { email, username, password, userInfo, description, phone } = req.body;
  if (!email || !username || !password || !userInfo) {
    failureResponse(res, "Please provide all required fields");
  } else {
    const hashPassword = bcrypt.hashSync(password, 10);
    User.create({
      email,
      username,
      password: hashPassword,
      userInfo,
      description: description ? description : "",
      phone,
      followers: [],
      following: [],
      pending: [],
    })
      .then((user) => {
        successResponse(res, "User created successfully.");
      })
      .catch((err) => {
        failureResponse(res, err);
      });
  }
};

const getProfile = async (req, res) => {
  // No. of profiles we can get:
  // 1. Our own Profile
  // 2. Public Profiles
  // 3. Following Profiles
  // if we are allowed to see the profile then we will fetch the posts else we will send a message saying that we are not allowed to see the profile
  try {
    let userId = MY_ID; //req.user._id from token
    let otherUserId = req.params.id; // id of the profile we want to see
    let user = await User.findById(userId);
    let otherUser = await User.findById(otherUserId).lean();
    if (user && otherUser) {
      let posts = await Posts.find({ userId: otherUserId });
      if (userId === otherUserId) {
        delete otherUser.email;
        delete otherUser.pending;
        successResponse(res, { user: otherUser, posts });
      }
      // check if profile is public or private
      else if (otherUser.profileType === "Public") {
        delete otherUser.password;
        delete otherUser.email;
        delete otherUser.pending;
        delete otherUser._id;
        successResponse(res, { user: otherUser, posts });
      } else {
        // if private then check if we are following the user
        if (user.following.includes(otherUserId)) {
          delete otherUser.password;
          delete otherUser.email;
          delete otherUser.pending;
          delete otherUser._id;
          successResponse(res, { user: otherUser, posts });
        } else {
          failureResponse(res, "You're not allowed to see this profile");
        }
      }
    } else {
      failureResponse(res, "User not found");
    }
  } catch (error) {
    failureResponse(res, error);
  }
};

const updateProfile = async (req, res) => {
  try {
    const userId = MY_ID; // Assuming you have the authenticated user's ID available in req.user._id
    const { username, password, phone, description } = req.body;

    // Assuming you have a User model and you're using an ORM like Mongoose
    const user = await User.findById(userId);

    if (user) {
      // Check if username is provided, update if yes
      if (username) {
        user.username = username;
      }

      // Check if password is provided, update if yes
      if (password) {
        const hashPassword = bcrypt.hashSync(password, 10);
        user.password = hashPassword;
      }

      // Check if phone is provided, update if yes
      if (phone) {
        user.phone = phone;
      }

      // Check if description is provided, update if yes
      if (description) {
        user.description = description;
      }

      // Save the updated user
      await user.save();

      return res.status(200).json({ message: "Profile updated successfully", updatedUser: user });
    } else {
      return res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

const deleteProfile = async (req, res) => {
  try {
    const userId = MY_ID;
    const user = await User.findById(userId);

    if (user) {
      await Post.deleteMany({ userId: userId }); // Delete all posts associated with the user
      await Like.deleteMany({ userId: userId}); //  Delete all Like associated with the user
      await Comments.deleteMany({ userId: userId}); // Delete all comments associated with the user
      await User.deleteMany({ _id: userId}); // Delete all Data associated with the user

      return res.status(200).json({ message: "Profile deleted successfully" });
    } else {
      return res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

const changeProfileType = async (req, res) => {
  // change from private to public and vice versa

  try {
    const userId = MY_ID;
    const { isPrivate } = req.body;
    const user = await User.findById(userId);
    // if user exists
    if (user) {
      // condition ? execute if condition is true : execute if condition is false
      if (isPrivate == "true") {
        user.profileType = "Private";
      } else {
        user.profileType = "Public";
      }
      await user.save();
      successResponse(res, "Profile type changed successfully");
    } else {
      failureResponse(res, "User not found");
    }
  } catch (error) {
    failureResponse(res, error);
  }
};

const follow = async (req, res) => {
  //  to follow someone: Person A wants to follow Person B;
  // 1.  Check whether Person B has a public or a private profile  ❌
  //1.a) Check whether Person A is already following Person B  ❌
  //2. a) Check if Person B is not Person A. ❌
  // 2. if person B has a public profile.
  // 2.a) then add Person A to Person B's followers list and add Person B to Person A's following list
  // 3. if person B has a private profile then add Person A to Person B's pending list
  // 3.b) if person B accepts Person A's request then repeat step 2.a
  // 4. if person B rejects person A request then remove Person A from Person B's pending list
  try {
    let userId = MY_ID; //Person A
    let otherUserId = req.params.id; // Person B
    let user = await User.findById(userId);
    let otherUser = await User.findById(otherUserId);
    if (user && otherUser) {
      if (userId === otherUserId) {
        // Check if youre accidentally following yourself
        failureResponse(res, "You can't follow yourself");
      } else {
        // ---------------------------------------
        if (user.following.includes(otherUserId)) {
          // Check if youre already following the other person B
          failureResponse(res, "You're already following this person");
        } else if (otherUser.followers.includes(userId)) {
          // Check if the other person B is already following you
          failureResponse(res, "You're already following this person");
          // you can write a function to remove a user from followers list
          // ---------------------------------------
        } else {
          if (otherUser.profileType === "Public") {
            // check if the other person B has a private profile
            // if person B has a public profile.
            // then add Person A to Person B's followers list and add Person B to Person A's following list
            otherUser.followers.push(userId);
            user.following.push(otherUserId);
            await user.save();
            await otherUser.save();
            successResponse(res, "You're now following " + otherUser.username);
          } else {
            // if person B has a private profile then add Person A to Person B's pending list
            otherUser.pending.push(userId);
            await otherUser.save();
            successResponse(
              res,
              "Follow request sent to " + otherUser.username
            );
          }
        }
      }
    } else {
      // either person A doesn't exist or person B doesn't exist
      failureResponse(res, "User not found");
    }
  } catch (error) {
    console.log(error);
    failureResponse(res, error);
  }
};

const unfollow = async (req, res) => {
  // to unfollow someone: Person A wants to unfollow Person B
  // Check whether Person A exists in Person B's followers list
  // Check whether Person B exists in Person A's following list
  // Remove Person A from followers of Person B
  // Remove Person B from following of Person A

  try {
    let userId = MY_ID; // Person A //req.user._id from token
    let otherUserId = req.params.id; // Person B
    let user = await User.findById(userId);
    let otherUser = await User.findById(otherUserId);
    // findById(id) --> param is only ID
    // find({}) --> param is an object where key of the object represents the key of the data(aka document)
    if (user && otherUser) {
      if (
        user.following.includes(otherUserId) &&
        otherUser.followers.includes(userId)
      ) {
        await User.updateOne(
          { _id: userId },
          { $pull: { following: new mongoose.Types.ObjectId(otherUserId) } }
        );
        await User.updateOne(
          { _id: otherUserId },
          { $pull: { followers: new mongoose.Types.ObjectId(userId) } }
        );
        successResponse(
          res,
          "You have unfollowed " + otherUser.username + " successfully"
        );
      } else {
        failureResponse(res, "You're not following " + otherUser.username);
      }
    } else {
      failureResponse(res, "User not found");
    }
  } catch (error) {
    failureResponse(res, error);
  }
};

const changeRequestStatus = async (req, res) => {
  // to change status of follow request
  try {
    let userId = MY_ID; // Person B
    let otherUserId = req.body.id; // Person A
    let status = req.body.isAccepted; // status can be "accept" or "reject"
    let user = await User.findById(userId);
    let otherUser = await User.findById(otherUserId);
    if (user && otherUser) {
      if (user.pending.includes(otherUserId)) {
        //if pending request exists
        if (status) {
          // user wants to accept the follow request

          user.followers.push(otherUserId);
          otherUser.following.push(userId);
          let ele = await User.updateOne(
            { _id: userId },
            { $pull: { pending: new mongoose.Types.ObjectId(otherUserId) } }
          );
          await user.save();
          await otherUser.save();
          successResponse(res, "Follow request accepted");
        } else {
          // user wants to reject the follow request
          await User.updateOne(
            { _id: userId },
            { $pull: { pending: new mongoose.Types.ObjectId(otherUserId) } }
          );
          successResponse(res, "Follow request rejected");
        }
      } else {
        failureResponse(res, "Follow request doesn't exist");
      }
    } else {
      failureResponse(res, "User not found");
    }
  } catch (error) {
    console.log(error);
    failureResponse(res, error);
  }
};

module.exports = {
  login,
  signup,
  getProfile,
  updateProfile,
  deleteProfile,
  changeProfileType,
  follow,
  unfollow,
  changeRequestStatus,
};
