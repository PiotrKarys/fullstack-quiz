const Quiz = require("../models/quizSchema");
const { shuffleArray } = require("../utils/helpers");

exports.getRandomQuestions = async (size = 10) => {
  try {
    const questions = await Quiz.aggregate([
      { $sample: { size } },
      {
        $project: {
          question: 1,
          answers: 1,
        },
      },
    ]);

    return questions.map(question => ({
      ...question,
      answers: shuffleArray(question.answers),
    }));
  } catch (error) {
    throw new Error("Błąd podczas pobierania pytań: " + error.message);
  }
};
