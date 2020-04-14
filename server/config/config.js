const _ = require("lodash");

const config = {
  url: process.env.URL,
  dev: "development",

  port: process.env.port,

  expireTime: 2 * 24 * 60 * 60, //2 days in seconds, expireInMinutes is deprecated
  secrets: {
    jwt: process.env.JWT,
  },
  excludePropertiesUser: "-password -salt -__v",
  excludePropertiesQuestion: " -isDeleted",
};

process.env.NODE_ENV = process.env.NODE_ENV || config.dev;
config.env = process.env.NODE_ENV;

var envConfig;

try {
  envConfig = require("./" + config.env);
  envConfig = envConfig || {};
} catch (e) {
  envConfig = {};
}

module.exports = _.merge(config, envConfig);
