var jwt = require("jsonwebtoken");
var bcrypt = require("bcrypt");
var User = require("../models/user");
const multiparty = require("multiparty");
const cloudinary = require("../utils/cloudinary");

const Activity = require("../models/activity");

//signup

exports.signup = async (req, res) => {
  console.log(req.body);
  try {
    let existingUser = await User.where({ email: req.body.email }).fetchAll();

    if (existingUser.length > 0) {
      return res.status(400).json({
        message: "Email is already in use. Please choose another email.",
      });
    }

    const saltRounds = 8;
    const hashedPassword = bcrypt.hashSync(req.body.password, saltRounds);

    const newUser = new User({
      fullName: req.body.username,
      email: req.body.email,
      password: hashedPassword,
    });

    await newUser.save();

    const accessToken = jwt.sign(
      { id: newUser.id, role: newUser.get("role") },
      process.env.API_SECRET,
      { expiresIn: "1hr" }
    );

    res.cookie("accessToken", accessToken, { httpOnly: true, secure: true });

    const isAdmin = newUser.get("role") === "admin";
    console.log(newUser.toJSON());

    return res.status(200).json({
      message: "User registered successfully",
      user: newUser.toJSON(),
      accessToken: accessToken,
      isAdmin: isAdmin,
    });
  } catch (error) {
    console.error("Error during signup:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// LOGGING USER IN

exports.signin = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.where({ email: email }).fetch({ require: false });

    if (!user) {
      return res.status(404).json({ status: false, message: "User not found" });
    }

    const validPassword = bcrypt.compareSync(password, user.get("password"));

    if (!validPassword) {
      return res
        .status(401)
        .json({ status: false, message: "Invalid Password!" });
    }

    const accessToken = jwt.sign(
      { id: user.id, role: user.get("role") },
      process.env.API_SECRET,
      { expiresIn: "1hr" }
    );

    res.cookie("accessToken", accessToken, { httpOnly: true, secure: true });

    // Check if the user is an admin
    const isAdmin = user.get("role") === "admin";

    res.status(200).json({
      user: {
        id: user.get("id"),
        email: user.get("email"),
        fullName: user.get("fullName"),
        role: user.get("role"),
      },
      message: "Login successful",
      accessToken: accessToken,
      isAdmin: isAdmin,
    });
  } catch (error) {
    console.log("Error signing in:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.addActivity = (req, res) => {
  const form = new multiparty.Form();
  form.parse(req, async (err, fields, files) => {
    try {
      const image = files.image[0].path;
      const { name } = fields;

      const result = await cloudinary.uploader.upload(image, {
        folder: "activities_images",
      });

      if (!result || !result.secure_url) {
        throw new Error("Error uploading image");
      }

      if (req.role !== "admin") {
        return res.status(403).json({
          status: false,
          message: "Permission denied. User is not an admin",
        });
      }

      const existingActivity = await Activity.where({ name: name }).fetchAll();

      if (existingActivity.length > 0) {
        return res.status(400).json({
          status: false,
          message: "Activity already exists",
        });
      }

      const newActivity = new Activity({
        name,
        image: result.secure_url,
      });

      await newActivity.save();

      return res.status(200).json({
        status: true,
        message: "Activity added successfully",
        activity: newActivity.toJSON(),
      });
    } catch (error) {
      console.error("Error adding activity to database:", error);
      res.status(500).json({ message: "Error adding activity" });
    }
  });
};

exports.deleteActivity = async (req, res) => {
  console.log(req.body);
  try {
    if (req.role !== "admin") {
      return res.status(403).json({
        status: false,
        message: "Permission denied. User is not an admin",
      });
    }

    const { name: activityName } = req.body;

    const activity = await Activity.where({ name: activityName }).fetch();

    if (!activity) {
      return res.status(404).json({
        status: false,
        message: "Activity not found",
      });
    }

    await activity.destroy();

    return res.status(200).json({
      status: true,
      message: "Activity deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting activity:", error);
    res.status(500).json({ message: "Error deleting activity" });
  }
};

exports.fetchActivity = async (req, res) => {
  try {
    const activities = await Activity.fetchAll();
    // console.log(activities.toJSON());
    res.status(200).json({
      status: true,
      activities: activities.toJSON(),
    });
  } catch (error) {
    console.error("Error fetching activities:", error);
    res.status(500).json({ message: "Error fetching activities" });
  }
};
