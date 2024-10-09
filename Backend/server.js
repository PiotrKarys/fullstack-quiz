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
const swaggerJsDoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");
const helmet = require("helmet");

// Połączenie z MongoDB
connectDB().then(async () => {
  console.log("Połączono z bazą danych");
  await updateDatabase();
  console.log("Baza danych zaktualizowana");
  await quizService.loadQuestionsToCache();
  console.log("Pytania załadowane do pamięci podręcznej");
});

// Swagger configuration
const swaggerOptions = {
  swaggerDefinition: {
    openapi: "3.0.0",
    info: {
      title: "Quiz API",
      version: "1.0.0",
      description: "API do zarządzania quizami",
    },
    servers: [
      {
        url: "http://localhost:5000",
      },
    ],
  },
  apis: ["./controllers/*.js", "./routes/*.js"], // Ścieżka do plików z dokumentacją
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// Middleware
app.use(helmet());
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
    console.log("Nie kompresuj, jeśli klient wyraźnie tego nie chce");
    return false;
  }

  // Kompresuj dla określonych typów MIME
  const contentType = res.getHeader("Content-Type");
  if (contentType) {
    console.log(`Kompresja dla typu MIME: ${contentType}`);
    return /json|text|javascript|css/.test(contentType);
  }

  return compression.filter(req, res);
}
