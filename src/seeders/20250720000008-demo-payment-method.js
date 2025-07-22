"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const paymentMethods = [
      {
        name: 'GoPay',
        code: 'EWALLET',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: 'OVO',
        code: 'EWALLET',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: 'DANA',
        code: 'EWALLET',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: 'Bank BCA',
        code: 'BANK_TRANSFER',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: 'Bank Mandiri',
        code: 'BANK_TRANSFER',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: 'Bank BRI',
        code: 'BANK_TRANSFER',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      }
    ];

    await queryInterface.bulkInsert('payment_method', paymentMethods, {})
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('payment_method', null, {});
  }
};