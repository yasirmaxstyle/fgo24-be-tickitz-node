"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const profiles = [
      {
        first_name: 'Admin',
        last_name: 'System',
        phone_number: '+62812345678',
        avatar: '/avatars/admin.jpg',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        first_name: 'John',
        last_name: 'Doe',
        phone_number: '+62812345679',
        avatar: '/avatars/john.jpg',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        first_name: 'Jane',
        last_name: 'Smith',
        phone_number: '+62812345680',
        avatar: '/avatars/jane.jpg',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        first_name: 'Michael',
        last_name: 'Johnson',
        phone_number: '+62812345681',
        avatar: '/avatars/michael.jpg',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        first_name: 'Sarah',
        last_name: 'Wilson',
        phone_number: '+62812345682',
        avatar: '/avatars/sarah.jpg',
        created_at: new Date(),
        updated_at: new Date()
      }
    ];

    await queryInterface.bulkInsert('profiles', profiles, {})
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('profiles', null, {});
  }
};