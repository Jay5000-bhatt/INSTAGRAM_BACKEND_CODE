const express = require("express");

const router = express.Router();

const {
  login,
  signup,
  getProfile,
  updateProfile,
  deleteProfile,
  changeProfileType,
  follow,
  unfollow,
  changeRequestStatus,
} = require("../controllers/userController");

const authtication = require("../middleware/auth");

// login
router.post("/login", login);

// signup
router.post("/signup", signup);

// get profile
router.get("/profile/:id", authtication, getProfile);

// update profile
router.put("/profile/updateProfile", authtication, updateProfile);

// delete profile
router.delete("/profile/deleteProfile", authtication, deleteProfile);

// change profile type
// idPrivate = true means I want private profile else public
router.put("/type/", authtication, changeProfileType);

// to follow someone
router.put("/follow/:id", authtication, follow);

// to unfollow someone
router.put("/unfollow/:id", authtication, unfollow);

// to change status of follow request
router.put("/request", authtication, changeRequestStatus);

module.exports = router;
