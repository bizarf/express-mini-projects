const { test, after, beforeEach, describe } = require("node:test");
const assert = require("node:assert");
const Todo = require("../models/todo");
const mongoose = require("mongoose");
const { closeDatabase } = require("../utils/config");
const supertest = require("supertest");
const app = require("../app");
const helper = require("./test_helper");

const api = supertest(app);

describe("there are initial todo items saved", () => {
    beforeEach(async () => {
        await Todo.deleteMany({});

        await Todo.insertMany(helper.initialTodos);
    });

    test("todo items are returned in JSON", async () => {
        await api
            .get("/api/todos")
            .expect(200)
            .expect("Content-Type", /application\/json/);
    });

    test("there are three todo items", async () => {
        const response = await api.get("/api/todos");
        assert.strictEqual(response.body.length, helper.initialTodos.length);
    });

    describe("adding a new todo item", () => {
        test("successfully add one item", async () => {
            const newTodo = {
                title: "Pet the cat",
                description: "Meow",
                important: false,
            };

            await api
                .post("/api/todos")
                .send(newTodo)
                .expect(201)
                .expect("Content-Type", /application\/json/);

            const todosAtEnd = await helper.todosInDb();
            assert.strictEqual(
                todosAtEnd.length,
                helper.initialTodos.length + 1
            );

            const contents = todosAtEnd.map((t) => t.title);

            assert(contents.includes("Pet the cat"));
        });

        test("todo without a title is not added", async () => {
            const newTodo = {
                title: "",
                description: "Meow",
                important: false,
            };

            await api
                .post("/api/todos")
                .send(newTodo)
                .expect(400)
                .expect("Content-Type", /application\/json/);

            const todosAtEnd = await helper.todosInDb();
            assert.strictEqual(todosAtEnd.length, helper.initialTodos.length);
        });
    });
});

after(async () => {
    closeDatabase();
});
