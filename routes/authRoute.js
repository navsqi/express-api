const express = require('express');
const router = express.Router();

const { register, login } = require('../middlewares/auth');

// http://localhost:5000/api/v1/users?page=1&limit=10&order=id:ASC
router.post('/register', register);
router.post('/login', login);

module.exports = router;
