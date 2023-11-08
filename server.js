const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const expressSession = require("express-session");
const passport = require("./passport");
const userRoutes = require("./routes/user");

const app = express();

app.use(cookieParser());
app.use(
  cors({
    //"http://localhost:3000",
    origin: "https://fun-learn-app.netlify.app",
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    credentials: true,
  })
);

app.use((req, res, next) => {
  res.setHeader("Cross-Origin-Opener-Policy", "cross-origin");
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
  expressSession({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
  })
);

// Initialize Passport and restore authentication state, if any, from the session
app.use(passport.initialize());
app.use(passport.session());

app.use(userRoutes);

app.listen(process.env.PORT || 8080, () => {
  console.log("Server is live on port 8080");
});
