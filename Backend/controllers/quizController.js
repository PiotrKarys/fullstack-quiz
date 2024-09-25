const quizService = require("../services/quizService");

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
