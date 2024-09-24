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

module.exports = {
  logout,
};
