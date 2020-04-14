const router = require("express").Router();
const controller = require("./questionController");
const auth = require("../../auth/auth");

router
  .route("/")
  .get(controller.getAllQuestions)
  .post(
    auth.decodeToken(),
    controller.validateQuestionModel,
    controller.addQuestion
  );
router.route("/:id").get(controller.getSingleQuestion);

router
  .route("/mostpopular")
  .all(auth.decodeToken())
  .get(controller.mostPopularQuestions);

router
  .route("/:id")
  .all(auth.decodeToken())
  .get(controller.getSingleQuestion)
  .patch(controller.updateQuestion)
  .delete(controller.removeQuestion);

router
  .route("/review/:id")
  .all(auth.decodeToken())
  .patch(auth.authorizeMember, controller.reviewAQuestion);

router
  .route("/answer/:id")
  .all(auth.decodeToken())
  .put(
    auth.authorizeMember,
    controller.validateAnswersModel,
    controller.answerAQuestion
  )
  .patch(auth.authorizeMember, controller.updateAnswer)
  .delete(auth.authorizeMember, controller.deleteAnswer);

/* router
  .route("/delete/:id")
  .all(auth.decodeToken())
  .delete(auth.authorizeMember, controller.removeQuestion); */

router
  .route("/invalidate/:id")
  .all(auth.decodeToken())
  .delete(auth.authorizeAdmin, controller.invalidateQuestion);

router
  .route("/userQuestions/:postedBy")
  .all(auth.decodeToken())
  .get(controller.getUserQuestions);

router
  .route("/:postedBy/:id")
  .all(auth.decodeToken())
  .get(controller.getSingleUserQuestion);

module.exports = router;
