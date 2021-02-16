'use strict';

let faker = require('faker');
let data = [];

for (let i = 0; i < 50; i++) {
  data.push({
    name: faker.name.findName(),
    email: faker.internet.email(),
    phoneNumber: faker.phone.phoneNumber(),
    password: faker.internet.password(),
    photo: faker.internet.avatar(),
    role: 'user',
    apiKey: faker.finance.ethereumAddress(),
    active: 1,
    activationToken: faker.finance.litecoinAddress(),
  });
}

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert('users', data, {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('users', null, {});
  },
};
