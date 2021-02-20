require('dotenv').config();

// export module
const express = require('express');
const app = express();

const path = require('path');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const compression = require('compression');
const xss = require('xss-clean');
const helmet = require('helmet');

// export custom module
const AppError = require('./utils/appError');
const globalErrorHandler = require('./utils/globalError');
const loggerFile = require('./utils/winstonLog');

// set up for production
if (process.env.NODE_ENV === 'production') {
  process.on('uncaughtException', (err) => {
    loggerFile.error('UNCAUGHT EXCEPTION! 💥 Shutting down...');
    loggerFile.error(err.name, err.message);
    console.log(err.name, err.message);
    process.exit(1);
  });

  app.use(cors());
  app.options('*', cors());
  app.set('trust proxy', 1);
}

// morgan logger in development
if (process.env.NODE_ENV === 'development') app.use(morgan('dev'));

// set view engine & folder for views
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

// body parser, reading data from body into req.body
app.use(express.json({ limit: '20mb' }));
// body parser, reading data from form into req.body
app.use(express.urlencoded({ extended: true, limit: '20mb' }));
// Cookie parser, reading data from cookies into req.cookies
app.use(cookieParser());
// use security HTTP headers
app.use(helmet());

const limiter = rateLimit({
  max: 150,
  windowsMs: 1 * 60 * 1000,
  message: {
    status: 'fail',
    message: 'Too many request created from this IP, please try again after a minute',
  },
});

app.use('/api', limiter);
app.use(xss());
app.use(compression());

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Router
const userRouter = require('./routes/userRoute');
const authRouter = require('./routes/authRoute');

// Routes
app.use(`/api/v1/users`, userRouter);
app.use(`/api/v1/auth`, authRouter);

const swaggerJsDoc = require('swagger-jsdoc');

const swaggerUi = require('swagger-ui-express');
const swaggerOptions = require('./swagger.json');
const swaggerDocs = swaggerJsDoc(swaggerOptions);

app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// Handle route not found
app.all('*', (req, res, next) => {
  next(new AppError(`Can't find route ${req.originalUrl}`, 404));
});

// Error handle middleware
app.use(globalErrorHandler);

module.exports = app;
