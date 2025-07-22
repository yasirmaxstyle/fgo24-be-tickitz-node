"use strict";

const argon2 = require("argon2");

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const hashedPassword = await argon2.hash('Password123');

    const users = [
      {
        email: 'admin@noir.com',
        password: hashedPassword,
        role: 'admin',
        profile_id: 1,
        created_at: new Date(),
        updated_at: new Date(),
        last_login: new Date()
      },
      {
        email: 'john.doe@email.com',
        password: hashedPassword,
        role: 'user',
        profile_id: 2,
        created_at: new Date(),
        updated_at: new Date(),
        last_login: new Date()
      },
      {
        email: 'jane.smith@email.com',
        password: hashedPassword,
        role: 'user',
        profile_id: 3,
        created_at: new Date(),
        updated_at: new Date(),
        last_login: new Date()
      },
      {
        email: 'michael.johnson@email.com',
        password: hashedPassword,
        role: 'user',
        profile_id: 4,
        created_at: new Date(),
        updated_at: new Date(),
        last_login: new Date()
      },
      {
        email: 'sarah.wilson@email.com',
        password: hashedPassword,
        role: 'user',
        profile_id: 5,
        created_at: new Date(),
        updated_at: new Date(),
        last_login: new Date()
      }
    ];

    await queryInterface.bulkInsert('users', users, {})
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('users', null, {});
  }
};