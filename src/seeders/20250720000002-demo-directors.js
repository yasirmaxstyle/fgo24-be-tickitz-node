"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const directors = [
      { first_name: 'Christopher', last_name: 'Nolan', created_at: new Date(), updated_at: new Date() },
      { first_name: 'Steven', last_name: 'Spielberg', created_at: new Date(), updated_at: new Date() },
      { first_name: 'Quentin', last_name: 'Tarantino', created_at: new Date(), updated_at: new Date() },
      { first_name: 'Martin', last_name: 'Scorsese', created_at: new Date(), updated_at: new Date() },
      { first_name: 'Denis', last_name: 'Villeneuve', created_at: new Date(), updated_at: new Date() },
      { first_name: 'Jordan', last_name: 'Peele', created_at: new Date(), updated_at: new Date() },
      { first_name: 'Greta', last_name: 'Gerwig', created_at: new Date(), updated_at: new Date() },
      { first_name: 'Ryan', last_name: 'Coogler', created_at: new Date(), updated_at: new Date() },
      { first_name: 'Rian', last_name: 'Johnson', created_at: new Date(), updated_at: new Date() },
      { first_name: 'Patty', last_name: 'Jenkins', created_at: new Date(), updated_at: new Date() }
    ];

    await queryInterface.bulkInsert('directors', directors, {})
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('directors', null, {});
  }
};