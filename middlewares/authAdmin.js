const User = require("../models/user");

const authAdmin = async (req, res, next) => {
  console.log(req.id);
  try {
    const user = await User.where({ id: req.id }).fetch({
      require: false,
    });
    console.log(user);

    if (!user && user.get("role") !== "admin") {
      return res.status(403).json({
        status: false,
        message: "User is not an admin",
      });
    }

    next();
  } catch (error) {
    console.error("Error checking admin role:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = authAdmin;
