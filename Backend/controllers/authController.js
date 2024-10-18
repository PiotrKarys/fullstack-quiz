const jwt = require("jsonwebtoken");
const User = require("../models/userSchema");
const {
  registerSchema,
  loginSchema,
  refreshTokenSchema,
} = require("../utils/validationSchemas");
const Blacklist = require("../models/blacklistSchema");
const {
  initials,
  generateRandomColor,
  generateInitialsAvatar,
} = require("../utils/avatarUtils");
const passport = require("passport");
const { v4: uuidv4 } = require("uuid");
const moment = require("moment-timezone");

const register = async (req, res, next) => {
  try {
    const { error } = registerSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const { email, password, confirmPassword, name } = req.body;

    if (password !== confirmPassword) {
      return res.status(400).json({ message: "Hasła nie są takie same" });
    }

    const userInitials = initials(name).toUpperCase();
    const avatarColor = generateRandomColor();
    const avatar = generateInitialsAvatar(userInitials, avatarColor);

    const existingUser = await User.findOne({ $or: [{ email }, { name }] });
    if (existingUser) {
      return res.status(409).json({
        status: "error",
        message:
          existingUser.email === email
            ? "Email jest już w użyciu"
            : "Nazwa użytkownika jest już zajęta",
      });
    }

    const userId = uuidv4();

    const newUser = new User({
      email,
      password,
      name,
      id: userId,
      avatar,
      registrationDate: moment().tz("Europe/Warsaw").toDate(),
    });

    await newUser.save();

    res.status(201).json({
      status: "success",
      message: "Użytkownik został utworzony",
      user: {
        email: newUser.email,
        name: newUser.name,
        id: newUser.id,
        avatar: newUser.avatar,
      },
    });
  } catch (error) {
    console.error("Błąd podczas rejestracji:", error);
    next(error);
  }
};

const login = (req, res, next) => {
  const { error } = loginSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }

  passport.authenticate("local", async (err, user, info) => {
    if (err) {
      return next(err);
    }
    if (!user) {
      return res.status(401).json({ message: info.message });
    }

    try {
      // Sprawdź, czy użytkownik jest już zalogowany
      if (req.isAuthenticated()) {
        return res.status(200).json({
          status: "success",
          message: "Użytkownik jest już zalogowany",
          userData: {
            email: req.user.email,
            id: req.user.id,
          },
        });
      }

      // Sprawdź częstotliwość logowania
      const lastLogin = user.lastLogin || new Date(0);
      const now = new Date();
      if (now - lastLogin < 60000) {
        // 1 minuta
        return res.status(429).json({
          message: "Zbyt częste próby logowania. Spróbuj ponownie za chwilę.",
        });
      }

      req.logIn(user, async err => {
        if (err) {
          return next(err);
        }

        const payload = {
          id: user.id,
          email: user.email,
        };

        const accessToken = jwt.sign(payload, process.env.JWT_SECRET, {
          expiresIn: "1h",
        });
        const refreshToken = jwt.sign(payload, process.env.REFRESH_JWT_SECRET, {
          expiresIn: "7d",
        });

        // Aktualizacja czasów utworzenia tokenów i ostatniego logowania
        user.lastAccessTokenCreated = moment().tz("Europe/Warsaw").toDate();
        user.lastRefreshTokenCreated = moment().tz("Europe/Warsaw").toDate();
        user.lastLogin = moment().tz("Europe/Warsaw").toDate();
        await user.save();

        res.cookie("accessToken", accessToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "strict",
          maxAge: 60 * 60 * 1000, // 1 godzina
        });

        res.cookie("refreshToken", refreshToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "strict",
          maxAge: 7 * 24 * 60 * 60 * 1000, // 7 dni
        });

        res.status(200).json({
          status: "success",
          message: "Zalogowano pomyślnie",
          userData: {
            email: user.email,
            id: user.id,
          },
          accessToken,
          refreshToken,
        });
      });
    } catch (error) {
      console.error("Błąd podczas logowania:", error);
      next(error);
    }
  })(req, res, next);
};

const logout = async (req, res, next) => {
  try {
    const accessToken = req.cookies.accessToken;
    const refreshToken = req.cookies.refreshToken;
    const userId = req.user.id;

    // Dodaj tokeny do blacklisty
    if (accessToken) {
      await new Blacklist({ token: accessToken, userId }).save();
    }
    if (refreshToken) {
      await new Blacklist({ token: refreshToken, userId }).save();
    }

    // Wylogowanie z Passport
    req.logout(err => {
      if (err) {
        return next(err);
      }

      // Usuwamy ciasteczka z tokenami
      res.clearCookie("accessToken", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
      });

      res.clearCookie("refreshToken", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
      });

      res.status(200).json({
        status: "success",
        message: "Wylogowano pomyślnie",
      });
    });
  } catch (error) {
    console.error("Błąd podczas wylogowania:", error);
    next(error);
  }
};

