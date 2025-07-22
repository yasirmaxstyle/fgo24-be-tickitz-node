"use strict";

const argon2 = require("argon2");

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const now = new Date();
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    const transactions = [
      {
        transaction_code: 'TRX001' + Date.now(),
        recipient_email: 'john.doe@email.com',
        recipient_full_name: 'John Doe',
        recipient_phone_number: '+62812345679',
        total_seats: 2,
        total_amount: 150000.00,
        status: 'paid',
        created_at: yesterday,
        expires_at: new Date(yesterday.getTime() + 24 * 60 * 60 * 1000),
        paid_at: yesterday,
        created_by: 2,
        payment_method_id: 1,
        updated_at: new Date()
      },
      {
        transaction_code: 'TRX002' + Date.now(),
        recipient_email: 'jane.smith@email.com',
        recipient_full_name: 'Jane Smith',
        recipient_phone_number: '+62812345680',
        total_seats: 1,
        total_amount: 75000.00,
        status: 'paid',
        created_at: yesterday,
        expires_at: new Date(yesterday.getTime() + 24 * 60 * 60 * 1000),
        paid_at: yesterday,
        created_by: 3,
        payment_method_id: 2,
        updated_at: new Date()
      },
      {
        transaction_code: 'TRX003' + Date.now(),
        recipient_email: 'michael.johnson@email.com',
        recipient_full_name: 'Michael Johnson',
        recipient_phone_number: '+62812345681',
        total_seats: 3,
        total_amount: 225000.00,
        status: 'pending',
        created_at: now,
        expires_at: new Date(now.getTime() + 24 * 60 * 60 * 1000),
        paid_at: null,
        created_by: 4,
        payment_method_id: 3,
        updated_at: new Date()
      }
    ];

    await queryInterface.bulkInsert('transactions', transactions, {});
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('transactions', null, {});
  }
};