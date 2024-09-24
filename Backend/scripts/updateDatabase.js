const fs = require("fs");
const path = require("path");
const Quiz = require("../models/quizSchema");

async function updateDatabase() {
  try {
    const questionsFilePath = path.join(__dirname, "./data/questions.json");
    const questionsData = fs.readFileSync(questionsFilePath, "utf-8");
    const jsonQuestions = JSON.parse(questionsData);

    // Pobierz wszystkie istniejące pytania z bazy danych
    const existingQuestions = await Quiz.find({}, "question");
    const existingQuestionSet = new Set(existingQuestions.map(q => q.question));

    let addedCount = 0;

    for (const jsonQuestion of jsonQuestions) {
      if (!existingQuestionSet.has(jsonQuestion.question)) {
        // Dodaj nowe pytanie do bazy danych
        const newQuestion = new Quiz(jsonQuestion);
        await newQuestion.save();
        addedCount++;
        console.log(`Dodano nowe pytanie: ${jsonQuestion.question}`);
      }
    }

    if (addedCount > 0) {
      console.log(`Aktualizacja bazy danych zakończona.`);
      console.log(`Dodano ${addedCount} nowych pytań.`);
    } else {
      console.log("Brak nowych pytań do dodania.");
    }

    const totalQuestions = await Quiz.countDocuments();
    console.log(`Łącznie w bazie jest ${totalQuestions} pytań.`);
  } catch (error) {
    console.error("Błąd podczas aktualizacji bazy danych:", error);
  }
}

module.exports = updateDatabase;
