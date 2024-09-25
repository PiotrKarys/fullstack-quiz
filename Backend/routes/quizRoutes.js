const express = require("express");
const {
  getRandomQuestions,
  resetQuiz,
  getQuestionTypes,
  getQuestionsByType,
  getAllQuestions,
} = require("../controllers/quizController");

const router = express.Router();

router.get("/questions/random", getRandomQuestions);
router.get("/questions/types", getQuestionTypes);
router.get("/questions/types/:type", getQuestionsByType);
router.get("/questions/all", getAllQuestions);
router.post("/reset", resetQuiz);

module.exports = router;
