require('dotenv').config();

const loggerFile = require('./utils/winstonLog');

const app = require('./main.js');

// Server
const port = process.env.PORT || 5000;

const server = app.listen(port, () => console.log(`Server is listening on port ${port}`));

process.on('unhandledRejection', (err) => {
  loggerFile.error(err.message);
  console.log(err.message);
  server.close(() => {
    process.exit(1);
  });
});

process.on('SIGTERM', () => {
  loggerFile.info('👋 SIGTERM RECEIVED. Shutting down gracefully');
  server.close(() => {
    loggerFile.info('💥 Process terminated!');
  });
});
