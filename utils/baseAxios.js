const axios = require('axios');

// Set config defaults when creating the instance
const API = axios.create({
  baseURL: 'https://pro.rajaongkir.com',
});

// Alter defaults after instance has been created
const setAPI = (key) => {
  API.defaults.headers.common['key'] = key;
};

module.exports = {
  API,
  setAPI,
};
