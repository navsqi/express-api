const passport = require('passport');
const httpStatus = require('http-status');
const AppError = require('../utils/appError');

const verifyCallback = (req, resolve, reject, roles) => async (err, user, info) => {
  if (err || info || !user) {
    return reject(
      new AppError(err || info || 'Please authenticate', httpStatus.UNAUTHORIZED)
    );
  }
  req.user = user;

  if (roles.length) {
    if (!roles.includes(req.user.role)) {
      return reject(new AppError(`Forbidden`, httpStatus.FORBIDDEN));
    }
  }

  resolve();
};

const auth = (...roles) => async (req, res, next) => {
  return new Promise((resolve, reject) => {
    passport.authenticate(
      'jwt',
      { session: false },
      verifyCallback(req, resolve, reject, roles)
    )(req, res, next);
  })
    .then(() => next())
    .catch((err) => next(err));
};

module.exports = auth;
