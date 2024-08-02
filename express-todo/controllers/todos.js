const todosRouter = require("express").Router();
const Todo = require("../models/todo");

todosRouter.get("/", async (req, res) => {
    const todos = await Todo.find({});
    res.json(todos);
});

module.exports = todosRouter;
