const jwt = require("jsonwebtoken");
const expressJwt = require("express-jwt");
const config = require("../config/config");
const checkToken = expressJwt({secret: config.secrets.jwt});
const User = require("../api/user/userModel");
const getUserFromToken = require("../helpers/getUserDetails");
const roles = require("../helpers/allowedRoles");

exports.decodeToken = function () {
  return function (req, res, next) {
    checkToken(req, res, next);
  };
};

exports.signToken = function (id, email, role, firstName, lastName) {
  return jwt.sign(
    {
      subject: id,
      email: email,
      role: role,
      firstName: firstName,
      lastName: lastName,
    },
    config.secrets.jwt,
    {expiresIn: config.expireTime}
  );
};

exports.verifyUser = function () {
  return function (req, res, next) {
    const {email, password} = req.body;

    if (!email || !password) {
      res
        .status(400)
        .send({badRequest: "Bad request. Email and/or password missing."});
    }

    User.findOne({email: email}).then(
      (user) => {
        if (!user) {
          res.status(401).send({invalidCredentials: "Invalid credentials"});
        } else {
          if (!user.authenticate(password)) {
            res.status(401).send({invalidCredentials: "Invalid credentials"});
          } else {
            req.user = user;
            next();
          }
        }
      },
      (err) => {
        next(err);
      }
    );
  };
};

exports.authorizeAdmin = async function (req, res, next) {
  const userDetails = await getUserFromToken(req, res, next);
  if (!userDetails) {
    res
      .status(403)
      .send({errorMessage: "You do not have permission to access this."});
  } else {
    const {role} = userDetails;
    if (roles.superRoles.includes(role)) {
      next();
    } else {
      res
        .status(403)
        .send({errorMessage: "You do not have permission to access this."});
    }
  }
};
exports.authorizeMember = async function (req, res, next) {
  const userDetails = await getUserFromToken(req, res, next);
  if (!userDetails) {
    res
      .status(403)
      .send({errorMessage: "You do not have permission to access this."});
  } else {
    const {role} = userDetails;
    if (roles.userRoles.includes(role)) {
      next();
    } else {
      res
        .status(403)
        .send({errorMessage: "You do not have permission to access this."});
    }
  }
};
