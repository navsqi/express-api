class AppError extends Error {
  constructor(message, statusCode, isAxios = false) {
    super(message);

    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;
    this.isAxios = isAxios;

    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = AppError;
