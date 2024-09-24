const Quiz = require("../models/quizSchema");

function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

exports.getRandomQuestions = async (req, res) => {
  try {
    const questions = await Quiz.aggregate([
      { $sample: { size: 10 } },
      {
        $project: {
          question: 1,
          answers: 1,
        },
      },
    ]);

    const shuffledQuestions = questions.map(question => ({
      ...question,
      answers: shuffleArray(question.answers),
    }));

    res.json(shuffledQuestions);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Błąd podczas pobierania pytań", error: error.message });
  }
};
