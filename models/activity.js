const bookshelf = require("../db");

const Activity = bookshelf.model("Activity", {
  tableName: "activities",

  name: {
    type: "string",
    required: true,
    unique: true,
  },

  image: {
    type: "string",
    required: true,
  },

  created: {
    type: "date",
    defaultsTo: new Date(),
  },
});

module.exports = Activity;
