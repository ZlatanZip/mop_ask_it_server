require("dotenv").config();
var config = require("./server/config/config");
var app = require("./server/server");

app.listen(config.port, function () {
  console.log("listening on " + config.url + config.port);
});
