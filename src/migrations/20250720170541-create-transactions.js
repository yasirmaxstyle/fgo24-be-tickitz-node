"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("Transactions", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      transaction_code: {
        type: Sequelize.STRING
      },
      recipient_email: {
        type: Sequelize.STRING
      },
      recipient_full_name: {
        type: Sequelize.STRING
      },
      recipient_phone_number: {
        type: Sequelize.STRING
      },
      total_seats: {
        type: Sequelize.INTEGER
      },
      total_amount: {
        type: Sequelize.DECIMAL(10, 2)
      },
      status: {
        type: Sequelize.ENUM("pending", "paid", "cancelled"),
        allowNull: false,
        defaultValue: "pending"
      },
      expires_at: {
        type: Sequelize.DATE
      },
      paid_at: {
        type: Sequelize.DATE
      },
      created_by: {
        type: Sequelize.INTEGER,
        references: {
          model: "User",
          key: "id"
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE"
      },
      payment_method_id: {
        type: Sequelize.INTEGER,
        references: {
          model: "PaymentMethod",
          key: "id"
        },
        onUpdate: "CASCADE",
        onDelete: "RESTRICT"
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("Transactions");
    await queryInterface.sequelize.query("DROP TYPE IF EXISTS \"enum_Transactions_status\";");
  }
};