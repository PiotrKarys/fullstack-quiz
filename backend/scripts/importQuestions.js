require("dotenv").config();
const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");
const Quiz = require("../models/quizSchema");
// Połącz się z MongoDB
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Połączono z MongoDB"))
  .catch(err => console.log("Błąd połączenia z MongoDB: ", err));

// Funkcja do wczytywania pytań z pliku JSON
const importQuestions = async () => {
  try {
    // Wczytaj plik questions.json
    const questionsFilePath = path.join(__dirname, "data/questions.json");
    const questionsData = fs.readFileSync(questionsFilePath, "utf-8");
    const questions = JSON.parse(questionsData);

    console.log("Pytania do dodania:", JSON.stringify(questions, null, 2));

    for (const question of questions) {
      const newQuestion = new Quiz(question);
      await newQuestion.save();
      console.log(`Dodano pytanie: ${question.question}`);
    }

    console.log(`Dodano ${questions.length} pytań do MongoDB`);
  } catch (error) {
    console.error("Błąd podczas importowania pytań: ", error);
  } finally {
    // Zakończ połączenie z MongoDB
    await mongoose.connection.close();
  }
};

importQuestions();
