const jwt = require("jsonwebtoken");
const bcryptjs = require("bcryptjs");
const User = require("../models/userSchema");
const { registerSchema, loginSchema } = require("../utils/validationSchemas");

const register = async (req, res, next) => {
  try {
    const { error } = registerSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const { nanoid } = await import("nanoid");
    const { email, password } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({
        status: "error",
        message: "Email jest już w użyciu",
      });
    }
    const hashedPassword = await bcryptjs.hash(password, 10);
    const newUser = new User({
      email,
      password: hashedPassword,
      id: nanoid(),
    });

    await newUser.save();

    res.status(201).json({
      status: "success",
      message: "Użytkownik został utworzony",
      user: {
        email: newUser.email,
        id: newUser.id,
      },
    });
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const { error } = loginSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Nieprawidłowy email lub hasło" });
    }
    const isMatch = await bcryptjs.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Nieprawidłowy email lub hasło" });
    }

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
    });
  } catch (error) {
    next(error);
  }
};

const logout = async (req, res, next) => {
  try {
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
    next(error);
  }
};
const refreshToken = async (req, res, next) => {
  try {
    const oldRefreshToken = req.cookies.refreshToken;

    if (!oldRefreshToken) {
      return res.status(401).json({ message: "Brak tokenu odświeżającego" });
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
          expiresIn: "15m", // Krótszy czas życia
        });

        const newRefreshToken = jwt.sign(
          payload,
          process.env.REFRESH_JWT_SECRET,
          {
            expiresIn: "7d",
          }
        );

        res.cookie("accessToken", newAccessToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "strict",
          maxAge: 15 * 60 * 1000, // 15 minut
        });

        res.cookie("refreshToken", newRefreshToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "strict",
          maxAge: 7 * 24 * 60 * 60 * 1000, // 7 dni
        });

        res.json({ message: "Tokeny zostały odświeżone" });
      }
    );
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  logout,
  refreshToken,
};
