const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const session = require("express-session");
const passport = require("./passport");
const userRoutes = require("./routes/user");

const app = express();

app.use(cookieParser());
app.use(
  cors({
    origin: "https://fun-learn-app.netlify.app",
    //origin: "http://localhost:3000",
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    credentials: true,
  })
);

app.use((req, res, next) => {
  res.setHeader("Cross-Origin-Opener-Policy", "same-origin");
  next();
});

require("dotenv").config();

app.use(express.json());
app.use(
  express.urlencoded({
    extended: true,
  })
);

// Configure express-session
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    name: "session2",
    keys: ["key1", "key2"],
    resave: true,
    saveUninitialized: true,
    cookie: {
      sameSite: "none",
      secure: true,
      maxAge: 24 * 60 * 60 * 1000,
      path: "/",
      httpOnly: true,
    },
  })
);
app.set("trust proxy", 1);

// Initialize Passport and restore authentication state, if any, from the session
app.use(passport.initialize());
app.use(passport.session());

app.use(userRoutes);

app.listen(process.env.PORT || 8080, () => {
  console.log("Server is live on port 8080");
});
