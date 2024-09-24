const express = require("express");
const { getRandomQuestions } = require("../controllers/quizController");

const router = express.Router();

router.get("/questions/random", getRandomQuestions);

module.exports = router;