const deleteUser = async (req, res, next) => {
  try {
    const userId = req.user.id; // ID użytkownika z tokenu
    const { password } = req.body;

    // Weryfikacja tokenów
    const accessToken = req.cookies.accessToken;
    const refreshToken = req.cookies.refreshToken;
    if (!accessToken) {
      return res
        .status(401)
        .json({ message: "Brak autoryzacji. Zaloguj się ponownie." });
    }

    try {
      jwt.verify(accessToken, process.env.JWT_SECRET);
    } catch (err) {
      return res
        .status(401)
        .json({ message: "Nieprawidłowy token. Zaloguj się ponownie." });
    }

    const user = await User.findOne({ id: userId });
    if (!user) {
      return res.status(404).json({ message: "Nie znaleziono użytkownika" });
    }

    // Sprawdzenie hasła
    const isPasswordCorrect = await user.comparePassword(password);
    if (!isPasswordCorrect) {
      return res.status(401).json({ message: "Nieprawidłowe hasło" });
    }

    // Usunięcie użytkownika
    await User.findOneAndDelete({ id: userId });

    // Dodanie tokenów do blacklisty
    if (accessToken) {
      await new Blacklist({ token: accessToken, userId }).save();
    }
    if (refreshToken) {
      await new Blacklist({ token: refreshToken, userId }).save();
    }

    // Usunięcie ciasteczek z tokenami
    res.clearCookie("accessToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });

    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });

    res.status(200).json({
      status: "success",
      message: "Konto użytkownika zostało usunięte",
    });
  } catch (error) {
    console.error("Błąd podczas usuwania konta:", error);
    next(error);
  }
};

const refreshToken = async (req, res, next) => {
  try {
    const { error } = refreshTokenSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const oldRefreshToken = req.cookies.refreshToken || req.body.refreshToken;
    const oldAccessToken = req.cookies.accessToken || req.body.accessToken;

    if (!oldRefreshToken) {
      return res.status(401).json({ message: "Brak tokenu odświeżającego" });
    }

    const isBlacklisted = await Blacklist.findOne({ token: oldRefreshToken });
    if (isBlacklisted) {
      return res
        .status(401)
        .json({ message: "Token odświeżający jest nieważny" });
    }

    jwt.verify(
      oldRefreshToken,
      process.env.REFRESH_JWT_SECRET,
      async (err, decoded) => {
        if (err) {
          return res
            .status(403)
            .json({ message: "Nieprawidłowy token odświeżający" });
        }

        const user = await User.findOne({ id: decoded.id });
        if (!user) {
          return res.status(403).json({ message: "Użytkownik nie istnieje" });
        }

        const lastRefresh = user.lastRefreshTokenCreated;
        const now = new Date();
        if (lastRefresh && now - lastRefresh < 60000) {
          // 1 minuta
          return res.status(429).json({
            message:
              "Zbyt częste odświeżanie tokenu. Spróbuj ponownie za chwilę.",
          });
        }

        const payload = {
          id: user.id,
          email: user.email,
        };

        const newAccessToken = jwt.sign(payload, process.env.JWT_SECRET, {
          expiresIn: "15m",
        });
        const newRefreshToken = jwt.sign(
          payload,
          process.env.REFRESH_JWT_SECRET,
          {
            expiresIn: "7d",
          }
        );

        // Aktualizacja czasów utworzenia tokenów
        user.lastAccessTokenCreated = moment().tz("Europe/Warsaw").toDate();
        user.lastRefreshTokenCreated = moment().tz("Europe/Warsaw").toDate();
        await user.save();

        // Dodajemy stare tokeny do czarnej listy
        try {
          if (oldRefreshToken) {
            await new Blacklist({
              token: oldRefreshToken,
              userId: user.id,
            }).save();
          }
          if (oldAccessToken) {
            await new Blacklist({
              token: oldAccessToken,
              userId: user.id,
            }).save();
          }
        } catch (error) {
          console.error(
            "Błąd podczas dodawania tokenów do czarnej listy:",
            error
          );
          // Możemy zdecydować, czy chcemy przerwać operację, czy kontynuować
        }

        res.cookie("accessToken", newAccessToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "strict",
          maxAge: 15 * 60 * 1000,
        });

        res.cookie("refreshToken", newRefreshToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "strict",
          maxAge: 7 * 24 * 60 * 60 * 1000,
        });

        res.json({
          message: "Tokeny zostały odświeżone",
          accessToken: newAccessToken,
          refreshToken: newRefreshToken,
        });
      }
    );
  } catch (error) {
    console.error("Błąd podczas odświeżania tokenów:", error);
    next(error);
  }
};

const getUserInfo = async (req, res) => {
  try {
    const user = await User.findOne({ id: req.user.id }).select("-password");
    if (!user) {
      return res.status(404).json({ message: "Użytkownik nie znaleziony" });
    }
    res.json({
      id: user.id,
      email: user.email,
      avatar: user.avatar,
      registrationDate: user.registrationDate,
      lastAccessTokenCreated: user.lastAccessTokenCreated,
      lastRefreshTokenCreated: user.lastRefreshTokenCreated,
    });
  } catch (error) {
    console.error("Błąd podczas pobierania informacji o użytkowniku:", error);
    res.status(500).json({ message: "Błąd serwera" });
  }
};

const isTokenBlacklisted = async (token, userId) => {
  const blacklistedToken = await Blacklist.findOne({ token, userId });
  return !!blacklistedToken;
};

module.exports = {
  register,
  login,
  logout,
  refreshToken,
  deleteUser,
  getUserInfo,
  isTokenBlacklisted,
};
