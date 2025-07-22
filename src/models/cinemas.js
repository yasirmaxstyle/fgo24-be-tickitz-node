"use strict";
const {
  Model
} = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Cinema extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Cinema.hasMany(models.Showtime, {
        foreignKey: 'cinema_id',
        as: 'showtimes'
      });
    }
  }
  Cinema.init({
    name: DataTypes.STRING,
    location: DataTypes.STRING,
    total_seats: DataTypes.STRING,
    address: DataTypes.STRING,
    is_active: DataTypes.BOOLEAN
  }, {
    sequelize,
    modelName: "Cinema",
  });
  return Cinema;
};