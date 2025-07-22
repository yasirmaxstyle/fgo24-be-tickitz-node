"use strict";

const argon2 = require("argon2");

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const tickets = [
      // Transaction 1 tickets
      {
        ticket_code: 'TICK001' + Date.now(),
        showtime_id: 1,
        seat_number: 'A1',
        status: 'booked',
        transaction_id: 1,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        ticket_code: 'TICK002' + Date.now(),
        showtime_id: 1,
        seat_number: 'A2',
        status: 'booked',
        transaction_id: 1,
        created_at: new Date(),
        updated_at: new Date()
      },

      // Transaction 2 tickets
      {
        ticket_code: 'TICK003' + Date.now(),
        showtime_id: 2,
        seat_number: 'B5',
        status: 'booked',
        transaction_id: 2,
        created_at: new Date(),
        updated_at: new Date()
      },

      // Transaction 3 tickets
      {
        ticket_code: 'TICK004' + Date.now(),
        showtime_id: 3,
        seat_number: 'C1',
        status: 'booked',
        transaction_id: 3,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        ticket_code: 'TICK005' + Date.now(),
        showtime_id: 3,
        seat_number: 'C2',
        status: 'booked',
        transaction_id: 3,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        ticket_code: 'TICK006' + Date.now(),
        showtime_id: 3,
        seat_number: 'C3',
        status: 'booked',
        transaction_id: 3,
        created_at: new Date(),
        updated_at: new Date()
      }
    ];

    await queryInterface.bulkInsert('tickets', tickets, {});
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('tickets', null, {});
  }
};