const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const authController = require("../controllers/authController");
const quizController = require("../controllers/quizController");
const questionsController = require("../controllers/questionsController");
const { quizLimiter } = require("../middleware/rateLimit");

const router = express.Router();

// Publiczne trasy (dostępne bez logowania)
router.post("/auth/register", authController.register);
router.post("/auth/login", authController.login);

// Zastosuj middleware ochrony dla wszystkich tras poniżej
router.use(protect);

// Chronione trasy autoryzacji
router.post("/auth/logout", authController.logout);
router.post("/auth/refresh-token", authController.refreshToken);
router.delete("/auth/delete-account", authController.deleteUser);

// Chronione trasy quizu
router.get("/quiz/random", quizLimiter, quizController.getRandomQuestions);
router.get("/quiz/types", quizController.getQuestionTypes);
router.get("/quiz/types/:type", quizController.getQuestionsByType);
router.post("/quiz/reset", quizLimiter, quizController.resetQuiz);

// Chronione trasy pytań
router.get("/questions", questionsController.getAllQuestions);
router.get("/questions/type", questionsController.getQuestionByType);

module.exports = router;
