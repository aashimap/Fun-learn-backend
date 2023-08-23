var jwt = require("jsonwebtoken");
var bcrypt = require("bcrypt");
var User = require("../models/user");

exports.signup = async (req, res) => {
  try {
    let saltRounds = 8;
    let hashedPassword = bcrypt.hashSync(req.body.password, saltRounds);
    await new User({
      fullName: req.body.fullName,
      email: req.body.email,
      role: req.body.role,
      password: hashedPassword,
    })
      .save()
      .then((user, err) => {
        if (err) {
          return res.status(400).send({
            message: err,
          });
        } else {
          return res.status(200).send({
            message: "User Registered successfully",
          });
        }
      });
  } catch (err) {
    res.json(err);
  }
};

exports.signin = async (req, res) => {
  let user = await User.where({
    email: req.body.email,
  }).fetch();
  console.log("user :", user);

  if (!user) return res.status(400).send({ message: "User not found" });
  //comparing passwords
  var passwordIsValid = bcrypt.compareSync(
    req.body.password,
    user.get("password")
  );
  // checking if password was valid and send response accordingly
  if (!passwordIsValid) {
    return res.status(401).send({
      accessToken: null,
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

  //responding to client request with user profile success message and  access token .
  res.status(200).send({
    user: {
      id: user.get("id"),
      email: user.get("email"),
      fullName: user.get("fullName"),
    },
    message: "Login successfull",
    accessToken: token,
  });
};
