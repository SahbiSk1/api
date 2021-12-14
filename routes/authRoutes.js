const express = require("express");
const { login, signup } = require("../controllers/authController");

const router = express.Router();

router.route("/register").post(signup);
router.route("/login").post(login);

module.exports = router;
