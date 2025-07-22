"use strict";
const {
  Model
} = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Showtime extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Showtime.belongsTo(models.Cinema, {
        foreignKey: 'cinema_id',
        as: 'cinema'
      });
    }
  }

  Showtime.init({
    movie_id: DataTypes.INTEGER,
    cinema_id: DataTypes.INTEGER,
    show_datetime: DataTypes.DATE,
    price: DataTypes.DECIMAL,
    available_seats: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: "Showtime",
  });
  return Showtime;
};