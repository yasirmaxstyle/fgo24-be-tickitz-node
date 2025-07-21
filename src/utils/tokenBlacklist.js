const redisClient = require("../db/redis");

class TokenBlacklist {
  static async addToBlacklist(token, expiresIn) {
    try {
      await redisClient.setEx(`blacklist_${token}`, expiresIn, "blacklisted");
      return true;
    } catch (error) {
      console.error("Error adding token to blacklist:", error);
      return false;
    }
  }

  static async isBlacklisted(token) {
    try {
      const result = await redisClient.get(`blacklist_${token}`);
      return result === "blacklisted";
    } catch (error) {
      console.error("Error checking blacklist:", error);
      return false;
    }
  }

  static async removeFromBlacklist(token) {
    try {
      await redisClient.del(`blacklist_${token}`);
      return true;
    } catch (error) {
      console.error("Error removing token from blacklist:", error);
      return false;
    }
  }
}

module.exports = TokenBlacklist;