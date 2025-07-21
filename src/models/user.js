"use strict";
const {
  Model
} = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      User.belongsTo(models.Profile, {
        foreignKey: "profile_id",
        as: "profile"
      });
      User.hasMany(models.Transaction, {
        foreignKey: "created_by",
        as: "transactions"
      });
    }
  }

  User.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true
      }
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false
    },
    role: {
      type: DataTypes.ENUM("user", "admin"),
      defaultValue: "user"
    },
    profile_id: {
      type: DataTypes.INTEGER,
      references: {
        model: "profiles",
        key: "profile_id"
      }
    },
    last_login: {
      type: DataTypes.DATE
    }
  }, {
    sequelize,
    modelName: "User",
    tableName: "users",
    underscored: true,
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at"
  });

  return User;
};