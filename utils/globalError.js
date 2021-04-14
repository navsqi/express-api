const logger = require('../utils/winstonLog');

const AppError = require('./../utils/appError');

const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path}: ${err.value}.`;
  return new AppError(message, 400);
};

const handleDuplicateFieldsDB = (err) => {
  const value = err.errors[0].message;

  const message = `Duplicate field value: ${value}. Please use another value!`;
  return new AppError(message, 400);
};

const handleValidationErrorDB = (err) => {
  const errors = Object.values(err.errors).map((el) => el.message);

  const message = `Invalid input data: ${errors.join('. ')}`;
  return new AppError(message, 400);
};

const handleDatabaseError = (err) => {
  const message = `${err.message}`;
  return new AppError(message, 400);
};

const handleJWTError = () => new AppError('Invalid token. Please log in again!', 401);

const handleJWTExpiredError = () =>
  new AppError('Your token has expired! Please log in again.', 401);

const handleAxiosError = (err) => {
  return new AppError(JSON.stringify(err.response.data), err.response.status, true);
};

const sendErrorDev = (err, req, res) => {
  // A) API
  // Kalo error dari axios
  if (
    req.originalUrl.startsWith(process.env.ENDPOINT + '/api') &&
    err.response &&
    err.isAxiosError
  ) {
    return res.status(err.statusCode).json({
      status: err.status,
      isAxios: err.isAxiosError,
      message: err.response.data,
    });
  } else if (req.originalUrl.startsWith(process.env.ENDPOINT + '/api')) {
    // kalo bukan error dari axios
    return res.status(err.statusCode).json({
      status: err.status,
      isAxios: err.isAxiosError,
      error: err,
      message: err.message,
      stack: err.stack,
    });
  }

  console.error('ERROR 💥', err);
  return res.status(err.statusCode).json({
    status: err.status,
    isAxios: err.isAxiosError ? true : false,
    error: err,
    message: err.message,
    stack: err.stack,
  });
};

const sendErrorProd = (err, req, res) => {
  // A) API
  if (req.originalUrl.startsWith(process.env.ENDPOINT + '/api')) {
    // A) Operational, trusted error: send message to client
    if (err.isOperational && !err.isAxios) {
      return res.status(err.statusCode).json({
        status: err.status,
        message: err.message,
      });
    } else if (err.isAxios) {
      return res
        .status(err.statusCode)
        .json({ status: err.status, message: JSON.parse(err.message) });
    }
    // B) Programming or other unknown error: don't leak error details
    // 1) Log error
    console.error('ERROR 💥', err);
    // 2) Send generic message
    return res.status(500).json({
      status: 'error',
      message: err.message ? err.message : 'Something went very wrong',
    });
  } else {
    console.error('ERROR 💥', err);
    return res.status(500).json({
      status: 'error',
      message: err.message ? err.message : 'Something went very wrong',
    });
  }
};

module.exports = (err, req, res, next) => {
  // console.log(err.stack);

  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    // console.log(err);
    sendErrorDev(err, req, res);
  } else if (process.env.NODE_ENV === 'production') {
    let error = { ...err };
    error.message = err.message;
    // console.log(error);
    logger.error(error);

    if (error.response && error.isAxiosError) error = handleAxiosError(error);
    if (error.name === 'CastError') error = handleCastErrorDB(error);
    if (error.name === 'SequelizeUniqueConstraintError')
      error = handleDuplicateFieldsDB(error);
    if (error.name === 'SequelizeDatabaseError') error = handleDatabaseError(error);
    if (error.name === 'SequelizeValidationError') error = handleValidationErrorDB(error);
    if (error.name === 'JsonWebTokenError') error = handleJWTError();
    if (error.name === 'TokenExpiredError') error = handleJWTExpiredError();

    sendErrorProd(error, req, res);
  }
};
