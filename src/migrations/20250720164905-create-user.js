"use strict";

const { sequelize } = require("../models");

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("Users", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      email: {
        type: Sequelize.STRING
      },
      password: {
        type: Sequelize.STRING
      },
      role: {
        type: Sequelize.ENUM("user", "admin"),
        allowNull: false,
        defaultValue: "user"
      },
      last_login: {
        type: Sequelize.DATE
      },
      profile_id: {
        type: Sequelize.INTEGER,
        references: {
          model: "Profiles",
          key: "id"
        },
        onUpdate: "CASCADE",
        onDelete: "SET NULL"
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: sequelize.literal("CURRENT_TIMETAMP")
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: sequelize.literal("CURRENT_TIMETAMP")
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("Users");
    await queryInterface.sequelize.query("DROP TYPE IF EXISTS \"enum_Users_role\";");

  }
};