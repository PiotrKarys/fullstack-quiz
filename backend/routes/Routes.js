const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const login = require("../controllers/authentication/loginController");
const logout = require("../controllers/authentication/logoutController");
const refreshToken = require("../controllers/authentication/refreshTokenController");
const register = require("../controllers/authentication/registerController");
const { getRandomQuestions } = require("../controllers/quizController");
const router = express.Router();

router.get("/questions/random", getRandomQuestions);

router.post("/register", register);
router.post("/login", login);
router.post("/logout", authMiddleware, logout);
router.post("/refresh-token", refreshToken);

module.exports = router;
