const config = require("./utils/config");
const express = require("express");
const app = express();
const cors = require("cors");
const middleware = require("./utils/middleware");
const todosRouter = require("./controllers/todos");
const usersRouter = require("./controllers/users");

// run the function to connect to mongodb
config.connectToDatabase();

app.use(cors());
app.use(express.json());

// routes go here
app.use("/api/todos", todosRouter);
app.use("/api/users", usersRouter);

// error handler if user attempts to access invalid route
app.use(middleware.unknownEndpoint);

module.exports = app;
