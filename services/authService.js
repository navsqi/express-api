const httpStatus = require('http-status');
const AppError = require('../utils/appError');
const { User, Token } = require('../models/index');
const tokenService = require('./tokenService');
const { tokenTypes } = require('../config/tokens');

/**
 *
 * @param {Object} body
 * @returns New User
 */
const registerNewUser = async (body) => {
  const { name, email, phoneNumber, password } = body;

  const user = await User.create({
    name,
    email,
    phoneNumber,
    password,
  });

  user.password = undefined;
  return user;
};

/**
 *
 * @param {Object} body
 * @returns User
 */
const loginWithEmailAndPassword = async (body) => {
  // 1) check if email and password are not filled
  if (!body.email || !body.password) {
    throw new AppError('Please provide an email & password', httpStatus.BAD_REQUEST);
  }

  // 2) get user from database
  const user = await User.findOne({
    where: {
      email: body.email,
    },
    attributes: {
      exclude: ['createdAt', 'updatedAt'],
    },
  });

  // 3) check if user not found
  if (!user || !user.comparePassword(body.password, user.password)) {
    throw new AppError('Invalid email or password', httpStatus.UNAUTHORIZED);
  }

  user.password = undefined;

  return user;
};

/**
 * Refresh auth tokens
 * @param {string} refreshToken
 * @returns {Promise<Object>}
 */
const refreshAuth = async (refreshToken) => {
  try {
    console.log('EWEWEWE');
    const refreshTokenDoc = await tokenService.verifyToken(
      refreshToken,
      tokenTypes.REFRESH
    );

    const user = await User.findByPk(refreshTokenDoc.userId);
    if (!user) {
      throw new AppError('Refresh token failed, user not found', httpStatus.NOT_FOUND);
    }
    await refreshTokenDoc.destroy();
    return await tokenService.generateAuthToken(user);
  } catch (error) {
    throw new AppError(error, httpStatus.UNAUTHORIZED);
  }
};

/**
 * Logout
 * @param {string} refreshToken
 * @returns {Promise}
 */
const logout = async (refreshToken) => {
  const refreshTokenDoc = await Token.findOne({
    token: refreshToken,
    type: tokenTypes.REFRESH,
    blacklisted: false,
  });

  if (!refreshTokenDoc) {
    throw new AppError('Token not found', httpStatus.NOT_FOUND);
  }

  await refreshTokenDoc.remove();
};

/**
 * Reset password
 * @param {string} resetPasswordToken
 * @param {string} newPassword
 * @returns {Promise}
 */
const resetPassword = async (resetPasswordToken, newPassword) => {
  try {
    const resetPasswordTokenDoc = await tokenService.verifyToken(
      resetPasswordToken,
      tokenTypes.RESET_PASSWORD
    );
    const user = await User.findByPk(resetPasswordTokenDoc.userId);
    if (!user) {
      throw new AppError('Reset password failed, user not found', httpStatus.NOT_FOUND);
    }
    user.password = newPassword;
    await user.save();

    await Token.destroy({
      where: {
        userId: user.id,
        type: tokenTypes.RESET_PASSWORD,
      },
    });
  } catch (error) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Password reset failed');
  }
};

module.exports = {
  registerNewUser,
  loginWithEmailAndPassword,
  refreshAuth,
  logout,
  resetPassword,
};
