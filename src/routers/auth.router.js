const express = require("express");
const router = express.Router();
const AuthController = require("../controllers/auth.controller");
const { authMiddleware } = require("../middlewares/auth.middleware");
const {
  registerValidation,
  loginValidation,
  forgotPasswordValidation,
  resetPasswordValidation,
  handleValidationErrors
} = require("../middlewares/validations/authValidation");

// Public routes
router.post("/register", registerValidation, handleValidationErrors, AuthController.register);
router.post("/login", loginValidation, handleValidationErrors, AuthController.login);
router.post("/forgot-password", forgotPasswordValidation, handleValidationErrors, AuthController.forgotPassword);
router.post("/reset-password", resetPasswordValidation, handleValidationErrors, AuthController.resetPassword);

// Protected routes
router.post("/logout", authMiddleware, AuthController.logout);

module.exports = router;