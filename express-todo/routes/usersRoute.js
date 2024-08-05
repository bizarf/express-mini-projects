const express = require("express");
const router = express.Router();
const userController = require("../controllers/usersController");

router.get("/", userController.user_fetch_all_get);

router.post("/signup", userController.user_signup_post);

router.post("/login", userController.user_login_post);

module.exports = router;
