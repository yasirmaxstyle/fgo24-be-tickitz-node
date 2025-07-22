"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const genres = [
      { name: 'Action', created_at: new Date(), updated_at: new Date() },
      { name: 'Adventure', created_at: new Date(), updated_at: new Date() },
      { name: 'Comedy', created_at: new Date(), updated_at: new Date() },
      { name: 'Drama', created_at: new Date(), updated_at: new Date() },
      { name: 'Horror', created_at: new Date(), updated_at: new Date() },
      { name: 'Romance', created_at: new Date(), updated_at: new Date() },
      { name: 'Sci-Fi', created_at: new Date(), updated_at: new Date() },
      { name: 'Thriller', created_at: new Date(), updated_at: new Date() },
      { name: 'Fantasy', created_at: new Date(), updated_at: new Date() },
      { name: 'Animation', created_at: new Date(), updated_at: new Date() },
      { name: 'Crime', created_at: new Date(), updated_at: new Date() },
      { name: 'Mystery', created_at: new Date(), updated_at: new Date() }
    ];

    await queryInterface.bulkInsert('genres', genres, {})
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('genres', null, {});
  }
};