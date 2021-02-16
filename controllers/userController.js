const catchAsync = require('../utils/catchAsync');
const { User } = require('../models/index');
const { pagination } = require('../utils/helper');

exports.getUsers = catchAsync(async (req, res, next) => {
  const { count, rows } = await User.findAndCountAll({
    ...pagination(req),
  });

  res.status(200).json({
    status: 'success',
    count,
    results: rows.length,
    data: {
      users: rows,
    },
  });
});
