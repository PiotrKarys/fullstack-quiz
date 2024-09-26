const jwt = require("jsonwebtoken");
const Blacklist = require("../models/blacklistSchema");

const authMiddleware = async (req, res, next) => {
  const token = req.cookies.accessToken;

  if (!token) {
    return res
      .status(401)
      .json({ message: "Brak autoryzacji, proszę się zalogować" });
  }

  try {
    // Sprawdź, czy token jest na blackliście
    const isBlacklisted = await Blacklist.findOne({ token });
    if (isBlacklisted) {
      return res.status(401).json({ message: "Token jest nieważny" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res
      .status(401)
      .json({ message: "Token jest nieprawidłowy lub wygasł" });
  }
};

module.exports = authMiddleware;
