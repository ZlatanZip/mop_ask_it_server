const signToken = require("./auth").signToken;

exports.signin = function (req, res, next) {
  var token = signToken(
    req.user._id,
    req.user.email,
    req.user.role,
    req.user.firstName,
    req.user.lastName
  );
  res.json({
    id: req.user._id,
    email: req.user.email,
    role: req.user.role,
    firstName: req.user.firstName,
    lastName: req.user.lastName,
    userId: req.user._id,
    token: token,
  });
};
