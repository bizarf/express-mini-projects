const Todo = require("../models/todo");
const { body, validationResult } = require("express-validator");

exports.todo_all_get = async (req, res) => {
    const todos = await Todo.find({});

    if (todos) {
        res.json({ success: true, result: todos });
    } else {
        res.status(404).json({
            success: false,
            message: "Todo list not found",
        });
    }
};

exports.todo_single_get = async (req, res) => {
    const todo = await Todo.findById(req.params.id);

    if (todo) {
        res.json({ success: true, result: todo });
    } else {
        res.status(404).json({
            success: false,
            message: "That todo doesn't exist",
        });
    }
};

exports.todo_create_post = [
    body("title")
        .notEmpty()
        .withMessage("Please enter a title")
        .trim()
        .escape(),
    body("description").trim().escape(),
    body("important").toBoolean(),

    async (req, res) => {
        const body = req.body;

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                errors: errors.array({ onlyFirstError: true }),
            });
        }

        const todo = new Todo({
            title: body.title,
            description: body.description,
            important: body.important,
        });

        const newTodo = await todo.save();
        res.status(201).json(newTodo);
    },
];

exports.todo_remove_delete = async (req, res) => {
    const todo = await Todo.findById(req.params.id);

    if (todo === null) {
        res.status(404).json({
            success: false,
            message: "Todo not found",
        });
    } else {
        const deleteTodo = await Todo.findByIdAndDelete(req.params.id);
        if (deleteTodo) {
            res.json({ success: true, message: "Todo successfully deleted" });
        } else {
            res.status(422).json({
                success: false,
                error: "Something went wrong",
            });
        }
    }
};

exports.todo_update_put = [
    body("title")
        .notEmpty()
        .withMessage("Please enter a title")
        .trim()
        .escape(),
    body("description").trim().escape(),
    body("important").toBoolean(),

    async (req, res) => {
        const { title, description, important } = req.body;

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                errors: errors.array({ onlyFirstError: true }),
            });
        }

        const existingTodo = await Todo.findById(req.params.id);

        if (!existingTodo) {
            return res.status(404).json({
                success: false,
                message: "Todo not found",
            });
        }

        const updatedTodo = await Todo.findByIdAndUpdate(
            req.params.id,
            {
                title,
                description,
                important,
            },
            { new: true }
        );

        res.json({ success: true, result: updatedTodo });
    },
];
