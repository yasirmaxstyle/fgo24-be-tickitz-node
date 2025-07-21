"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("Movies", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      title: {
        type: Sequelize.STRING
      },
      poster_path: {
        type: Sequelize.STRING
      },
      backdrop_path: {
        type: Sequelize.STRING
      },
      overview: {
        type: Sequelize.TEXT
      },
      duration: {
        type: Sequelize.INTEGER
      },
      release_date: {
        type: Sequelize.DATEONLY
      },
      rating: {
        type: Sequelize.ENUM("G", "PG", "PG-13", "R")
      },
      director_id: {
        type: Sequelize.INTEGER,
        references: {
          model: "Directors",
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
    await queryInterface.dropTable("Movies");
    await queryInterface.sequelize.query("DROP TYPE IF EXISTS \"enum_Movies_rating\";");

  }
};