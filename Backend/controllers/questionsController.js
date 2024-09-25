const Quiz = require("../models/quizSchema");

exports.getAllQuestions = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;

    const totalQuestions = await Quiz.countDocuments();
    const totalPages = Math.ceil(totalQuestions / limit);

    const questions = await Quiz.find({}, "question")
      .skip((page - 1) * limit)
      .limit(limit);

    const formattedQuestions = questions.map((q, index) => ({
      id: (page - 1) * limit + index + 1,
      question: q.question,
    }));

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

exports.getQuestionByType = async (req, res) => {
  try {
    const { type } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;

    const totalQuestions = await Quiz.countDocuments({ type });
    const totalPages = Math.ceil(totalQuestions / limit);

    const questions = await Quiz.find({ type }, "question type")
      .skip((page - 1) * limit)
      .limit(limit);

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
