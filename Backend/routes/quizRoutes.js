const express = require("express");
const {
  getRandomQuestions,
  resetQuiz,
  getQuestionTypes,
  getQuestionsByType,
} = require("../controllers/quizController");
const {
  getAllQuestions,
  getQuestionByType,
} = require("../controllers/questionsController");
const { quizLimiter } = require("../middleware/rateLimit");
const router = express.Router();

router.get("/random", quizLimiter, getRandomQuestions);
router.get("/types", getQuestionTypes);
router.get("/types/:type", getQuestionsByType);
router.get("/questions/", getAllQuestions);
router.get("/questions/type", getQuestionByType);
router.post("/reset", quizLimiter, resetQuiz);

module.exports = router;
