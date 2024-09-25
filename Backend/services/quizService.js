const Quiz = require("../models/quizSchema");
const QuizSession = require("../models/quizSessionSchema");
const { shuffleArray } = require("../utils/helpers");

exports.getRandomQuestions = async (sessionId, page = 1, pageSize = 1) => {
  try {
    let session = await QuizSession.findOne({ sessionId });

    if (!session) {
      const totalQuestions = await Quiz.countDocuments();
      const allQuestions = await Quiz.find({}, "_id");
      const shuffledQuestionIds = shuffleArray(allQuestions.map(q => q._id));

      session = new QuizSession({
        sessionId,
        questions: shuffledQuestionIds,
        currentPage: 1,
      });
      await session.save();
    }

    const skip = (page - 1) * pageSize;
    const questionIds = session.questions.slice(skip, skip + pageSize);

    const questions = await Quiz.find({ _id: { $in: questionIds } });
    const questionsWithShuffledAnswers = questions.map(question => ({
      ...question.toObject(),
      answers: shuffleArray([...question.answers]),
    }));

    session.currentPage = page;
    await session.save();

    return {
      questions: questionsWithShuffledAnswers,
      currentPage: page,
      totalPages: Math.ceil(session.questions.length / pageSize),
      totalQuestions: session.questions.length,
    };
  } catch (error) {
    throw new Error("Błąd podczas pobierania pytań: " + error.message);
  }
};

exports.resetQuiz = async sessionId => {
  await QuizSession.findOneAndDelete({ sessionId });
};
exports.getAllQuestions = async () => {
  return await Quiz.find({}, "question"); // Zwracamy tylko pole 'question'
};
