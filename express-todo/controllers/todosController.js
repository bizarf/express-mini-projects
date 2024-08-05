const Todo = require("../models/todo");
const { body, validationResult } = require("express-validator");

exports.todo_all_get = async (req, res) => {
    const todos = await Todo.find({});

    if (todos) {
        return res.json({ success: true, result: todos });
    } else {
        return res.status(404).json({
            success: false,
            message: "Todo list not found",
        });
    }
};

exports.todo_single_get = async (req, res) => {
    const todo = await Todo.findById(req.params.id);

    if (todo) {
        return res.json({ success: true, result: todo });
    } else {
        return res.status(404).json({
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
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                errors: errors.array({ onlyFirstError: true }),
            });
        }

        const { title, description, important } = req.body;

        const todo = new Todo({
            title,
            description,
            important,
        });

        const newTodo = await todo.save();
        return res.status(201).json(newTodo);
    },
];

exports.todo_remove_delete = async (req, res) => {
    const todo = await Todo.findById(req.params.id);

    if (todo === null) {
        return res.status(404).json({
            success: false,
            message: "Todo not found",
        });
    } else {
        const deleteTodo = await Todo.findByIdAndDelete(req.params.id);
        if (deleteTodo) {
            return res.json({
                success: true,
                message: "Todo successfully deleted",
            });
        } else {
            return res.status(422).json({
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
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                errors: errors.array({ onlyFirstError: true }),
            });
        }

        const { title, description, important } = req.body;

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

        return res.json({ success: true, result: updatedTodo });
    },
];
