const jwt = require("jsonwebtoken");
const Blacklist = require("../models/blacklistSchema");
const User = require("../models/userSchema");
const { isTokenBlacklisted } = require("../controllers/authController");

const protect = async (req, res, next) => {
  let token;

  if (req.cookies.accessToken) {
    token = req.cookies.accessToken;
  } else if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return res
      .status(401)
      .json({ message: "Brak autoryzacji, proszę się zalogować" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Sprawdź, czy token jest na czarnej liście
    const isBlacklisted = await isTokenBlacklisted(token, decoded.id);
    if (isBlacklisted) {
      return res.status(401).json({ message: "Token jest nieważny" });
    }

    req.user = await User.findOne({ id: decoded.id }).select("-password");

    if (!req.user) {
      return res.status(401).json({ message: "Użytkownik nie istnieje" });
    }

    next();
  } catch (error) {
    console.error("Błąd autoryzacji:", error);
    return res
      .status(401)
      .json({ message: "Token jest nieprawidłowy lub wygasł" });
  }
};

module.exports = { protect };
