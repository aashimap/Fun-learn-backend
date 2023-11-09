const express = require("express");
const router = express.Router();

const verifyToken = require("../middlewares/authJWT");
const {
  signup,
  signin,
  addActivity,
  fetchActivity,
  deleteActivity,
} = require("../controllers/controller.js");
const cookieParser = require("cookie-parser");
const passport = require("passport");
const User = require("../models/user");
var jwt = require("jsonwebtoken");

//const authAdmin = require("../middlewares/authAdmin");
//const multer = require("multer");
//const storage = multer.memoryStorage();
//const upload = multer({ storage: storage });

router.post("/signup", signup, cookieParser(), function (req, res) {});

router.post(
  "/signin",
  signin,
  passport.authenticate("local"),
  cookieParser(),
  function (req, res) {}
);

router.post("/activities/add", verifyToken, addActivity);

router.delete("/activities/delete", verifyToken, deleteActivity);

router.get("/activities/fetch", verifyToken, fetchActivity);

router.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

router.get(
  "/auth/google/callback",
  passport.authenticate("google", {
    //failureRedirect: "http://localhost:3000",
    failureRedirect: "https://fun-learn-app.netlify.app",
  }),
  (req, res) => {
    const user = req.user;
    console.log("GOOGLE USER:", user);
    const token = jwt.sign({ user: { user } }, process.env.REDIRECT_SECRET, {
      expiresIn: "1h",
    });
    //res.redirect(`http://localhost:3000/redirect?token=${token}`);
    res.redirect(`https://fun-learn-app.netlify.app/redirect?token=${token}`);
  }
);

router.get("/googleUser", (req, res) => {
  const token =
    req.headers.authorization && req.headers.authorization.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "google user token not provided" });
  }

  try {
    const decodedToken = jwt.verify(token, process.env.REDIRECT_SECRET);

    const user = decodedToken.user.user;
    console.log("GOOGLE:", user);

    res.json({ user });
  } catch (error) {
    console.error("Error decoding token for googleUser:", error);
    return res.status(401).json({ message: "Invalid googleUser token" });
  }
});

module.exports = router;
