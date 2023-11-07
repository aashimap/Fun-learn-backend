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
    failureRedirect:
      "https://fun-learn-app.netlify.app" /* "http://localhost:3000"*/,
  }),
  async (req, res) => {
    try {
      const user = req.user;
      console.log("GOOGLE USER:", user.toJSON());
      const accessToken = jwt.sign(
        { id: user.id, role: user.get("role") },
        process.env.API_SECRET,
        { expiresIn: "1h" }
      );
      const isAdmin = user.get("role") === "admin";
      const jsonResponse = {
        user: {
          id: user.get("id"),
          email: user.get("email"),
          fullName: user.get("fullName"),
          role: user.get("role"),
        },
        message: "Login successful",
        accessToken: accessToken,
        isAdmin: isAdmin,
      };

      res.redirect(
        `https://fun-learn-app.netlify.app/redirect?data=${JSON.stringify(
          jsonResponse
        )}`
      );
    } catch (error) {
      console.error("Error during Google authentication:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  }
);

module.exports = router;
