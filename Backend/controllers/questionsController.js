const Quiz = require("../models/quizSchema");

/**
 * @swagger
 * /api/questions:
 *   get:
 *     summary: Pobierz wszystkie pytania
 *     parameters:
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
 *         description: Lista wszystkich pytań
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
 *                 currentPage:
 *                   type: integer
 *                 totalPages:
 *                   type: integer
 *                 totalQuestions:
 *                   type: integer
 *       500:
 *         description: Wystąpił błąd
 */
exports.getAllQuestions = async (req, res) => {
  console.log("Rozpoczęcie pobierania wszystkich pytań");
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;

    const totalQuestions = await Quiz.countDocuments();
    console.log(`Znaleziono ${totalQuestions} pytań`);
    const totalPages = Math.ceil(totalQuestions / limit);

    const questions = await Quiz.find({}, "question")
      .skip((page - 1) * limit)
      .limit(limit);

    const formattedQuestions = questions.map((q, index) => ({
      id: (page - 1) * limit + index + 1,
      question: q.question,
    }));

    console.log(`Pobrano ${formattedQuestions.length} pytań`);
    res.json({
      questions: formattedQuestions,
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

/**
 * @swagger
 * /api/questions/type:
 *   get:
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
exports.getQuestionByType = async (req, res) => {
  console.log("Rozpoczęcie pobierania pytań według typu");
  try {
    const { type } = req.query;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;

    console.log(`Szukam pytań typu: ${type}`);

    const totalQuestions = await Quiz.countDocuments({ type });
    console.log(`Znaleziono ${totalQuestions} pytań typu ${type}`);

    const totalPages = Math.ceil(totalQuestions / limit);

    const questions = await Quiz.find({ type }, "question type")
      .skip((page - 1) * limit)
      .limit(limit);

    console.log(`Pobrano ${questions.length} pytań`);

    if (questions.length === 0) {
      console.log("Brak pytań w tej kategorii");
      return res.status(404).json({ message: "Brak pytań w tej kategorii." });
    }

    const formattedQuestions = questions.map((q, index) => ({
      id: (page - 1) * limit + index + 1,
      question: q.question,
      type: q.type,
    }));

    res.json({
      questions: formattedQuestions,
      currentPage: page,
      totalPages: totalPages,
      totalQuestions: totalQuestions,
      type: type,
    });
  } catch (error) {
    console.error("Błąd podczas pobierania pytań według typu:", error);
    res
      .status(500)
      .json({ message: "Wystąpił błąd podczas pobierania pytań." });
  }
};
