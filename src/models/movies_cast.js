"use strict";
const {
  Model
} = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class MovieCast extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      MovieCast.belongsTo(models.Movie, {
        foreignKey: "movie_id",
        as: "movie"
      });

      MovieCast.belongsTo(models.Actor, {
        foreignKey: "actor_id",
        as: "actor"
      });
    }
  }

  MovieCast.init({
    movie_cast_id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER
    },
    movie_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "movies",
        key: "movie_id"
      }
    },
    actor_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "actors",
        key: "actor_id"
      }
    },
    role: {
      type: DataTypes.STRING,
      defaultValue: "Actor"
    }
  }, {
    sequelize,
    modelName: "MovieCast",
    tableName: "movies_cast",
    timestamps: false
  });

  return MovieCast;
};