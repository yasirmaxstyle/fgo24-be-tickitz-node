"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const moviesCast = [
      // Inception cast
      { movie_id: 1, actor_id: 1, role: 'Dom Cobb', created_at: new Date(), updated_at: new Date() },
      { movie_id: 1, actor_id: 2, role: 'Mal', created_at: new Date(), updated_at: new Date() },

      // The Dark Knight cast
      { movie_id: 2, actor_id: 3, role: 'Tony Stark / Iron Man', created_at: new Date(), updated_at: new Date() },
      { movie_id: 2, actor_id: 7, role: 'Tyler Durden', created_at: new Date(), updated_at: new Date() },

      // Pulp Fiction cast
      { movie_id: 3, actor_id: 7, role: 'Tyler Durden', created_at: new Date(), updated_at: new Date() },
      { movie_id: 3, actor_id: 9, role: 'Vincent Vega', created_at: new Date(), updated_at: new Date() },

      // Dune cast
      { movie_id: 4, actor_id: 15, role: 'Paul Atreides', created_at: new Date(), updated_at: new Date() },
      { movie_id: 4, actor_id: 14, role: 'Chani', created_at: new Date(), updated_at: new Date() },

      // Get Out cast
      { movie_id: 5, actor_id: 11, role: 'Chris Washington', created_at: new Date(), updated_at: new Date() },
      { movie_id: 5, actor_id: 8, role: 'Rose Armitage', created_at: new Date(), updated_at: new Date() },

      // Lady Bird cast
      { movie_id: 6, actor_id: 6, role: 'Christine "Lady Bird" McPherson', created_at: new Date(), updated_at: new Date() },
      { movie_id: 6, actor_id: 10, role: 'Marion McPherson', created_at: new Date(), updated_at: new Date() }
    ];
    await queryInterface.bulkInsert('movies_cast', moviesCast, {})
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('movies_cast', null, {});
  }
};