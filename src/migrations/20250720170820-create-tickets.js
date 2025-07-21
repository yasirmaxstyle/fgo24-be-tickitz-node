"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("tickets", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      ticket_code: {
        type: Sequelize.STRING
      },
      showtime_id: {
        type: Sequelize.INTEGER,
        references: {
          model: "showtimes",
          key: "id"
        },
        onUpdate: "CASCADE",
        onDelete: "SET NULL"
      },
      seat_number: {
        type: Sequelize.STRING
      },
      status: {
        type: Sequelize.ENUM("booked", "used", "cancelled")
      },
      transaction_id: {
        type: Sequelize.INTEGER,
        references: {
          model: "transactions",
          key: "id"
        },
        onUpdate: "CASCADE",
        onDelete: "SET NULL"
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
    await queryInterface.dropTable("tickets");
    await queryInterface.sequelize.query("DROP TYPE IF EXISTS \"enum_tickets_status\";");

  }
};