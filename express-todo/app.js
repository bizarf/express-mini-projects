require("express-async-errors");
const config = require("./utils/config");
const express = require("express");
const app = express();
const cors = require("cors");
const morgan = require("morgan");
const helmet = require("helmet");
require("./utils/passportConfig.js");
const middleware = require("./utils/middleware");
const todosRouter = require("./routes/todosRoute.js");
const usersRouter = require("./routes/usersRoute.js");

// run the function to connect to mongodb
config.connectToDatabase();

app.use(cors());
app.use(express.json());
app.use(helmet());
if (process.env.NODE_ENV !== "production") {
    app.use(morgan("dev"));
} else {
    app.use(morgan("tiny"));
}

// routes go here
app.use("/api/todos", todosRouter);
app.use("/api/users", usersRouter);

// error handler if user attempts to access invalid route
app.use(middleware.unknownEndpoint);
app.use(middleware.errorHandler);

module.exports = app;
