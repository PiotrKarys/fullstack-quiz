require("dotenv").config();
const express = require("express");
const connectDB = require("./config/db");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const routes = require("./routes/Routes");
const updateDatabase = require("./scripts/updateDatabase");

const app = express();

// Połączenie z MongoDB
connectDB().then(() => {
  console.log("Połączono z bazą danych");
  updateDatabase().then(() => {
    console.log("Baza danych zaktualizowana");
  });
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(cookieParser());

// Trasy API
app.use("/api", routes);

// Uruchom serwer
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Serwer działa na porcie ${PORT}`);
});