const mongoose = require("mongoose");

const answerSchema = new mongoose.Schema({
  text: { type: String, required: true },
  isCorrect: { type: Boolean, required: true },
});

const quizSchema = new mongoose.Schema({
  question: { type: String, required: true },
  type: { type: String, required: true },
  answers: {
    type: [answerSchema],
    required: true,

    validate: v => Array.isArray(v) && v.length > 0,
  },
});

const Quiz = mongoose.model("Quiz", quizSchema, "Quiz");

module.exports = Quiz;
