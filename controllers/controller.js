var jwt = require("jsonwebtoken");
var bcrypt = require("bcrypt");
var User = require("../models/user");

//saving a new user

exports.signup = async (req, res) => {
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

    return res.status(200).send({
      message: "User registered successfully",
      user: newUser.toJSON(),
    });
  } catch (error) {
    console.error("Error during signup:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// LOGGING USER IN

exports.signin = async (req, res) => {
  try {
    console.log(req.body);
    let user = await User.where({
      email: req.body.email,
    }).fetch({ require: false });

    if (!user) {
      console.log("USER NOT FOUND");
      return res.status(404).json({
        status: false,
        message: "User not found",
      });
    }

    let validPassword = bcrypt.compareSync(
      req.body.password,
      user.get("password")
    );
    if (!validPassword) {
      console.log("INVALID PASSWORD");
      return res.status(401).json({
        status: false,
        message: "Invalid Password!",
      });
    }

    //signing token with user id
    var token = jwt.sign(
      {
        id: user.id,
      },
      process.env.API_SECRET,
      {
        expiresIn: 86400,
      }
    );

    res.status(200).send({
      user: {
        id: user.get("id"),
        email: user.get("email"),
        fullName: user.get("fullName"),
      },
      message: "Login successfull",
      accessToken: token,
    });
  } catch (error) {
    console.error("Error during sign-in:", error);
    res.status(500).json({
      error: {
        message: "Internal server error",
      },
    });
  }
};
