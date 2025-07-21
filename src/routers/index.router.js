const router = require("express").Router();

router.use("/auth", require("./auth.router"));
router.use("/profile", require("./profile.router"));
// router.use("/admin", require("./admin.router"));
// router.use("/movie", require("./movie.router"));
// router.use("/transaction", require("./transaction.router"));

module.exports = router;