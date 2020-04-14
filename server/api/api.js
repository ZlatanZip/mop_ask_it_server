const router = require("express").Router();

router.use("/users", require("./user/userRoutes"));
router.use("/questions", require("./question/questionRoutes"));

module.exports = router;
