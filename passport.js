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
        // Find the user in the database based on their email
        let user = await User.where({ email: profile.emails[0].value }).fetch({
          require: false,
        });

        if (!user) {
          // If user doesn't exist, create a new user
          user = await new User({
            fullName: profile.displayName,
            email: profile.emails[0].value,
            // Add other fields as needed
          }).save();
        }

        // Log the profile for debugging purposes
        console.log("PROFILE:", profile);

        // Serialize user details for the session
        passport.serializeUser(function (user, done) {
          done(null, user);
        });

        // Send user details to the callback function
        done(null, user);
      } catch (error) {
        console.error("Error during Google authentication:", error);
        done(error, false);
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
