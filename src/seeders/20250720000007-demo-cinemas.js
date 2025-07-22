"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const cinemas = [
      {
        name: 'Grand Cinema XXI',
        location: 'Jakarta Central',
        total_seats: 150,
        address: 'Jl. Sudirman No. 1, Jakarta Pusat',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: 'CGV Blitz Megaplex',
        location: 'Depok Town Square',
        total_seats: 120,
        address: 'Jl. Margonda Raya, Depok',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: 'Cinépolis Plaza',
        location: 'Bandung',
        total_seats: 180,
        address: 'Jl. Asia Afrika No. 8, Bandung',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: 'IMAX Theater',
        location: 'Surabaya',
        total_seats: 200,
        address: 'Jl. Pemuda No. 33, Surabaya',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: 'Studio 21',
        location: 'Yogyakarta',
        total_seats: 100,
        address: 'Jl. Malioboro No. 56, Yogyakarta',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      }
    ];

    await queryInterface.bulkInsert('cinemas', cinemas, {})
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('cinemas', null, {});
  }
};