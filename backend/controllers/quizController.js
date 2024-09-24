const quizService = require("../services/quizService");

exports.getRandomQuestions = async (req, res) => {
  try {
    const shuffledQuestions = await quizService.getRandomQuestions();
    res.json(shuffledQuestions);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Błąd podczas pobierania pytań", error: error.message });
  }
};
