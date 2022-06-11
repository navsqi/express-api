const app = require("./main.js");

// Server
const port = process.env.PORT || 5000;

const server = app.listen(port, () => console.log(`Server is listening on port ${port}`));

process.on("unhandledRejection", (err) => {
  console.log(err.message);
  server.close(() => {
    process.exit(1);
  });
});

process.on("SIGTERM", () => {
  server.close(() => {});
});
