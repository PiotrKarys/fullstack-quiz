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
const swaggerUi = require("swagger-ui-express");
const YAML = require("yamljs");
const swaggerDocument = YAML.load("./swagger.yaml");
const helmet = require("helmet");
const passport = require("./config/passport");

// Połączenie z MongoDB
connectDB().then(async () => {
  console.log("Połączono z bazą danych");
  await updateDatabase();
  console.log("Baza danych zaktualizowana");
  await quizService.loadQuestionsToCache();
  console.log("Pytania załadowane do pamięci podręcznej");
});

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(cookieParser());
app.use(
  session({
    secret: process.env.SESSION_SECRET || "tajny_klucz",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      maxAge: 24 * 60 * 60 * 1000, // 24 godziny
    },
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
app.use(passport.initialize());
app.use(passport.session());
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));
// Trasy API
app.use("/api", routes);
app.use("/error", errorHandler);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Uruchom serwer
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Serwer działa na porcie ${PORT}`);
});

function shouldCompress(req, res) {
  if (req.headers["x-no-compression"]) {
    return false;
  }

  const contentType = res.getHeader("Content-Type");
  if (contentType) {
    // Usuń lub zakomentuj tę linię, aby wyłączyć logowanie
    // console.log(`Kompresja dla typu MIME: ${contentType}`);
    return /json|text|javascript|css/.test(contentType);
  }

  return compression.filter(req, res);
}
