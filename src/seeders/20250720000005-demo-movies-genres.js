"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const movieGenres = [
      // Inception - Action, Sci-Fi, Thriller
      { movie_id: 1, genre_id: 1, created_at: new Date(), updated_at: new Date() },
      { movie_id: 1, genre_id: 7, created_at: new Date(), updated_at: new Date() },
      { movie_id: 1, genre_id: 8, created_at: new Date(), updated_at: new Date() },

      // The Dark Knight - Action, Crime, Drama
      { movie_id: 2, genre_id: 1, created_at: new Date(), updated_at: new Date() },
      { movie_id: 2, genre_id: 11, created_at: new Date(), updated_at: new Date() },
      { movie_id: 2, genre_id: 4, created_at: new Date(), updated_at: new Date() },

      // Pulp Fiction - Crime, Drama
      { movie_id: 3, genre_id: 11, created_at: new Date(), updated_at: new Date() },
      { movie_id: 3, genre_id: 4, created_at: new Date(), updated_at: new Date() },

      // Dune - Adventure, Drama, Sci-Fi
      { movie_id: 4, genre_id: 2, created_at: new Date(), updated_at: new Date() },
      { movie_id: 4, genre_id: 4, created_at: new Date(), updated_at: new Date() },
      { movie_id: 4, genre_id: 7, created_at: new Date(), updated_at: new Date() },

      // Get Out - Horror, Mystery, Thriller
      { movie_id: 5, genre_id: 5, created_at: new Date(), updated_at: new Date() },
      { movie_id: 5, genre_id: 12, created_at: new Date(), updated_at: new Date() },
      { movie_id: 5, genre_id: 8, created_at: new Date(), updated_at: new Date() },

      // Lady Bird - Comedy, Drama
      { movie_id: 6, genre_id: 3, created_at: new Date(), updated_at: new Date() },
      { movie_id: 6, genre_id: 4, created_at: new Date(), updated_at: new Date() }
    ];

    await queryInterface.bulkInsert('movies_genres', movieGenres, {})
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('movies_genres', null, {});
  }
};