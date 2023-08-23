const knex = require("knex")({
  client: "mysql2",
  connection: {
    host: "localhost",
    user: "root",
    password: "Password@1234",
    database: "training",
    charset: "utf8",
  },
});

const bookshelf = require("bookshelf")(knex);

module.exports = bookshelf;
