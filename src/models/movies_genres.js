"use strict";
const {
  Model
} = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class MovieGenre extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      MovieGenre.belongsTo(models.Movie, {
        foreignKey: "movie_id",
        as: "movies"
      });

      MovieGenre.belongsTo(models.Genre, {
        foreignKey: "genre_id",
        as: "genres"
      });
    }
  }

  MovieGenre.init({
    id: {
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
    genre_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "genres",
        key: "genre_id"
      }
    }
  }, {
    sequelize,
    modelName: "MovieGenre",
    tableName: "movies_genres",
    timestamps: false
  });

  return MovieGenre;
};