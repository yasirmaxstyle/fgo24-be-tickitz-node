"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("transactions", {
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
          model: "users",
          key: "id"
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE"
      },
      payment_method_id: {
        type: Sequelize.INTEGER,
        references: {
          model: "payment_method",
          key: "id"
        },
        onUpdate: "CASCADE",
        onDelete: "RESTRICT"
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("transactions");
    await queryInterface.sequelize.query("DROP TYPE IF EXISTS \"enum_transactions_status\";");
  }
};