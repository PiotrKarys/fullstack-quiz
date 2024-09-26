const quizService = require("../services/quizService");
const Quiz = require("../models/quizSchema");

/**
 * @swagger
 * tags:
 *   - name: Quiz
 *     description: Operacje związane z quizami
 */

/**
 * @swagger
 * /api/quiz/questions/random:
 *   get:
 *     tags: [Quiz]
 *     summary: Pobierz losowe pytania
 *     parameters:
 *       - name: page
 *         in: query
 *         description: Numer strony
 *         required: false
 *         schema:
 *           type: integer
 *           default: 1
 *       - name: pageSize
 *         in: query
 *         description: Liczba pytań na stronie
 *         required: false
 *         schema:
 *           type: integer
 *           default: 1
 *       - name: reset
 *         in: query
 *         description: Czy zresetować quiz
 *         required: false
 *         schema:
 *           type: boolean
 *           default: false
 *     responses:
 *       200:
 *         description: Lista losowych pytań
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 questions:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       question:
 *                         type: string
 *                 sessionId:
 *                   type: string
 *                 pageSize:
 *                   type: integer
 *       500:
 *         description: Wystąpił błąd
 */
exports.getRandomQuestions = async (req, res) => {
  console.log("Rozpoczęcie pobierania losowych pytań");
  try {
    if (!req.session.quizId) {
      const { nanoid } = await import("nanoid");
      req.session.quizId = nanoid();
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

/**
 * @swagger
 * /api/quiz/reset:
 *   post:
 *     tags: [Quiz]
 *     summary: Zresetuj quiz
 *     responses:
 *       200:
 *         description: Quiz został zresetowany
 *       500:
 *         description: Wystąpił błąd podczas resetowania quizu
 */
exports.resetQuiz = async (req, res) => {
  console.log("Rozpoczęcie resetowania quizu");
  try {
    if (!req.session.quizId) {
      const { nanoid } = await import("nanoid");
      req.session.quizId = nanoid();
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

/**
 * @swagger
 * /api/quiz/questions/types:
 *   get:
 *     tags: [Quiz]
 *     summary: Pobierz dostępne typy pytań
 *     responses:
 *       200:
 *         description: Lista typów pytań
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: string
 *       500:
 *         description: Wystąpił błąd
 */
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

/**
 * @swagger
 * /api/quiz/questions/type:
 *   get:
 *     tags: [Quiz]
 *     summary: Pobierz pytania według typu
 *     parameters:
 *       - name: type
 *         in: query
 *         description: Typ pytania
 *         required: true
 *         schema:
 *           type: string
 *       - name: page
 *         in: query
 *         description: Numer strony
 *         required: false
 *         schema:
 *           type: integer
 *           default: 1
 *       - name: limit
 *         in: query
 *         description: Liczba pytań na stronie
 *         required: false
 *         schema:
 *           type: integer
 *           default: 20
 *     responses:
 *       200:
 *         description: Lista pytań
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 questions:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       question:
 *                         type: string
 *                       type:
 *                         type: string
 *                 currentPage:
 *                   type: integer
 *                 totalPages:
 *                   type: integer
 *                 totalQuestions:
 *                   type: integer
 *       404:
 *         description: Brak pytań w tej kategorii
 *       500:
 *         description: Wystąpił błąd
 */
exports.getQuestionsByType = async (req, res) => {
  console.log("Rozpoczęcie pobierania pytań według typu");
  const { type } = req.query;
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
