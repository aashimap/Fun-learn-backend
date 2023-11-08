const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const crypto = require("crypto");
const User = require("./models/user");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
var bcrypt = require("bcrypt");
var jwt = require("jsonwebtoken");

passport.use(
  new LocalStrategy(async function verify(username, password, cb) {
    try {
      const user = await User.where({ fullName: username }).fetch();

      if (!user) {
        return cb(null, false, {
          message: "Incorrect username or password.",
        });
      }

      const hashedPassword = await crypto.pbkdf2Async(
        password,
        user.get("salt"),
        310000,
        32,
        "sha256"
      );

      if (
        !crypto.timingSafeEqual(
          Buffer.from(user.get("hashed_password")),
          hashedPassword
        )
      ) {
        return cb(null, false, {
          message: "Incorrect username or password.",
        });
      }

      return cb(null, user.toJSON());
    } catch (err) {
      return cb(err);
    }
  })
);

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "https://fun-learn-node.onrender.com/auth/google/callback",
    },
    async function (accessToken, refreshToken, profile, done) {
      try {
        let user = await User.where({ email: profile.emails[0].value }).fetch({
          require: false,
        });

        if (!user) {
          user = await new User({
            fullName: profile.displayName,
            email: profile.emails[0].value,
            role: "normal",
          }).save();
        }

        console.log("PROFILE:", profile);
      } catch (error) {
        console.error("Error during Google authentication:", error);
        done(null, false, {
          message: "Error during Google authentication:",
          error,
        });
      }
    }
  )
);

passport.serializeUser(function (user, done) {
  done(null, user);
});

passport.deserializeUser(async function (user, done) {
  done(null, user);
});

module.exports = passport;
