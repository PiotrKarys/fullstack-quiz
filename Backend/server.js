require("dotenv").config();
const express = require("express");
const session = require("express-session");
const connectDB = require("./config/db");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const routes = require("./routes/Routes");
const updateDatabase = require("./scripts/updateDatabase");
const errorHandler = require("./middleware/errorMiddleware");
const app = express();
const { loginLimiter, generalLimiter } = require("./middleware/rateLimit");
const compression = require("compression");
const quizService = require("./services/quizService");

// Połączenie z MongoDB
connectDB().then(async () => {
  console.log("Połączono z bazą danych");
  await updateDatabase();
  console.log("Baza danych zaktualizowana");
  await quizService.loadQuestionsToCache();
  console.log("Pytania załadowane do pamięci podręcznej");
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(cookieParser());
app.use(
  session({
    secret: process.env.SESSION_SECRET || "tajny_klucz",
    resave: false,
    saveUninitialized: true,
    cookie: { secure: process.env.NODE_ENV === "production" },
  })
);
app.use(generalLimiter);
app.use("/api/auth/login", loginLimiter);
app.use(
  compression({
    level: 6,
    threshold: 100 * 1024,
    filter: shouldCompress,
  })
);
// Trasy API
app.use("/api", routes);
app.use("/error", errorHandler);
// Uruchom serwer
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Serwer działa na porcie ${PORT}`);
});

function shouldCompress(req, res) {
  if (req.headers["x-no-compression"]) {
    // Nie kompresuj, jeśli klient wyraźnie tego nie chce
    return false;
  }

  // Kompresuj dla określonych typów MIME
  const contentType = res.getHeader("Content-Type");
  if (contentType) {
    return /json|text|javascript|css/.test(contentType);
  }

  return compression.filter(req, res);
}
