const request = require("supertest");
const express = require("express");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const User = require("../../models/userSchema");
const Blacklist = require("../../models/blacklistSchema");
const routes = require("../../routes/Routes");
const connectDB = require("../../config/db");
const passport = require("../../config/passport");
const cookieParser = require("cookie-parser");

// Ustawiamy globalny timeout na 15 sekund
jest.setTimeout(30000);

describe("Autentykacja i odświeżanie tokenu", () => {
  let app;
  let user;
  let accessToken;
  let refreshToken;

  beforeAll(async () => {
    // Połączenie z testową bazą danych
    await connectDB();

    // Konfiguracja testowej aplikacji Express
    app = express();
    app.use(express.json());
    app.use(cookieParser());
    app.use(passport.initialize());
    app.use("/api", routes);
  }, 30000); // Dodajemy timeout 15 sekund dla beforeAll

  afterAll(async () => {
    await User.deleteMany({});
    await Blacklist.deleteMany({});
    await mongoose.connection.close();
  }, 30000); // Dodajemy timeout 15 sekund dla afterAll

  test("Powinno zarejestrować nowego użytkownika", async () => {
    const response = await request(app).post("/api/auth/register").send({
      email: "testowy@ziomek.pl",
      password: "superTajneHaslo123!",
    });

    console.log("Register response:", response.body);

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty(
      "message",
      "Użytkownik został utworzony"
    );
    expect(response.body).toHaveProperty("user");
    expect(response.body.user).toHaveProperty("email", "testowy@ziomek.pl");

    user = response.body.user;
  }, 30000); // Dodajemy timeout 15 sekund dla tego testu

  test("Powinno zalogować użytkownika", async () => {
    const response = await request(app).post("/api/auth/login").send({
      email: "testowy@ziomek.pl",
      password: "superTajneHaslo123!",
    });

    console.log("Login response:", response.body);

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("accessToken");
    expect(response.body).toHaveProperty("refreshToken");

    accessToken = response.body.accessToken;
    refreshToken = response.body.refreshToken;
  }, 30000);

  test("Powinno odświeżyć token poprawnie", async () => {
    const response = await request(app)
      .post("/api/auth/refresh-token")
      .set("Authorization", `Bearer ${refreshToken}`);

    console.log("Refresh token response:", response.body);

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("accessToken");
    expect(response.body).toHaveProperty("refreshToken");

    // Sprawdź, czy stary token jest na blackliście
    const blacklistedToken = await Blacklist.findOne({ token: refreshToken });
    expect(blacklistedToken).toBeTruthy();

    // Sprawdź, czy nowy token jest poprawny
    const decodedToken = jwt.verify(
      response.body.accessToken,
      process.env.JWT_SECRET
    );
    expect(decodedToken).toHaveProperty("id", user.id);
    expect(decodedToken).toHaveProperty("email", user.email);

    accessToken = response.body.accessToken;
    refreshToken = response.body.refreshToken;
  }, 30000); // Dodajemy timeout 15 sekund dla tego testu

  test("Powinno zwrócić błąd dla nieważnego tokenu", async () => {
    const invalidToken = "to_nie_jest_prawdziwy_token";
    const response = await request(app)
      .post("/api/auth/refresh-token")
      .set("Authorization", `Bearer ${invalidToken}`);

    console.log("Invalid token response:", response.body);

    expect(response.status).toBe(401);
    expect(response.body).toHaveProperty(
      "message",
      "Nieprawidłowy token odświeżający"
    );
  }, 30000); // Dodajemy timeout 15 sekund dla tego testu
});
