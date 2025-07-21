const argon2 = require("argon2");
const crypto = require("crypto");
const { User, Profile } = require("../models");
const JWTUtils = require("../utils/jwt");
const TokenBlacklist = require("../utils/tokenBlacklist");
const EmailService = require("../utils/emailService");
const { constants: http } = require("http2");

class AuthController {
  static async register(req, res) {
    try {
      const { email, password, firstName, lastName, phoneNumber } = req.body;

      const existingUser = await User.findOne({ where: { email } });
      if (existingUser) {
        return res.status(http.HTTP_STATUS_BAD_REQUEST).json({
          success: false,
          message: "User with this email already exists"
        });
      }

      const hashedPassword = await argon2.hash(password);

      const profile = await Profile.create({
        first_name: firstName,
        last_name: lastName,
        phone_number: phoneNumber || null
      });

      const user = await User.create({
        email,
        password: hashedPassword,
        profile_id: profile.profile_id,
        role: "user"
      });

      const token = JWTUtils.generateToken({
        userId: user.user_id,
        email: user.email,
        role: user.role
      });

      const userResponse = {
        user_id: user.user_id,
        email: user.email,
        role: user.role,
        profile: {
          profile_id: profile.profile_id,
          first_name: profile.first_name,
          last_name: profile.last_name,
          phone_number: profile.phone_number,
          avatar: profile.avatar
        }
      };

      res.status(http.HTTP_STATUS_CREATED).json({
        success: true,
        message: "User registered successfully",
        data: {
          user: userResponse,
          token
        }
      });
    } catch (error) {
      console.error("Registration error:", error);
      res.status(http.HTTP_STATUS_INTERNAL_SERVER_ERROR).json({
        success: false,
        message: "Internal server error"
      });
    }
  }

  static async login(req, res) {
    try {
      const { email, password } = req.body;

      const user = await User.findOne({
        where: { email },
        include: [{ model: Profile, as: "profile" }]
      });

      if (!user) {
        return res.status(http.HTTP_STATUS_UNAUTHORIZED).json({
          success: false,
          message: "Invalid credentials"
        });
      }

      const isValidPassword = await argon2.verify(user.password, password);
      if (!isValidPassword) {
        return res.status(http.HTTP_STATUS_UNAUTHORIZED).json({
          success: false,
          message: "Invalid credentials"
        });
      }

      await user.update({ last_login: new Date() });

      const token = JWTUtils.generateToken({
        userId: user.user_id,
        email: user.email,
        role: user.role
      });

      const userResponse = {
        user_id: user.user_id,
        email: user.email,
        role: user.role,
        last_login: user.last_login,
        profile: user.profile ? {
          profile_id: user.profile.profile_id,
          first_name: user.profile.first_name,
          last_name: user.profile.last_name,
          phone_number: user.profile.phone_number,
          avatar: user.profile.avatar
        } : null
      };

      res.json({
        success: true,
        message: "Login successful",
        data: {
          user: userResponse,
          token
        }
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(http.HTTP_STATUS_INTERNAL_SERVER_ERROR).json({
        success: false,
        message: "Internal server error"
      });
    }
  }

  static async logout(req, res) {
    try {
      const token = req.token;
      const tokenExpiration = JWTUtils.getTokenExpiration(token);

      if (tokenExpiration) {
        const now = Math.floor(Date.now() / 1000);
        const ttl = tokenExpiration - now;

        if (ttl > 0) {
          await TokenBlacklist.addToBlacklist(token, ttl);
        }
      }

      res.json({
        success: true,
        message: "Logged out successfully"
      });
    } catch (error) {
      console.error("Logout error:", error);
      res.status(http.HTTP_STATUS_INTERNAL_SERVER_ERROR).json({
        success: false,
        message: "Internal server error"
      });
    }
  }

  static async forgotPassword(req, res) {
    try {
      const { email } = req.body;

      const user = await User.findOne({
        where: { email },
        include: [{ model: Profile, as: "profile" }]
      });

      if (!user) {
        return res.json({
          success: true,
          message: "If the email exists, a password reset link has been sent"
        });
      }

      const resetToken = crypto.randomBytes(32).toString("hex");
      const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour

      await user.update({
        reset_password_token: resetToken,
        reset_password_expires: resetTokenExpiry
      });

      const firstName = user.profile ? user.profile.first_name : "User";
      const emailSent = await EmailService.sendResetPasswordEmail(
        user.email,
        resetToken,
        firstName
      );

      if (!emailSent) {
        return res.status(http.HTTP_STATUS_INTERNAL_SERVER_ERROR).json({
          success: false,
          message: "Failed to send reset email"
        });
      }

      res.json({
        success: true,
        message: "Password reset link has been sent to your email"
      });
    } catch (error) {
      console.error("Forgot password error:", error);
      res.status(http.HTTP_STATUS_INTERNAL_SERVER_ERROR).json({
        success: false,
        message: "Internal server error"
      });
    }
  }

  static async resetPassword(req, res) {
    try {
      const { token, password } = req.body;

      const user = await User.findOne({
        where: {
          reset_password_token: token,
          reset_password_expires: {
            [require("sequelize").Op.gt]: new Date()
          }
        }
      });

      if (!user) {
        return res.status(http.HTTP_STATUS_BAD_REQUEST).json({
          success: false,
          message: "Invalid or expired reset token"
        });
      }

      const hashedPassword = await argon2.hash(password);

      await user.update({
        password: hashedPassword,
        reset_password_token: null,
        reset_password_expires: null
      });

      res.json({
        success: true,
        message: "Password has been reset successfully"
      });
    } catch (error) {
      console.error("Reset password error:", error);
      res.status(http.HTTP_STATUS_INTERNAL_SERVER_ERROR).json({
        success: false,
        message: "Internal server error"
      });
    }
  }

  static async getProfile(req, res) {
    try {
      const userResponse = {
        user_id: req.user.user_id,
        email: req.user.email,
        role: req.user.role,
        last_login: req.user.last_login,
        profile: req.user.profile ? {
          profile_id: req.user.profile.profile_id,
          first_name: req.user.profile.first_name,
          last_name: req.user.profile.last_name,
          phone_number: req.user.profile.phone_number,
          avatar: req.user.profile.avatar
        } : null
      };

      res.json({
        success: true,
        data: { user: userResponse }
      });
    } catch (error) {
      console.error("Get profile error:", error);
      res.status(http.HTTP_STATUS_INTERNAL_SERVER_ERROR).json({
        success: false,
        message: "Internal server error"
      });
    }
  }
}

module.exports = AuthController;