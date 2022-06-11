// export module
require("dotenv").config();

const express = require("express");
const app = express();

app.get("/", (req, res) => res.send("Hello world! " + process.env.NAMA));

module.exports = app;
