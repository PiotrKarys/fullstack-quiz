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
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;

  try {
    const totalQuestions = await Quiz.countDocuments({ type });
    const totalPages = Math.ceil(totalQuestions / limit);

    const filteredQuestions = await Quiz.find({ type })
      .skip((page - 1) * limit)
      .limit(limit);

    if (filteredQuestions.length === 0) {
      return res.status(404).json({ message: "Brak pytań w tej kategorii." });
    }

    res.json({
      questions: filteredQuestions,
      currentPage: page,
      totalPages: totalPages,
      totalQuestions: totalQuestions,
    });
  } catch (error) {
    console.error("Błąd podczas pobierania pytań:", error);
    res
      .status(500)
      .json({ message: "Wystąpił błąd podczas pobierania pytań." });
  }
};
