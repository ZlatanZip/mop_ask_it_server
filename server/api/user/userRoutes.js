const router = require("express").Router();
const controller = require("./userController");
const auth = require("../../auth/auth");
const authController = require("../../auth/controller");

router.param("id", controller.checkForIdParamPresence);

router
  .route("/")
  .get(controller.get)
  .post(controller.validatePostModel, controller.post, authController.signin);

router
  .route("/answers")
  .get(/* auth.decodeToken(), */ controller.getUsersWithMostAnswers);

router
  .route("/:id")
  .all(auth.decodeToken())
  .get(controller.getOne)
  .patch(controller.updateUserDetails);

router
  .route("/:id/changePassword")
  .post(auth.decodeToken(), controller.changePassword);

module.exports = router;
