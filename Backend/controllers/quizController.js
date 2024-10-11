const quizService = require("../services/quizService");
const Quiz = require("../models/quizSchema");

const { v4: uuidv4 } = require("uuid");

exports.getRandomQuestions = async (req, res) => {
  console.log("Rozpoczęcie pobierania losowych pytań");
  try {
    if (!req.session.quizId) {
      req.session.quizId = uuidv4();
      console.log("Utworzono nowy quizId:", req.session.quizId);
    }
    const sessionId = req.session.quizId;
    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize) || 1;
    const reset = req.query.reset === "true";

    console.log(
      `Zapytanie o quiz: sessionId=${sessionId}, page=${page}, pageSize=${pageSize}, reset=${reset}`
    );

    if (reset) {
      await quizService.resetQuiz(sessionId);
      console.log("Quiz zresetowany dla sessionId:", sessionId);
    }

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
  console.log("Rozpoczęcie resetowania quizu");
  try {
    if (!req.session.quizId) {
      req.session.quizId = uuidv4();
      console.log("Utworzono nowy quizId:", req.session.quizId);
    }
    const sessionId = req.session.quizId;
    await quizService.resetQuiz(sessionId);
    console.log("Quiz zresetowany dla sessionId:", sessionId);
    res.json({ message: "Quiz został zresetowany" });
  } catch (error) {
    console.error("Błąd podczas resetowania quizu:", error);
    res.status(500).json({
      message: "Błąd podczas resetowania quizu",
      error: error.message,
    });
  }
};

exports.getQuestionTypes = async (req, res) => {
  console.log("Rozpoczęcie pobierania typów pytań");
  try {
    const types = await Quiz.distinct("type");
    console.log("Znalezione typy pytań:", types);
    res.json(types);
  } catch (error) {
    console.error("Błąd podczas pobierania typów pytań:", error);
    res
      .status(500)
      .json({ message: "Wystąpił błąd podczas pobierania typów pytań." });
  }
};

exports.getQuestionsByType = async (req, res) => {
  console.log("Rozpoczęcie pobierania pytań według typu");
  const { type } = req.params;
  console.log("Typ pytania:", type);
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;

  try {
    const totalQuestions = await Quiz.countDocuments({ type });
    console.log(`Znaleziono ${totalQuestions} pytań typu ${type}`);
    const totalPages = Math.ceil(totalQuestions / limit);

    const filteredQuestions = await Quiz.find({ type })
      .skip((page - 1) * limit)
      .limit(limit);

    if (filteredQuestions.length === 0) {
      console.log("Brak pytań w tej kategorii");
      return res.status(404).json({ message: "Brak pytań w tej kategorii." });
    }

    console.log(`Pobrano ${filteredQuestions.length} pytań`);
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
