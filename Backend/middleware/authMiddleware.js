const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
  const token = req.cookies.accessToken;

  if (!token) {
    return res
      .status(401)
      .json({ message: "Brak autoryzacji, proszę się zalogować" });
  }

  try {
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
