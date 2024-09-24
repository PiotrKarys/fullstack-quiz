const express = require("express");
const authRoutes = require("./authRoutes");
const quizRoutes = require("./quizRoutes");

const router = express.Router();

router.use("/auth", authRoutes);
router.use("/quiz", quizRoutes);

module.exports = router;
