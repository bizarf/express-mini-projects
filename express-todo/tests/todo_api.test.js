const { test, after, beforeEach, describe } = require("node:test");
const assert = require("node:assert");
const Todo = require("../models/todo");
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
        assert.strictEqual(
            response.body.result.length,
            helper.initialTodos.length
        );
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

            const contentsTitles = todosAtEnd.map((t) => t.title);
            const contentsDescription = todosAtEnd.map((t) => t.description);

            assert(contentsTitles.includes("Pet the cat"));
            assert(contentsDescription.includes("Meow"));
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

        test("todo without a description is added", async () => {
            const newTodo = {
                title: "Pet the cat",
                description: "",
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
    });

    describe("single todo get", () => {
        test("is successful", async () => {
            const todosAtStart = await helper.todosInDb();
            await api
                .get(`/api/todos/${todosAtStart[0].id}`)
                .expect(200)
                .expect("Content-Type", /application\/json/)
                .expect((res) => {
                    assert.strictEqual(res.body.success, true);
                    assert.strictEqual(res.body.result.title, "Buy milk");
                });
        });

        test("fails", async () => {
            await api
                .get(`/api/todos/66af9dc1185b2ca5e45675bf`)
                .expect(404)
                .expect("Content-Type", /application\/json/);
        });
    });

    describe("delete", () => {
        test("successful", async () => {
            const todosAtStart = await helper.todosInDb();
            await api
                .delete(`/api/todos/${todosAtStart[0].id}`)
                .expect(200)
                .expect("Content-Type", /application\/json/);

            const todosAtEnd = await helper.todosInDb();
            assert.strictEqual(
                todosAtEnd.length,
                helper.initialTodos.length - 1
            );

            const contents = todosAtEnd.map((r) => r.title);
            assert(!contents.includes(todosAtStart[0].title));
        });

        test("unsuccessful", async () => {
            await api
                .delete(`/api/todos/66af9dc1185b2ca5e45675bf`)
                .expect(404)
                .expect("Content-Type", /application\/json/);

            const todosAtEnd = await helper.todosInDb();
            assert.strictEqual(todosAtEnd.length, helper.initialTodos.length);
        });
    });

    describe("update", () => {
        test("successful", async () => {
            const todosAtStart = await helper.todosInDb();

            const updatedTodo = {
                title: "Pet the cat",
                description: "Meow",
                important: false,
            };

            await api
                .put(`/api/todos/${todosAtStart[0].id}`)
                .send(updatedTodo)
                .expect(200)
                .expect("Content-Type", /application\/json/)
                .expect((res) => {
                    assert.strictEqual(res.body.success, true);
                    assert.strictEqual(res.body.result.title, "Pet the cat");
                });

            const todosAtEnd = await helper.todosInDb();

            assert.strictEqual(todosAtEnd.length, helper.initialTodos.length);

            const contents = todosAtEnd.map((r) => r.title);
            assert(!contents.includes(todosAtStart[0].title));
        });
    });
});

after(async () => {
    closeDatabase();
});
