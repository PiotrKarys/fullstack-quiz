const Quiz = require("../models/quizSchema");
const QuizSession = require("../models/quizSessionSchema");
const { shuffleArray } = require("../utils/helpers");

let cachedQuestions = {};

exports.loadQuestionsToCache = async () => {
  const questions = await Quiz.find({}).lean();
  cachedQuestions = questions.reduce((acc, question) => {
    acc[question._id.toString()] = question;
    return acc;
  }, {});
  console.log(
    `Załadowano ${
      Object.keys(cachedQuestions).length
    } pytań do pamięci podręcznej`
  );
  console.log(`Przykładowe ID pytania: ${Object.keys(cachedQuestions)[0]}`);
};

async function loadQuestionsToCache() {
  if (!cachedQuestions) {
    cachedQuestions = await Quiz.find({});
    console.log("Pytania załadowane do pamięci podręcznej");
  }
}

exports.getRandomQuestions = async (sessionId, page = 1, pageSize = 1) => {
  try {
    await this.loadQuestionsToCache();
    console.log(`Liczba pytań w cache: ${Object.keys(cachedQuestions).length}`);

    let session = await QuizSession.findOne({ sessionId });
    console.log(`Znaleziona sesja: ${session ? "Tak" : "Nie"}`);

    if (!session) {
      const shuffledQuestionIds = shuffleArray(
        Object.keys(cachedQuestions)
      ).slice(0, 10); // Ograniczenie do 10 pytań
      console.log(`Liczba przetasowanych pytań: ${shuffledQuestionIds.length}`);

      session = new QuizSession({
        sessionId,
        questions: shuffledQuestionIds,
        currentPage: 1,
      });

      await session.save();
      console.log(
        `Utworzono nową sesję. ID pierwszego pytania w sesji: ${session.questions[0]}`
      );
    }

    // Aktualizuj currentPage tylko jeśli jest to nowa strona
    if (page > session.currentPage) {
      session.currentPage = page;
      await session.save();
    }

    const skip = (page - 1) * pageSize;
    const questionIds = session.questions.slice(skip, skip + pageSize);
    console.log(`Wybrane ID pytań: ${questionIds}`);

    const questions = questionIds
      .map(id => cachedQuestions[id])
      .filter(Boolean);
    console.log(`Liczba znalezionych pytań: ${questions.length}`);

    if (questions.length === 0) {
      console.log(
        `Nie znaleziono pytań. Sprawdzam bezpośrednio w bazie danych...`
      );
      const questionFromDB = await Quiz.findById(questionIds[0]);
      console.log(
        `Pytanie znalezione bezpośrednio w bazie: ${
          questionFromDB ? JSON.stringify(questionFromDB) : "Nie"
        }`
      );
      if (questionFromDB) {
        questions.push(questionFromDB);
        cachedQuestions[questionFromDB._id.toString()] = questionFromDB;
      }
    }

    const questionsWithShuffledAnswers = questions.map(question => ({
      ...question,
      answers: shuffleArray([...question.answers]),
    }));

    return {
      questions: questionsWithShuffledAnswers,
      currentPage: session.currentPage,
      totalPages: Math.ceil(session.questions.length / pageSize),
      totalQuestions: session.questions.length,
    };
  } catch (error) {
    console.error("Błąd podczas pobierania pytań:", error);
    throw new Error("Błąd podczas pobierania pytań: " + error.message);
  }
};

exports.resetQuiz = async sessionId => {
  await QuizSession.findOneAndDelete({ sessionId });
  console.log(`Zresetowano quiz dla sesji: ${sessionId}`);
};

exports.getAllQuestions = async () => {
  await loadQuestionsToCache();
  return cachedQuestions.map(q => ({ question: q.question }));
};
