const User = require("./userModel");
const config = require("../../config/config");
const compare = require("../../helpers/compare");
const signToken = require("../../auth/auth").signToken;

exports.checkForIdParamPresence = function (req, res, next, id) {
  if (!id) {
    return res.status(400).send("Id not provided");
  } else next();
};

exports.get = function (req, res, next) {
  const pagination = 5;
  User.find()
    .limit(pagination)
    .select(config.excludePropertiesUser)
    .then(
      (users) => {
        users.sort(function (a, b) {
          return a.numberOfAnswers - b.numberOfAnswers;
        });
        users.reverse();
        res.json(users);
      },
      (err) => {
        next(err);
      }
    );
};

exports.getOne = async function (req, res, next) {
  const {id} = req.params;
  try {
    const user = await User.findById({_id: id});
    if (!user) {
      res.status(404).send("No resource found with given ID.");
    } else {
      const {firstName, lastName, email, role, _id} = user._doc;
      res.json({
        userId: _id,
        firstName,
        lastName,
        email,
        role,
      });
    }
  } catch (err) {
    res.status(500).send("Error");
    next(err);
  }
};

exports.post = async function (req, res, next) {
  const newUser = new User(req.body.data);
  try {
    newUser.save((err, user) => {
      if (err) {
        res
          .status(422)
          .send({errorMsg: "Unprocessable entity. Unique key violation"});
        return next(err);
      } else {
        req.user = user;
        next();
      }
    });
  } catch (err) {
    next(err);
  }
};

exports.updateUserDetails = async function (req, res, next) {
  const {id} = req.params;
  const user = await User.findById({_id: id});
  if (!user) {
    res.status(404).send("No resource found with given ID.");
  }

  try {
    // Fields that we can update are email, firstName and lastName
    // We will sanitize req body and remove role, password,userId and prevent update.
    const {role, password, userId, ...fieldsToUpdate} = req.body;
    user.set(fieldsToUpdate);
    const updatedUser = await user.save();
    {
      const {firstName, lastName, _id, email, role} = updatedUser;
      return res.json({
        firstName,
        lastName,
        userId: _id,
        email,
        role,
      });
    }
  } catch (err) {
    next(err);
  }
};

exports.getLoggedUserInfo = function (req, res, next) {
  var userId = req.user.subject;
  User.findById(userId).then(
    (user) => {
      res.json(user.toDTO());
    },
    (err) => {
      next(err);
    }
  );
};

exports.changePassword = async function (req, res, next) {
  const {password, newPassword} = req.body;
  const {id} = req.params;
  if (!req.body.password || !req.body.newPassword)
    return res.status(400).send({
      errorMsg:
        "Password was not changed! Some of the required fields are empty",
    });
  try {
    const user = await User.findById({_id: id});
    if (!user) {
      return res.status(404).send({
        errorMsg:
          "Password was not changed! User does not exist with given ID.",
      });
    }
    const checkUserPassword = user.authenticate(password);
    if (!checkUserPassword) {
      return res
        .status(401)
        .send({errorMsg: "Password was not changed! Invalid credentials."});
    }
    user.changePassword(newPassword);
    return res
      .status(200)
      .send({successMessage: "Password successfully changed."});
  } catch (err) {
    res.status(500, {});
    next(err);
  }
};

exports.getUsersWithMostAnswers = async function (req, res, next) {
  const users = await User.find({});
  const filteredUsers = [];
  users.map((user) => {
    const {email, role, firstName, lastName, _id, numberOfAnswers} = user;
    filteredUsers.push({
      email,
      firstName,
      lastName,
      role,
      userId: _id,
      numberOfAnswers,
    });
  });
  const pagination = 5;
  const sortedUsers = filteredUsers.slice(0, 5).sort(compare);
  res.json(sortedUsers);
};

exports.validatePostModel = function (req, res, next) {
  const {firstName, lastName, email, password} = req.body.data;
  if (!firstName || !lastName || !email || !password)
    return res
      .status(400)
      .send("Some of the required model properties are missing");
  next();
};
