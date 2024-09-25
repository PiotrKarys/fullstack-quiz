const quizService = require("../services/quizService");
const { addTask } = require("../services/backgroundTasks");
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

    console.log(
      `Zapytanie o quiz: sessionId=${sessionId}, page=${page}, pageSize=${pageSize}`
    );

    const result = await quizService.getRandomQuestions(
      sessionId,
      page,
      pageSize
    );

    if (result.questions.length === 0) {
      console.log(
        "Nie znaleziono pytań w serwisie. Sprawdzam bezpośrednio w bazie danych..."
      );
      const allQuestions = await Quiz.find({});
      console.log(`Liczba pytań w bazie danych: ${allQuestions.length}`);
      if (allQuestions.length > 0) {
        console.log(
          `Przykładowe pytanie z bazy: ${JSON.stringify(allQuestions[0])}`
        );
      }
    }

    res.json({
      ...result,
      sessionId: sessionId,
      pageSize: pageSize,
    });
  } catch (error) {
    console.error("Błąd w kontrolerze getRandomQuestions:", error);
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
