const fs = require("fs");
const path = require("path");
const { Profile } = require("../models");
const { constants: http } = require("http2");

class ProfileController {
  static async updateProfile(req, res) {
    try {
      const { firstName, lastName, phoneNumber } = req.body;
      const avatar = req.file;

      if (!req.user.profile) {
        return res.status(http.HTTP_STATUS_NOT_FOUND).json({
          success: false,
          message: "Profile not found"
        });
      }

      const updateData = {};

      if (firstName) updateData.first_name = firstName;
      if (lastName) updateData.last_name = lastName;
      if (phoneNumber !== undefined) updateData.phone_number = phoneNumber;

      if (avatar) {
        const oldProfile = await Profile.findByPk(req.user.profile.profile_id);
        if (oldProfile && oldProfile.avatar) {
          const oldAvatarPath = path.join(__dirname, "..", "uploads/avatars", oldProfile.avatar);
          if (fs.existsSync(oldAvatarPath)) {
            fs.unlinkSync(oldAvatarPath);
          }
        }
        updateData.avatar = avatar.filename;
      }

      await Profile.update(updateData, {
        where: { profile_id: req.user.profile.profile_id }
      });

      const updatedProfile = await Profile.findByPk(req.user.profile.profile_id);

      res.json({
        success: true,
        message: "Profile updated successfully",
        data: {
          profile: {
            profile_id: updatedProfile.profile_id,
            first_name: updatedProfile.first_name,
            last_name: updatedProfile.last_name,
            phone_number: updatedProfile.phone_number,
            avatar: updatedProfile.avatar
          }
        }
      });
    } catch (error) {
      if (req.file) {
        const filePath = path.join(__dirname, "..", "uploads/avatars", req.file.filename);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      }

      console.error("Update profile error:", error);
      res.status(http.HTTP_STATUS_INTERNAL_SERVER_ERROR).json({
        success: false,
        message: "Internal server error"
      });
    }
  }

  static async deleteProfile(req, res) {
    try {
      if (!req.user.profile) {
        return res.status(http.HTTP_STATUS_NOT_FOUND).json({
          success: false,
          message: "Profile not found"
        });
      }

      const profile = await Profile.findByPk(req.user.profile.profile_id);

      if (profile && profile.avatar) {
        const avatarPath = path.join(__dirname, "..", "uploads/avatars", profile.avatar);
        if (fs.existsSync(avatarPath)) {
          fs.unlinkSync(avatarPath);
        }
      }

      await Profile.destroy({
        where: { profile_id: req.user.profile.profile_id }
      });

      res.json({
        success: true,
        message: "Profile deleted successfully"
      });
    } catch (error) {
      console.error("Delete profile error:", error);
      res.status(http.HTTP_STATUS_INTERNAL_SERVER_ERROR).json({
        success: false,
        message: "Internal server error"
      });
    }
  }

  static async getProfile(req, res) {
    try {
      if (!req.user.profile) {
        return res.status(http.HTTP_STATUS_NOT_FOUND).json({
          success: false,
          message: "Profile not found"
        });
      }

      res.json({
        success: true,
        data: {
          profile: {
            profile_id: req.user.profile.profile_id,
            first_name: req.user.profile.first_name,
            last_name: req.user.profile.last_name,
            phone_number: req.user.profile.phone_number,
            avatar: req.user.profile.avatar,
            created_at: req.user.profile.created_at,
            updated_at: req.user.profile.updated_at
          }
        }
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

module.exports = ProfileController;