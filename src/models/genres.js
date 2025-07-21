"use strict";
const {
  Model
} = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Genre extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Genre.hasMany(models.MovieGenre, {
        foreignKey: "genre_id",
        as: "movieGenres"
      });

      Genre.belongsToMany(models.Movie, {
        through: models.MovieGenre,
        foreignKey: "genre_id",
        otherKey: "movie_id",
        as: "movies"
      });
    }
  }

  Genre.init({
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    }
  }, {
    sequelize,
    modelName: "Genre",
    tableName: "genres",
    timestamps: false
  });

  return Genre;
};