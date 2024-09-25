const rateLimit = require("express-rate-limit");

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minut
  max: 5, // limit 5 prób na 15 minut
  message: "Zbyt wiele prób logowania, spróbuj ponownie później",
});

module.exports = { loginLimiter };
