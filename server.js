const express = require("express"),
  userRoutes = require("./routes/user"),
  cors = require("cors");
app = express();
const cookieParser = require("cookie-parser");
app.use(cookieParser());

app.use(
  cors({
    //"http://localhost:3000",//
    origin: "https://fun-learn-app.netlify.app",
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    credentials: true,
  })
);

require("dotenv").config();

app.use(express.json());
app.use(
  express.urlencoded({
    extended: true,
  })
);

app.use(userRoutes);

app.listen(process.env.PORT || 8080, () => {
  console.log("Server is live on port 8080");
});
