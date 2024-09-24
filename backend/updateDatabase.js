const fs = require("fs");
const path = require("path");
const Quiz = require("./models/quizSchema");

async function updateDatabase() {
  try {
    const questionsFilePath = path.join(__dirname, "data/questions.json");
    const questionsData = fs.readFileSync(questionsFilePath, "utf-8");
    const jsonQuestions = JSON.parse(questionsData);

    let addedCount = 0;
    let updatedCount = 0;

    for (const jsonQuestion of jsonQuestions) {
      const existingQuestion = await Quiz.findOne({
        question: jsonQuestion.question,
      });

      if (!existingQuestion) {
        // Dodaj nowe pytanie do bazy danych
        const newQuestion = new Quiz(jsonQuestion);
        await newQuestion.save();
        addedCount++;
        console.log(`Dodano nowe pytanie: ${jsonQuestion.question}`);
      } else {
        // Aktualizuj istniejące pytanie
        existingQuestion.type = jsonQuestion.type;
        existingQuestion.answers = jsonQuestion.answers;
        await existingQuestion.save();
        updatedCount++;
        console.log(`Zaktualizowano pytanie: ${jsonQuestion.question}`);
      }
    }

    console.log(`Aktualizacja bazy danych zakończona.`);
    console.log(`Dodano ${addedCount} nowych pytań.`);
    console.log(`Zaktualizowano ${updatedCount} istniejących pytań.`);
    console.log(`Łącznie w bazie jest ${addedCount + updatedCount} pytań.`);
  } catch (error) {
    console.error("Błąd podczas aktualizacji bazy danych:", error);
  }
}

module.exports = updateDatabase;
