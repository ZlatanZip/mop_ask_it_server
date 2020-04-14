const express = require("express");
const mongoose = require("mongoose");
const api = require("./api/api");
const config = require("./config/config");
const auth = require("./auth/routes");

const app = express();

mongoose
  .connect(config.db.url, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
  })
  .then((res) => {
    console.log("CONNECTED TO DATABASE");
  })
  .catch((err) => {
    console.log(err);
  });

//all of the common middleware in a seperate file
require("./middleware/appMiddleware")(app);

app.use("/api", api);
app.use("/auth", auth);

//global error handling
app.use(function (err, req, res, next) {
  if (err.name == "UnauthorizedError") {
    res.status(401).send("Invalid/Expired token");
    return;
  }

  console.log(err.stack);
  res.status(500).send("Server error. Something went wrong");
});

module.exports = app;
