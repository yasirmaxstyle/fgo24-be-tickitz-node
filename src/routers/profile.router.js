const express = require("express");
const router = express.Router();
const ProfileController = require("../controllers/profile.controller");
const { authMiddleware } = require("../middlewares/auth.middleware");
const upload = require("../middlewares/upload");
const { updateProfileValidation, handleValidationErrors } = require("../middlewares/validations/profileValidation");

// All profile routes are protected
router.get("/", authMiddleware, ProfileController.getProfile);
router.patch("/",
  authMiddleware,
  upload.single("avatar"),
  updateProfileValidation,
  handleValidationErrors,
  ProfileController.updateProfile
);
router.delete("/", authMiddleware, ProfileController.deleteProfile);

module.exports = router;