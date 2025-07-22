"use strict";

const argon2 = require("argon2");

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const showtimes = [];

    // Generate showtimes for the next 7 days
    for (let day = 0; day < 7; day++) {
      const showDate = new Date(today);
      showDate.setDate(today.getDate() + day);

      // Multiple movies per day
      const movies = [1, 2, 3, 4, 5, 6];
      const cinemas = [1, 2, 3, 4, 5];
      const times = ['10:00', '13:00', '16:00', '19:00', '22:00'];

      movies.forEach(movieId => {
        cinemas.slice(0, 2).forEach(cinemaId => { // 2 cinemas per movie
          times.slice(0, 3).forEach(time => { // 3 showtimes per cinema
            const [hour, minute] = time.split(':');
            const showDateTime = new Date(showDate);
            showDateTime.setHours(parseInt(hour), parseInt(minute), 0, 0);

            showtimes.push({
              movie_id: movieId,
              cinema_id: cinemaId,
              show_datetime: showDateTime,
              price: Math.floor(Math.random() * 50000) + 30000, // Price between 30k-80k
              available_seats: 98,
              created_at: new Date(),
              updated_at: new Date()
            });
          });
        });
      });
    }

    await queryInterface.bulkInsert('showtimes', showtimes, {});
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('showtimes', null, {});
  }
};