const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const User = require("../models/userSchema");
const bcryptjs = require("bcryptjs");

passport.use(
  new LocalStrategy(
    { usernameField: "email" },
    async (email, password, done) => {
      try {
        const user = await User.findOne({ email });
        if (!user) {
          return done(null, false, {
            message: "Nieprawidłowy email lub hasło",
          });
        }
        const isMatch = await bcryptjs.compare(password, user.password);
        if (!isMatch) {
          return done(null, false, {
            message: "Nieprawidłowy email lub hasło",
          });
        }
        return done(null, user);
      } catch (error) {
        return done(error);
      }
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findOne({ id: id });
    done(null, user);
  } catch (error) {
    done(error);
  }
});

module.exports = passport;
