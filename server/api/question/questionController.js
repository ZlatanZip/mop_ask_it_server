const config = require("../../config/config");
const Question = require("./questionModel");
const getUserDetailsFromToken = require("../../helpers/getUserDetails");
const uuidv4 = require("uuid/v4");

exports.getAllQuestions = async function (req, res, next) {
  const pagination = req.query.pagination ? parseInt(req.query.pagination) : 20;
  const page = req.query.page ? parseInt(req.query.page) : 1;

  try {
    const questionsCollection = await Question.find();
    /*    .skip((page - 1) * pagination)
      .limit(pagination); */
    res.json(questionsCollection);
  } catch (err) {
    res.status(500);
    next(err);
  }
};

exports.getUserQuestions = async function (req, res, next) {
  const {postedBy} = req.params;
  try {
    const userQuestions = await Question.find({postedBy}).select(
      config.excludePropertiesQuestion
    );
    res.json(userQuestions);
  } catch (err) {
    next(err);
  }
};

exports.getSingleUserQuestion = async function (req, res, next) {
  const {postedBy, id} = req.params;
  if (!postedBy || !id) {
    return res.status(400).send("Missing one or more parameters.");
  }
  try {
    const question = await Question.find({
      postedBy,
      _id: id,
    });
    res.json(question);
  } catch (err) {
    next(err);
  }
};

exports.getSingleQuestion = async function (req, res, next) {
  const {id} = req.params;
  if (!id) {
    return res.status(400).send("Missing one or more parameters.");
  }
  try {
    const question = await Question.find({
      _id: req.params.id,
    });
    res.json(question);
  } catch (err) {
    next(err);
  }
};

exports.addQuestion = async function (req, res, next) {
  const author = await getUserDetailsFromToken(req, res, next);
  const newQuestion = new Question();
  const {description, category} = req.body;
  newQuestion.description = description;
  newQuestion.category = category;
  newQuestion.authorName = author.fullName;
  newQuestion.postedBy = author.userId;
  try {
    const question = await newQuestion.save();
    res.json(question);
  } catch (err) {
    next(err);
  }
};

exports.answerAQuestion = async function (req, res, next) {
  const {answer} = req.body;
  const {id} = req.params;
  const user = await getUserDetailsFromToken(req, res, next);
  const {userId} = user;
  try {
    const question = await Question.findById({_id: id});
    const {answers} = question;
    answers.push({
      answer,
      id: uuidv4(),
      userId,
    });
    question.set(answers);
    const updatedQuestion = await question.save();
    const questionInstance = new Question();
    await questionInstance.updateUserModelNumberOfAnswers(userId, "increment");
    res.json(updatedQuestion);
  } catch (err) {
    next(err);
  }
};

exports.updateAnswer = async function (req, res, next) {
  const {answer, answerId} = req.body;
  const {id} = req.params;
  try {
    const question = await Question.findById({_id: id});
    if (!answer) {
      res.status(400).send("Answer can not be empty");
    } else {
      const {answers} = question;
      const updatedAnswers = answers.map((ans) => {
        if (ans.id === answerId) {
          ans.answer = answer;
          return ans;
        }
        return ans;
      });
      res.json(updatedAnswers);
    }
  } catch (err) {
    next(err);
  }
};

exports.deleteAnswer = async function (req, res, next) {
  const {answerId} = req.body;
  const {id} = req.params;
  const question = await Question.findById({_id: id});
  const {answers} = question;
  const filteredArr = answers.filter((ans) => ans.id !== answerId);
  res.json(filteredArr);
};

exports.reviewAQuestion = async function (req, res, next) {
  try {
    const user = await getUserDetailsFromToken(req, res, next);
    const {userId} = user;
    const {id} = req.params;
    const {like, unlike, removeLike, removeUnlike} = req.body;

    const getQuestion = await Question.findById({_id: id});
    const {votes} = getQuestion;
    if (like) {
      if (!votes.positiveVotesArray.includes(userId)) {
        votes.positiveVotesArray.push(userId);
        votes.positiveVotes++;
        if (votes.negativeVotesArray.includes(userId)) {
          const filteredArr = votes.negativeVotesArray.filter(
            (id) => id !== userId
          );
          votes.negativeVotesArray = filteredArr;
          votes.negativeVotes--;
        }
      }
    }
    if (unlike) {
      if (!votes.negativeVotesArray.includes(userId)) {
        votes.negativeVotesArray.push(userId);
        votes.negativeVotes++;
        if (votes.positiveVotesArray.includes(userId)) {
          const filteredArr = votes.positiveVotesArray.filter(
            (id) => id !== userId
          );
          votes.positiveVotesArray = filteredArr;
          votes.positiveVotes--;
        }
      }
    }
    if (removeLike) {
      if (votes.positiveVotesArray.includes(userId)) {
        const filteredArr = votes.positiveVotesArray.filter(
          (id) => id !== userId
        );
        votes.positiveVotesArray = filteredArr;
        votes.positiveVotes--;
      }
    }
    if (removeUnlike) {
      if (votes.negativeVotesArray.includes(userId)) {
        const filteredArr = votes.negativeVotesArray.filter(
          (id) => id !== userId
        );
        votes.negativeVotesArray = filteredArr;
        votes.negativeVotes--;
      }
    }
    getQuestion.set({
      votes,
    });
    const updatedQuestion = await getQuestion.save();
    res.json(updatedQuestion);
  } catch (err) {
    next(err);
  }
};

exports.updateQuestion = async function (req, res, next) {
  const {id} = req.params;
  try {
    const question = await Question.findById({_id: id});
    const {
      votes,
      status,
      votedBy,
      answers,
      isDeleted,
      _id,
      createdOn,
      authorName,
      postedBy,
      ...fieldsToUpdate
    } = req.body;

    question.set(fieldsToUpdate);
    const updatedQuestion = await question.save();

    res.json(updatedQuestion);
  } catch (err) {
    next(err);
  }
};

exports.removeQuestion = async function (req, res, next) {
  const {id} = req.params;
  try {
    const question = await Question.findById({_id: id});
    question.set({isDeleted: true});
    const deletedQuestion = await question.save();
    res.json(deletedQuestion);
  } catch (err) {
    next(err);
  }
};

exports.invalidateQuestion = async function (req, res, next) {
  const {id} = req.params;
  try {
    const question = await Question.findById({_id: id});
    question.set({isDeleted: true, status: "invalidated"});
    const updatedQuestion = await question.save();
    res.json(updatedQuestion);
  } catch (err) {
    next(err);
  }
};

exports.mostPopularQuestions = async function (req, res, next) {
  try {
    const mostPopularQuestions = await Question.find({})
      .sort({votes: -1})
      .limit(10);
    res.json(mostPopularQuestions);
  } catch (err) {
    next(err);
  }
};

exports.validateQuestionModel = async function (req, res, next) {
  const {description, category} = req.body;
  if (!description || !category) {
    return res
      .status(400)
      .send("Some of the required model properties are missing");
  }
  next();
};

exports.validateAnswersModel = function (req, res, next) {
  const {answer} = req.body;
  if (!answer) {
    return res
      .status(400)
      .send("Some of the required model properties are missing");
  }
  next();
};
