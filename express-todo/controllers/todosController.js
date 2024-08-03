const Todo = require("../models/todo");
const asyncHandler = require("express-async-handler");
const { body, validationResult } = require("express-validator");

exports.todo_all_get = [
    asyncHandler(async (req, res) => {
        const todos = await Todo.find({});
        res.json(todos);
    }),
];

exports.todo_create_todo_post = [
    asyncHandler(async (req, res) => {
        const body = req.body;

        const todo = new Todo({
            title: body.title,
            description: body.description,
            important: body.important,
        });

        const newTodo = await todo.save();
        res.status(201).json(newTodo);
    }),
];
