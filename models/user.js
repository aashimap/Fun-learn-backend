const bookshelf = require("../db");

const User = bookshelf.model("User", {
  tableName: "users",
  fullName: {
    type: "string",
    required: true,
  },

  email: {
    type: "string",
    unique: true,
    lowercase: true,
    trim: true,
    required: true,
    validations: {
      isEmail: true,
    },
  },

  role: {
    type: "string",
    enum: ["normal", "admin"],
    required: true,
  },

  password: {
    type: "string",
    required: false,
  },

  created: {
    type: "date",
    defaultsTo: new Date(),
  },
});

module.exports = User;
