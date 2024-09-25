const rateLimit = require("express-rate-limit");

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minut
  max: 5, // limit 5 prób na 15 minut
  message: "Zbyt wiele prób logowania, spróbuj ponownie później",
});
const generalLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minuta
  max: 100, // limit 100 zapytań na minutę
  message: "Zbyt wiele zapytań, spróbuj ponownie później",
});
const quizLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 godzina
  max: 50, // limit 50 quizów na godzinę
  message: "Osiągnąłeś limit quizów na godzinę, spróbuj ponownie później",
});
module.exports = { loginLimiter, generalLimiter, quizLimiter };
