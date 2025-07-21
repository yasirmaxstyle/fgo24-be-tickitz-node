"use strict";
const {
  Model
} = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Movie extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Movie.belongsTo(models.Director, {
        foreignKey: "director_id",
        as: "director"
      });

      Movie.hasMany(models.MovieCast, {
        foreignKey: "movie_id",
        as: "cast"
      });

      Movie.hasMany(models.MovieGenre, {
        foreignKey: "movie_id",
        as: "genres"
      });

      Movie.hasMany(models.Showtime, {
        foreignKey: "movie_id",
        as: "showtimes"
      });

      // Many-to-many through MovieCast
      Movie.belongsToMany(models.Actor, {
        through: models.MovieCast,
        foreignKey: "movie_id",
        otherKey: "actor_id",
        as: "actors"
      });
    }
  }
  Movie.init({
    movie_id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
        len: [1, 255]
      }
    },
    poster_path: {
      type: DataTypes.STRING,
      validate: {
        isUrl: true
      }
    },
    backdrop_path: {
      type: DataTypes.STRING,
      validate: {
        isUrl: true
      }
    },
    overview: {
      type: DataTypes.TEXT
    },
    duration: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 1,
        isInt: true
      }
    },
    release_date: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    rating: {
      type: DataTypes.ENUM("G", "PG", "PG-13", "R"),
      allowNull: false
    },
    director_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "directors",
        key: "director_id"
      }
    },
    created_at: {
      allowNull: false,
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
    updated_at: {
      allowNull: false,
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    }
  }, {
    sequelize,
    modelName: "Movie",
  });
  return Movie;
};