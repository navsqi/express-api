const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const { promisify } = require('util');
const jwt = require('jsonwebtoken');

const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');

const { User } = require('../models/index');

// 1 day
const jwtExpires = 1 * 24 * 60 * 60 * 1000;

// Implement refresh token:
// https://hasura.io/blog/best-practices-of-using-jwt-with-graphql/
// https://stackoverflow.com/questions/52617942/how-to-use-a-jwt-refresh-token-to-generate-a-new-access-token
// https://github.com/WebDevSimplified/JWT-Authentication

// TODO: Create token
const signToken = async (id) => {
  return await jwt.sign({ id: id }, process.env.JWT_ACCESS_SECRET, {
    // expires in 7 days
    expiresIn: jwtExpires,
  });
};

// TODO: Create token & send it into cookie & json
const createSendToken = async (user, statusCode, res) => {
  const token = await signToken(user.id);

  // const cookieOptions = {
  //   expires: new Date(Date.now() + jwtExpires),
  //   httpOnly: true,
  // };

  // if (process.env.NODE_ENV == 'production') cookieOptions.secure = true;

  // res.cookie('jwt', token, cookieOptions);

  return res.status(statusCode).json({
    status: 'success',
    token,
    tokenExpiration: new Date(Date.now() + jwtExpires - 5000),
    data: {
      user,
    },
  });
};

// TODO: Register
exports.register = catchAsync(async (req, res, next) => {
  const user = await User.create(req.body);
  if (user) {
    user.password = undefined;
    createSendToken(user, 201, res);
  }
});

// TODO: Login
exports.login = catchAsync(async (req, res, next) => {
  // 1) check if email and password are not filled
  if (!req.body.email || !req.body.password) {
    return next(new AppError('Please provide an email & password', 403));
  }

  // 2) get user from database
  const user = await User.findOne({
    where: {
      email: req.body.email,
    },
    attributes: {
      exclude: ['createdAt', 'updatedAt'],
    },
  });

  // 3) check if user not found
  if (!user || !(await bcrypt.compare(req.body.password, user.password))) {
    return next(new AppError('Invalid email or password', 403));
  }

  user.password = undefined;

  // 4) if user found, sind token
  return createSendToken(user, 200, res);
});

//TODO: Protect Middleware
exports.protectKey = catchAsync(async (req, res, next) => {
  // 1) Check if token exist

  let apiKey;
  if (req.headers.apikey) {
    apiKey = req.headers.apikey;
  }

  if (!apiKey) {
    return next(new AppError(`Please provide an API key`, 401));
  }

  // 3) Check if user exist
  const user = await User.findOne({
    where: { apiKey },
  });

  // console.log(user);
  if (!user) {
    return next(new AppError(`The user belonging this key does not exist`, 401));
  }

  req.user = user;
  res.locals.user = user;

  next();
});

//TODO: Protect Middleware
exports.protectBearer = catchAsync(async (req, res, next) => {
  // 1) Check if token exist
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next(
      new AppError(`You are not logged in! Please log in to get access`, 401)
    );
  }

  // 2) Verify token
  const verify = await promisify(jwt.verify)(token, process.env.JWT_ACCESS_SECRET);

  // 3) Check if user exist
  const user = await User.findOne({
    where: { id: verify.id },
  });

  if (!user) {
    return next(new AppError('The user belonging this token does not exist'), 401);
  }

  req.user = user;
  res.locals.user = user;

  console.log(req.user.id);

  next();
});

// TODO: Logout
exports.logout = async (req, res, next) => {
  // delete cookie
  res.clearCookie('jwt');
};

exports.allowTo = (...roles) => {
  return (req, res, next) => {
    // roles: ['admin', 'user']

    if (!roles.includes(req.user.role)) {
      return next(
        new AppError(`You don't have permission to perform this action`, 403)
      );
    }

    return next();
  };
};

exports.version = (version) => {
  return (req, res, next) => {
    console.log(req.headers.appnumber);

    if (!req.headers.appnumber) {
      return next(new AppError(`Please provide your version number`, 400));
    }

    if (Number(req.headers.appnumber < Number(version))) {
      return next(new AppError(`Your app is outdated, please update`, 400));
    }

    return next();
  };
};

module.exports.createSendToken = createSendToken;
