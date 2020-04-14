const jwt = require("jsonwebtoken");
const config = require("../config/config");
const User = require("../api/user/userModel");

async function getUserFromToken(req, res, next) {
  if (req.headers && req.headers.authorization) {
    const authorization = req.headers.authorization.split(" ")[1];
    const decoded = jwt.verify(authorization, config.secrets.jwt);
    const {subject} = decoded;
    try {
      const userDetails = await User.findById({_id: subject});
      const {firstName, lastName, _id, role} = userDetails;
      return {
        fullName: firstName + " " + lastName,
        userId: _id.toString(),
        role,
      };
    } catch (err) {
      next(err);
    }
  } else {
    return undefined;
  }
}

module.exports = getUserFromToken;
