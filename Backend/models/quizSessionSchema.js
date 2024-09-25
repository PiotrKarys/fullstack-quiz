const mongoose = require("mongoose");

const quizSessionSchema = new mongoose.Schema({
  sessionId: { type: String, required: true, unique: true },
  questions: [{ type: mongoose.Schema.Types.ObjectId, ref: "Quiz" }],
  currentPage: { type: Number, default: 1 },
  createdAt: { type: Date, default: Date.now, expires: "1h" }, // Sesja wygasa po godzinie
});

module.exports = mongoose.model("QuizSession", quizSessionSchema);
