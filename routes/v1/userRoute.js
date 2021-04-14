const express = require('express');
const router = express.Router();

const userController = require('../../controllers/userController');

const auth = require('../../middlewares/auth');

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
 *    parameters:
 *      - $ref: '#/components/parameters/page'
 *      - $ref: '#/components/parameters/limit'
 *    responses:
 *      '200':
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/responses/GetUsers'
 *      '403':
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/responses/Unauthorized'
 *
 */
router.route('/').get(auth('superadmin'), userController.getUsers);

module.exports = router;
