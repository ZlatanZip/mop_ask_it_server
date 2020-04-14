const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate-v2");
const Schema = mongoose.Schema;

var UserModel = require("../user/userModel");

var QuestionSchema = new Schema({
  postedBy: {type: Schema.Types.ObjectId, ref: "User"},
  authorName: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    required: true,
  },
  status: {type: String, default: "ok"},
  votes: {
    positiveVotes: {type: Number, default: 0},
    positiveVotesArray: [],
    negativeVotes: {type: Number, default: 0},
    negativeVotesArray: [],
  },
  answers: [],
  createdOn: {type: Date, default: Date.now},
  isDeleted: {type: Boolean, default: false},
});

QuestionSchema.plugin(mongoosePaginate);

QuestionSchema.methods = {
  updateUserModelNumberOfAnswers: function (userId, method) {
    UserModel.updateNumberOfAnswers(userId, method);
  },
};

module.exports = mongoose.model("Question", QuestionSchema);
