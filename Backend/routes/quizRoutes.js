const express = require("express");
const {
  getRandomQuestions,
  resetQuiz,
} = require("../controllers/quizController");

const router = express.Router();

router.get("/questions/random", getRandomQuestions);

router.post("/reset", resetQuiz);

module.exports = router;
