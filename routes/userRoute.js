const express = require('express');
const router = express.Router();

const userController = require('../controllers/userController');

const { allowTo, protect, protectAPIKey } = require('../middlewares/auth');

// http://localhost:5000/api/v1/users?page=1&limit=10&order=id:ASC
/**
 * @swagger
 * /users:
 *  get:
 *    security:
 *      - BearerAuth: ['admin']
 *    tags:
 *      - Users
 *    description: Use to request all users
 *    responses:
 *      '200':
 *        description: A successful response
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/User'
 *      '403':
 *        $ref: '#/components/responses/Unauthorized'
 *
 */
router.get('/', userController.getUsers);

module.exports = router;
