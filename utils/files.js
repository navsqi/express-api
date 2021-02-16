const multer = require('multer');
const fs = require('fs');
const path = require('path');
const cryptoRandomString = require('crypto-random-string');
const AppError = require('../utils/appError');
const loggerFile = require('./winstonLog');

exports.uploadSingle = (table, fileInput, path) => {
  const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, path);
    },
    filename: function (req, file, cb) {
      loggerFile.info(file);
      const imageFormat = file.mimetype.split('/')[1];
      const fileName = `${table}-${Date.now()}.${imageFormat}`;
      cb(null, fileName);
    },
  });

  const fileFilter = (req, file, cb) => {
    // File format
    if (file.mimetype.startsWith('image')) {
      cb(null, true);
    } else {
      cb(null, false);
    }
  };

  const uploadConfig = multer({
    storage,
    fileFilter,
    limits: {
      fileSize: 10000000,
    },
  });

  return (req, res, next) => {
    loggerFile.info('Uploading....');
    const upload = uploadConfig.single(fileInput);

    upload(req, res, function (err) {
      if (err instanceof multer.MulterError) {
        // A Multer error occurred when uploading.
        if (err.code === 'LIMIT_FILE_SIZE')
          return next(new AppError(`File too large`, 400));
      } else if (err) {
        // An unknown error occurred when uploading.
        return res.send(err);
      }
      // Everything went fine.
      return next();
    });
  };
};

exports.uploadMulti = (table, fileInput, path) => {
  const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, path);
    },
    filename: function (req, file, cb) {
      loggerFile.info(file);
      const imageFormat = file.mimetype.split('/')[1];
      const cryptoString = cryptoRandomString({
        length: 8,
      });
      const fileName = `${table}-${cryptoString}-${Date.now()}.${imageFormat}`;
      cb(null, fileName);
    },
  });

  const fileFilter = (req, file, cb) => {
    // File format
    if (file.mimetype.startsWith('image')) {
      cb(null, true);
    } else {
      cb(null, false);
    }
  };

  const uploadConfig = multer({
    storage,
    fileFilter,
    limits: {
      fileSize: 10000000,
    },
  });

  return (req, res, next) => {
    loggerFile.info('Uploading...');
    const upload = uploadConfig.array(fileInput);

    upload(req, res, function (err) {
      if (err instanceof multer.MulterError) {
        // A Multer error occurred when uploading.
        if (err.code === 'LIMIT_FILE_SIZE')
          return next(new AppError(`File too large`, 400));
      } else if (err) {
        // An unknown error occurred when uploading.
        return res.send(err);
      }
      // Everything went fine.
      return next();
    });
  };
};

exports.deleteFile = (imageName, imageDir) => {
  if (imageName) {
    fs.unlink(
      path.join(__dirname, '..', 'public', 'images', imageDir, imageName),
      (err) => {
        if (err) return err;
      }
    );
  }

  return true;
};
