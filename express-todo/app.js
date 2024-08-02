const config = require("config");
const express = require("express");
const app = express();
const cors = require("cors");

// run the function to connect to mongodb
config.connectToDatabase();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
    res.send("Hello, World");
});

module.exports = app;
