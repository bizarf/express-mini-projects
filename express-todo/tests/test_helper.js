const Todo = require("../models/todo");
const User = require("../models/user");

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

const initialUsers = [
    {
        username: "root",
        name: "Admin",
        password: "f3f9u0hu03df9u0ugg",
    },
    {
        username: "linda3487",
        name: "Lin",
        password: "0ajyu5u90uggjkjgkl",
    },
    {
        username: "jay3237",
        name: "Jerry",
        password: "89g8oijgeou8uyajjjdb",
    },
];

const todosInDb = async () => {
    const todos = await Todo.find({});
    return todos.map((todo) => todo.toJSON());
};

const usersInDb = async () => {
    const users = await User.find({});
    return users.map((user) => user.toJSON());
};

module.exports = {
    initialTodos,
    todosInDb,
    initialUsers,
    usersInDb,
};
