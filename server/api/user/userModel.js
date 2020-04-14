var mongoose = require("mongoose");
const {uuid} = require("uuidv4");
var crypto = require("crypto");

var Schema = mongoose.Schema;

var UserSchema = new Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },
  firstName: {
    type: String,
    required: true,
  },
  lastName: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  numberOfAnswers: {type: Number, default: 0},
  salt: {
    type: String,
    unique: true,
  },
  role: {type: String, default: "Member"},
  createdOn: {type: Date, default: Date.now},
});

UserSchema.pre("save", function (next) {
  this.salt = uuid();
  const hash = crypto.createHash("sha256");
  hash.update(this.salt + this.password);
  this.password = hash.digest("hex");
  next();
});

UserSchema.methods = {
  authenticate: function (plainPassword) {
    const hash = crypto.createHash("sha256");
    hash.update(this.salt + plainPassword);
    return hash.digest("hex") === this.password;
  },
  changePassword: async function (plainPassword) {
    const hash = crypto.createHash("sha256");
    hash.update(this.salt + plainPassword);
    await this.constructor
      .update({_id: this._id}, {password: hash.digest("hex")})
      .exec();
  },
};

UserSchema.statics = {
  updateNumberOfAnswers: async function (_id, method) {
    const user = await this.findById({_id});
    let {numberOfAnswers} = user;
    method === "increment" ? numberOfAnswers++ : numberOfAnswers--;
    user.set({numberOfAnswers: numberOfAnswers});
    await user.save();
  },
};

module.exports = mongoose.model("user", UserSchema);
