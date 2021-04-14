const httpStatus = require('http-status');
const jwt = require('jsonwebtoken');
const dayjs = require('dayjs');
const AppError = require('../utils/appError');
const { User, Token } = require('../models/index');
const config = require('../config/config');
const { tokenTypes } = require('../config/tokens');

// Implement refresh token:
// https://hasura.io/blog/best-practices-of-using-jwt-with-graphql/
// https://stackoverflow.com/questions/52617942/how-to-use-a-jwt-refresh-token-to-generate-a-new-access-token
// https://github.com/WebDevSimplified/JWT-Authentication

/**
 *
 * @param {number} userId
 * @returns token
 */
const signToken = (userId, expires, type, jwtSecret = config.jwt.secret) => {
  return jwt.sign(
    {
      sub: userId,
      iat: dayjs().unix(),
      exp: expires.unix(),
      type: type,
    },
    jwtSecret
  );
};

/**
 *
 * @param {Promise<User>} user
 * @returns Object of tokens
 */
const generateAuthToken = async (user) => {
  const accessTokenExpires = dayjs().add(config.jwt.accessExpirationMinutes, 'minute');
  const refreshTokenExpires = dayjs().add(config.jwt.refreshExpirationDays, 'day');

  const accessToken = signToken(user.id, accessTokenExpires, tokenTypes.ACCESS);

  const refreshToken = signToken(user.id, refreshTokenExpires, tokenTypes.REFRESH);

  await saveToken(refreshToken, user.id, tokenTypes.REFRESH, refreshTokenExpires);

  return {
    accessToken,
    accessTokenExpires: dayjs(accessTokenExpires).format('YYYY-MM-DD HH:mm:ss'),
    refreshToken,
    refreshTokenExpires: dayjs(refreshTokenExpires).format('YYYY-MM-DD HH:mm:ss'),
  };
};

/**
 *
 * @param {string} token
 * @param {number} userId
 * @param {string} types
 * @param {date} expires
 * @param {boolean} blacklisted
 * @returns New Token
 */
const saveToken = async (token, userId, type, expires, blacklisted = false) => {
  const tokenDoc = await Token.create({ token, userId, type, expires, blacklisted });

  return tokenDoc;
};

/**
 * Verify token and return token doc (or throw an error if it is not valid)
 * @param {string} token
 * @param {string} type
 * @returns Token from db
 */
const verifyToken = async (token, type) => {
  const payload = jwt.verify(token, config.jwt.secret);
  const tokenDoc = await Token.findOne({
    where: {
      token,
      type,
      userId: payload.sub,
      blacklisted: false,
    },
  });

  if (!tokenDoc) {
    throw new AppError('Token not found', httpStatus.NOT_FOUND);
  }
  return tokenDoc;
};

module.exports = {
  signToken,
  generateAuthToken,
  saveToken,
  verifyToken,
};
