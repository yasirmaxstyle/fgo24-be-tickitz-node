const jwt = require("jsonwebtoken");
const TokenBlacklist = require("./tokenBlacklist");

class JWTUtils {
  static generateToken(payload) {
    return jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: "7d"
    });
  }

  static async verifyToken(token) {
    try {
      // Check if token is blacklisted
      const isBlacklisted = await TokenBlacklist.isBlacklisted(token);
      if (isBlacklisted) {
        throw new Error("Token has been blacklisted");
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      return decoded;
    } catch (error) {
      throw error;
    }
  }

  static getTokenExpiration(token) {
    try {
      const decoded = jwt.decode(token);
      return decoded.exp;
    } catch (error) {
      return null;
    }
  }
}

module.exports = JWTUtils;