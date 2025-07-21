"use strict";
const {
  Model
} = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Ticket extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Ticket.belongsTo(models.Transaction, {
        foreignKey: "transaction_id",
        as: "transaction"
      });

      Ticket.belongsTo(models.Showtime, {
        foreignKey: "showtime_id",
        as: "showtime"
      });
    }
  }

  Ticket.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    ticket_code: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false
    },
    showtime_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "showtimes",
        key: "showtime_id"
      }
    },
    seat_number: {
      type: DataTypes.STRING,
      allowNull: false
    },
    status: {
      type: DataTypes.ENUM("booked", "used", "cancelled"),
      defaultValue: "booked"
    },
    transaction_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "transactions",
        key: "transaction_id"
      }
    }
  }, {
    sequelize,
    modelName: "Ticket",
    tableName: "tickets",
    underscored: true,
    timestamps: true,
    createdAt: "created_at",
    updatedAt: false,
    hooks: {
      beforeCreate: (ticket, options) => {
        ticket.ticket_code = generateTicketCode();
      }
    }
  });

  return Ticket;
};

function generateTicketCode() {
  const timestamp = Date.now().toString();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `TKT${timestamp.slice(-6)}${random}`;
}