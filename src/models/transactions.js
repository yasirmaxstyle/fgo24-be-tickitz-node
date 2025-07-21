"use strict";
const {
  Model
} = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Transaction extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Transaction.belongsTo(models.User, {
        foreignKey: "created_by",
        as: "creator"
      });

      Transaction.belongsTo(models.PaymentMethod, {
        foreignKey: "payment_method_id",
        as: "paymentMethod"
      });

      Transaction.hasMany(models.Ticket, {
        foreignKey: "transaction_id",
        as: "tickets"
      });
    }
  }
  Transaction.init({
    transaction_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    transaction_code: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false
    },
    recipient_email: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        isEmail: true
      }
    },
    recipient_full_name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    recipient_phone_number: {
      type: DataTypes.STRING,
      allowNull: false
    },
    total_seats: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 1
      }
    },
    total_amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        min: 0
      }
    },
    status: {
      type: DataTypes.ENUM("pending", "paid", "cancelled"),
      defaultValue: "pending"
    },
    created_by: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "users",
        key: "user_id"
      }
    },
    payment_method_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "payment_methods",
        key: "payment_method_id"
      }
    },
    expires_at: {
      type: DataTypes.DATE,
      allowNull: false
    },
    paid_at: {
      type: DataTypes.DATE,
      allowNull: true
    }
  }, {
    sequelize,
    modelName: "Transaction",
    tableName: "transactions",
    underscored: true,
    timestamps: true,
    createdAt: "created_at",
    updatedAt: false,
    hooks: {
      beforeCreate: (transaction, options) => {
        // Generate unique transaction code
        transaction.transaction_code = generateTransactionCode();

        // Set expiration time (15 minutes from creation)
        transaction.expires_at = new Date(Date.now() + 15 * 60 * 1000);
      }
    }
  });
  return Transaction;
};

function generateTransactionCode() {
  const timestamp = Date.now().toString();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `TXN${timestamp.slice(-6)}${random}`;
}