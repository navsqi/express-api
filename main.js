// export module
require("dotenv").config();

const express = require("express");
const morgan = require("morgan");
const app = express();

app.use(morgan("dev"));
app.get("/", (req, res) => res.send("Hello world! " + process.env.NAMA));
app.get("/test", (req, res) => res.send("test"));

module.exports = app;
