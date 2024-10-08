const jwt = require("jsonwebtoken");
const bcryptjs = require("bcryptjs");
const User = require("../models/userSchema");
const { registerSchema, loginSchema } = require("../utils/validationSchemas");
const Blacklist = require("../models/blacklistSchema");
const {
  initials,
  generateRandomColor,
  generateInitialsAvatar,
} = require("../utils/avatarUtils");

const register = async (req, res, next) => {
  try {
    console.log("Rozpoczęcie rejestracji");
    const { error } = registerSchema.validate(req.body);
    if (error) {
      console.log("Błąd walidacji:", error.details[0].message);
      return res.status(400).json({ message: error.details[0].message });
    }

    const { nanoid } = await import("nanoid");
    const { email, password } = req.body;
    console.log("Dane rejestracji:", { email });
    const userInitials = initials(email).toUpperCase();
    const avatarColor = generateRandomColor();
    const avatar = generateInitialsAvatar(userInitials, avatarColor);

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.log("Użytkownik już istnieje");
      return res.status(409).json({
        status: "error",
        message: "Email jest już w użyciu",
      });
    }

    const userId = nanoid();
    console.log("Wygenerowane ID:", userId);

    const newUser = new User({
      email,
      password,
      id: userId,
      avatar,
    });

    console.log("Próba zapisania użytkownika");
    await newUser.save();
    console.log("Użytkownik zapisany");

    res.status(201).json({
      status: "success",
      message: "Użytkownik został utworzony",
      user: {
        email: newUser.email,
        id: newUser.id,
        avatar: newUser.avatar,
      },
    });
  } catch (error) {
    console.error("Błąd podczas rejestracji:", error);
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    console.log("Otrzymane dane logowania:", req.body);
    const token = req.cookies.accessToken;
    if (token) {
      try {
        jwt.verify(token, process.env.JWT_SECRET);
        console.log("Użytkownik jest już zalogowany");
        return res.status(200).json({
          status: "success",
          message: "Użytkownik jest już zalogowany",
        });
      } catch (err) {
        console.log("Nieważny token, kontynuowanie logowania");
      }
    }
    const { error } = loginSchema.validate(req.body);
    if (error) {
      console.log("Błąd walidacji:", error.details[0].message);
      return res.status(400).json({ message: error.details[0].message });
    }

    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      console.log("Nie znaleziono użytkownika o emailu:", email);
      return res.status(401).json({ message: "Nieprawidłowy email lub hasło" });
    }
    console.log("Znaleziono użytkownika:", user.email);

    const isMatch = await bcryptjs.compare(password, user.password);
    console.log("Wynik porównania hasła:", isMatch);
    if (!isMatch) {
      console.log("Nieprawidłowe hasło dla użytkownika:", email);
      return res.status(401).json({ message: "Nieprawidłowy email lub hasło" });
    }
    console.log("Hasło poprawne dla użytkownika:", email);

    const payload = {
      id: user._id,
      email: user.email,
    };

    const accessToken = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });
    const refreshToken = jwt.sign(payload, process.env.REFRESH_JWT_SECRET, {
      expiresIn: "7d",
    });

    // Ustawienie ciasteczek
    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // Używaj HTTPS w produkcji
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
  } catch (error) {
    console.error("Błąd podczas logowania:", error);
    next(error);
  }
};

const logout = async (req, res, next) => {
  try {
    console.log("Rozpoczęcie wylogowania");
    const accessToken = req.cookies.accessToken;
    const refreshToken = req.cookies.refreshToken;

    // Dodaj tokeny do blacklisty
    if (accessToken) {
      await new Blacklist({ token: accessToken }).save();
      console.log("Dodano accessToken do blacklisty");
    }
    if (refreshToken) {
      await new Blacklist({ token: refreshToken }).save();
      console.log("Dodano refreshToken do blacklisty");
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
      await new Blacklist({ token: accessToken }).save();
      console.log("Dodano accessToken do blacklisty");
    }
    if (refreshToken) {
      await new Blacklist({ token: refreshToken }).save();
      console.log("Dodano refreshToken do blacklisty");
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
    const oldRefreshToken = req.cookies.refreshToken || req.body.refreshToken;

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

        const user = await User.findById(decoded.id);
        if (!user) {
          return res.status(403).json({ message: "Użytkownik nie istnieje" });
        }

        const payload = {
          id: user._id,
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

        await new Blacklist({ token: oldRefreshToken }).save();

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

module.exports = {
  register,
  login,
  logout,
  refreshToken,
  deleteUser,
};
