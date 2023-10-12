const express = require("express"),
  router = express.Router(),
  verifyToken = require("../middlewares/authJWT"),
  { signup, signin } = require("../controllers/controller.js");

router.post("/signup", signup, function (req, res) {});

router.post("/signin", signin, function (req, res) {});

router.get("/hiddencontent", verifyToken, function (req, res) {
  if (!req.user) {
    res.status(403).send({
      message: "Invalid JWT token",
    });
  } else if (req.user.get("role") === "normal") {
    res.status(200).send({
      message: "Congratulations! but there is no hidden content",
    });
  } else {
    res.status(403).send({
      message: "Unauthorized access",
    });
  }
});

module.exports = router;
