"use strict";
const {
  Model
} = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Actor extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Actor.hasMany(models.MovieCast, {
        foreignKey: "actor_id",
        as: "role"
      });

      Actor.belongsToMany(models.Movie, {
        through: models.MovieCast,
        foreignKey: "actor_id",
        otherKey: "movie_id",
        as: "movies"
      });
    }
  }

  Actor.init({
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER
    },
    first_name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    last_name: {
      type: DataTypes.STRING,
      allowNull: false
    }
  }, {
    sequelize,
    modelName: "Actor",
    tableName: "actors",
    timestamps: false
  });

  return Actor;
};