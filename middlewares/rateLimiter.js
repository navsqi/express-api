const rateLimit = require('express-rate-limit');

const apiLimiter = rateLimit({
  max: 100,
  windowsMs: 1 * 60 * 1000,
  message: {
    status: 'fail',
    message: 'Too many request created from this IP, please try again after a minute',
  },
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  skipSuccessfulRequests: true,
});

module.exports = {
  apiLimiter,
  authLimiter,
};
