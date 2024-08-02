const Todo = require("../models/todo");

const initialTodos = [
    {
        title: "Buy milk",
        description: "Must buy milk",
        important: false,
    },
    {
        title: "Clean the car",
        description: "Take the car to the wash",
        important: false,
    },
    {
        title: "Bake a cake",
        description: "It's the wife's birthday next week",
        important: true,
    },
];

const todosInDb = async () => {
    const todos = await Todo.find({});
    return todos.map((todo) => todo.toJSON());
};

module.exports = {
    initialTodos,
    todosInDb,
};
