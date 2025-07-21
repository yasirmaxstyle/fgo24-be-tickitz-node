const JWTUtils = require("../utils/jwt");
const { User, Profile } = require("../models");
const { constants: http } = require("http2");

const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(http.HTTP_STATUS_UNAUTHORIZED).json({
        success: false,
        message: "Access token required"
      });
    }

    const token = authHeader.substring(7);
    const decoded = await JWTUtils.verifyToken(token);

    const user = await User.findByPk(decoded.userId, {
      include: [{ model: Profile, as: "profile" }]
    });

    if (!user) {
      return res.status(http.HTTP_STATUS_UNAUTHORIZED).json({
        success: false,
        message: "User not found"
      });
    }

    req.user = user;
    req.token = token;
    next();
  } catch (error) {
    return res.status(http.HTTP_STATUS_UNAUTHORIZED).json({
      success: false,
      message: "Invalid or expired token"
    });
  }
};

const adminMiddleware = (req, res, next) => {
  if (req.user.role !== "admin") {
    return res.status(http.HTTP_STATUS_FORBIDDEN).json({
      success: false,
      message: "Admin access required"
    });
  }
  next();
};

module.exports = {
  authMiddleware,
  adminMiddleware
};