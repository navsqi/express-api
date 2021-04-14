const catchAsync = require('../utils/catchAsync');
const {
  registerNewUser,
  loginWithEmailAndPassword,
  refreshAuth,
} = require('../services/authService');
const { generateAuthToken } = require('../services/tokenService');

exports.register = catchAsync(async (req, res, next) => {
  const newUser = await registerNewUser(req.body);
  const token = await generateAuthToken(newUser);

  res.status(200).json({
    status: 'success',
    data: {
      token,
      user: newUser,
    },
  });
});

exports.login = catchAsync(async (req, res, next) => {
  const user = await loginWithEmailAndPassword(req.body);
  const token = await generateAuthToken(user);

  res.status(200).json({
    status: 'success',
    data: {
      token,
      user,
    },
  });
});

exports.refreshTokens = catchAsync(async (req, res) => {
  const tokens = await refreshAuth(req.body.refreshToken);
  res.send({ ...tokens });
});
