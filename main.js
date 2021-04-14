require('dotenv').config();

// export module
const express = require('express');
const app = express();

const passport = require('passport');
const { jwtStrategy } = require('./config/passport');
const path = require('path');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const cors = require('cors');
const compression = require('compression');
const xss = require('xss-clean');
const helmet = require('helmet');
const swaggerJsDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

// export custom module
const AppError = require('./utils/appError');
const globalErrorHandler = require('./utils/globalError');
const loggerFile = require('./utils/winstonLog');
const { apiLimiter, authLimiter } = require('./middlewares/rateLimiter');
const swaggerOptions = require('./swagger.json');

// set up for production
if (process.env.NODE_ENV === 'production') {
  process.on('uncaughtException', (err) => {
    loggerFile.error('UNCAUGHT EXCEPTION! 💥 Shutting down...');
    loggerFile.error(err.name, err.message);
    console.log(err.name, err.message);
    process.exit(1);
  });

  app.set('trust proxy', 1);
}

// CORS
app.use(cors());
app.options('*', cors());

// jwt authentication
passport.use('jwt', jwtStrategy);
app.use(passport.initialize());

// morgan logger in development
if (process.env.NODE_ENV === 'development') app.use(morgan('dev'));

// set view engine & folder for views
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

// body parser, reading data from body into req.body
app.use(express.json({ limit: '20mb' }));
// Serve static files
app.use(express.static(path.join(__dirname, 'public')));
// body parser, reading data from form into req.body
app.use(express.urlencoded({ extended: true, limit: '20mb' }));
// Cookie parser, reading data from cookies into req.cookies
app.use(cookieParser());
// use security HTTP headers
app.use(helmet());

app.use(xss());
app.use(compression());

// api request limiter
app.use('/api', apiLimiter);

// limit repeated failed requests to auth endpoints
if (process.env.NODE_ENV === 'production') {
  app.use('/api/v1/auth', authLimiter);
}

// Router
const routerV1 = require('./routes/v1/index');

// Routes
app.use(`/api/v1`, routerV1);

// Swagger Docs
const swaggerDocs = swaggerJsDoc(swaggerOptions);

app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// Handle route not found
app.all('*', (req, res, next) => {
  next(new AppError(`Can't find route ${req.originalUrl}`, 404));
});

// Error handle middleware
app.use(globalErrorHandler);

module.exports = app;
