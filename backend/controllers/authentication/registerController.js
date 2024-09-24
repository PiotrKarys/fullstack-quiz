const User = require("../../models/userSchema");
const bcryptjs = require("bcryptjs");

const signup = async (req, res, next) => {
  try {
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

module.exports = {
  signup,
};
