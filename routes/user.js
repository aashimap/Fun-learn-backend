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

//const authAdmin = require("../middlewares/authAdmin");
//const multer = require("multer");
//const storage = multer.memoryStorage();
//const upload = multer({ storage: storage });

router.post("/signup", signup, cookieParser(), function (req, res) {});

router.post("/signin", signin, cookieParser(), function (req, res) {});

router.post("/activities/add", verifyToken, addActivity);

router.delete("/activities/delete/:id", verifyToken, deleteActivity);

router.get("/activities/fetch", verifyToken, fetchActivity);

module.exports = router;
