"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const movies = [
      {
        title: 'Inception',
        poster_path: '/inception_poster.jpg',
        backdrop_path: '/inception_backdrop.jpg',
        overview: 'A thief who steals corporate secrets through the use of dream-sharing technology is given the inverse task of planting an idea into the mind of a C.E.O.',
        duration: 148,
        release_date: '2010-07-16',
        rating: 'PG-13',
        director_id: 1,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        title: 'The Dark Knight',
        poster_path: '/dark_knight_poster.jpg',
        backdrop_path: '/dark_knight_backdrop.jpg',
        overview: 'When the menace known as the Joker wreaks havoc and chaos on the people of Gotham, Batman must accept one of the greatest psychological and physical tests.',
        duration: 152,
        release_date: '2008-07-18',
        rating: 'PG-13',
        director_id: 1,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        title: 'Pulp Fiction',
        poster_path: '/pulp_fiction_poster.jpg',
        backdrop_path: '/pulp_fiction_backdrop.jpg',
        overview: 'The lives of two mob hitmen, a boxer, a gangster and his wife intertwine in four tales of violence and redemption.',
        duration: 154,
        release_date: '1994-10-14',
        rating: 'R',
        director_id: 3,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        title: 'Dune',
        poster_path: '/dune_poster.jpg',
        backdrop_path: '/dune_backdrop.jpg',
        overview: 'Paul Atreides unites with Chani and the Fremen while on a path of revenge against the conspirators who destroyed his family.',
        duration: 155,
        release_date: '2021-10-22',
        rating: 'PG-13',
        director_id: 5,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        title: 'Get Out',
        poster_path: '/get_out_poster.jpg',
        backdrop_path: '/get_out_backdrop.jpg',
        overview: 'A young African-American visits his white girlfriend\'s parents for the weekend, where his simmering uneasiness becomes a nightmare.',
        duration: 104,
        release_date: '2017-02-24',
        rating: 'R',
        director_id: 6,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        title: 'Lady Bird',
        poster_path: '/lady_bird_poster.jpg',
        backdrop_path: '/lady_bird_backdrop.jpg',
        overview: 'A girl navigates a loving but turbulent relationship with her strong-willed mother over her senior year in high school.',
        duration: 94,
        release_date: '2017-11-03',
        rating: 'R',
        director_id: 7,
        created_at: new Date(),
        updated_at: new Date()
      }
    ];

    await queryInterface.bulkInsert('movies', movies, {})
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('movies', null, {});
  }
};