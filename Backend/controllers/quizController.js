const quizService = require("../services/quizService");
const Quiz = require("../models/quizSchema");

exports.getRandomQuestions = async (req, res) => {
  try {
    if (!req.session.quizId) {
      const { nanoid } = await import("nanoid");
      req.session.quizId = nanoid();
    }
    const sessionId = req.session.quizId;
    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize) || 1;

    const result = await quizService.getRandomQuestions(
      sessionId,
      page,
      pageSize
    );

    res.json(result);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Błąd podczas pobierania pytań", error: error.message });
  }
};

exports.resetQuiz = async (req, res) => {
  try {
    if (!req.session.quizId) {
      const { nanoid } = await import("nanoid");
      req.session.quizId = nanoid();
    }
    const sessionId = req.session.quizId;
    await quizService.resetQuiz(sessionId);
    res.json({ message: "Quiz został zresetowany" });
  } catch (error) {
    res.status(500).json({
      message: "Błąd podczas resetowania quizu",
      error: error.message,
    });
  }
};
exports.getQuestionTypes = async (req, res) => {
  try {
    const types = await Quiz.distinct("type");
    res.json(types);
  } catch (error) {
    console.error("Błąd podczas pobierania typów pytań:", error);
    res
      .status(500)
      .json({ message: "Wystąpił błąd podczas pobierania typów pytań." });
  }
};
exports.getQuestionsByType = async (req, res) => {
  const { type } = req.params;

  try {
    const filteredQuestions = await Quiz.find({ type });

    if (filteredQuestions.length === 0) {
      return res.status(404).json({ message: "Brak pytań w tej kategorii." });
    }

    res.json(filteredQuestions);
  } catch (error) {
    console.error("Błąd podczas pobierania pytań:", error);
    res
      .status(500)
      .json({ message: "Wystąpił błąd podczas pobierania pytań." });
  }
};
exports.getAllQuestions = async (req, res) => {
  try {
    const questions = await quizService.getAllQuestions();
    if (questions.length === 0) {
      return res.status(404).json({ message: "Brak pytań w bazie danych." });
    }
    res.json(questions);
  } catch (error) {
    console.error("Błąd podczas pobierania pytań:", error);
    res
      .status(500)
      .json({ message: "Wystąpił błąd podczas pobierania pytań." });
  }
};
