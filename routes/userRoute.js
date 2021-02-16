const express = require('express');
const router = express.Router();

const userController = require('../controllers/userController');

const { allowTo, protect, protectAPIKey } = require('../middlewares/auth');

// http://localhost:5000/api/v1/users?page=1&limit=10&order=id:ASC
router.get('/', userController.getUsers);

module.exports = router;
