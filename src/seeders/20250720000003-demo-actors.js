"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const actors = [
      { first_name: 'Leonardo', last_name: 'DiCaprio', created_at: new Date(), updated_at: new Date() },
      { first_name: 'Scarlett', last_name: 'Johansson', created_at: new Date(), updated_at: new Date() },
      { first_name: 'Robert', last_name: 'Downey Jr.', created_at: new Date(), updated_at: new Date() },
      { first_name: 'Margot', last_name: 'Robbie', created_at: new Date(), updated_at: new Date() },
      { first_name: 'Ryan', last_name: 'Gosling', created_at: new Date(), updated_at: new Date() },
      { first_name: 'Emma', last_name: 'Stone', created_at: new Date(), updated_at: new Date() },
      { first_name: 'Brad', last_name: 'Pitt', created_at: new Date(), updated_at: new Date() },
      { first_name: 'Jennifer', last_name: 'Lawrence', created_at: new Date(), updated_at: new Date() },
      { first_name: 'Tom', last_name: 'Hanks', created_at: new Date(), updated_at: new Date() },
      { first_name: 'Meryl', last_name: 'Streep', created_at: new Date(), updated_at: new Date() },
      { first_name: 'Denzel', last_name: 'Washington', created_at: new Date(), updated_at: new Date() },
      { first_name: 'Viola', last_name: 'Davis', created_at: new Date(), updated_at: new Date() },
      { first_name: 'Michael', last_name: 'Jordan', created_at: new Date(), updated_at: new Date() },
      { first_name: 'Zendaya', last_name: 'Coleman', created_at: new Date(), updated_at: new Date() },
      { first_name: 'Timothée', last_name: 'Chalamet', created_at: new Date(), updated_at: new Date() }
    ];

    await queryInterface.bulkInsert('actors', actors, {})
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('actors', null, {});
  }
};