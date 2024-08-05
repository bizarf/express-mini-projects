const { test, after, beforeEach, describe } = require("node:test");
const assert = require("node:assert");
const Todo = require("../models/todo");
const User = require("../models/user");
const { closeDatabase } = require("../utils/config");
const supertest = require("supertest");
const app = require("../app");
const helper = require("./test_helper");

const api = supertest(app);

describe("there are initial todo items saved", () => {
    beforeEach(async () => {
        await Todo.deleteMany({});
        await User.deleteMany({});

        const newUser = {
            username: helper.initialUsers[0].username,
            name: helper.initialUsers[0].name,
            password: helper.initialUsers[0].password,
        };

        await api
            .post("/api/users/signup")
            .send(newUser)
            .expect(201)
            .expect("Content-Type", /application\/json/);

        const login = await api.post("/api/users/login").send({
            username: helper.initialUsers[0].username,
            password: helper.initialUsers[0].password,
        });

        for (let todo of helper.initialTodos) {
            const newTodo = {
                title: todo.title,
                description: todo.description,
                important: todo.important,
            };

            await api
                .post("/api/todos")
                .set("Authorization", `Bearer ${login.body.token}`)
                .send(newTodo)
                .expect(201)
                .expect("Content-Type", /application\/json/);
        }
    });

    test("todo items are returned in JSON", async () => {
        const login = await api.post("/api/users/login").send({
            username: helper.initialUsers[0].username,
            password: helper.initialUsers[0].password,
        });

        await api
            .get("/api/todos")
            .set("Authorization", `Bearer ${login.body.token}`)
            .expect(200)
            .expect("Content-Type", /application\/json/);
    });

    test("there are three todo items", async () => {
        const login = await api.post("/api/users/login").send({
            username: helper.initialUsers[0].username,
            password: helper.initialUsers[0].password,
        });

        const response = await api
            .get("/api/todos")
            .set("Authorization", `Bearer ${login.body.token}`);
        assert.strictEqual(
            response.body.result.length,
            helper.initialTodos.length
        );
    });

    describe("adding a new todo item", () => {
        test("successfully add one item", async () => {
            const login = await api.post("/api/users/login").send({
                username: helper.initialUsers[0].username,
                password: helper.initialUsers[0].password,
            });

            const newTodo = {
                title: "Pet the cat",
                description: "Meow",
                important: false,
            };

            await api
                .post("/api/todos")
                .set("Authorization", `Bearer ${login.body.token}`)
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
            const login = await api.post("/api/users/login").send({
                username: helper.initialUsers[0].username,
                password: helper.initialUsers[0].password,
            });

            const newTodo = {
                title: "",
                description: "Meow",
                important: false,
            };

            await api
                .post("/api/todos")
                .set("Authorization", `Bearer ${login.body.token}`)
                .send(newTodo)
                .expect(400)
                .expect("Content-Type", /application\/json/);

            const todosAtEnd = await helper.todosInDb();
            assert.strictEqual(todosAtEnd.length, helper.initialTodos.length);
        });

        test("todo without a description is added", async () => {
            const login = await api.post("/api/users/login").send({
                username: helper.initialUsers[0].username,
                password: helper.initialUsers[0].password,
            });

            const newTodo = {
                title: "Pet the cat",
                description: "",
                important: false,
            };

            await api
                .post("/api/todos")
                .set("Authorization", `Bearer ${login.body.token}`)
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
            const login = await api.post("/api/users/login").send({
                username: helper.initialUsers[0].username,
                password: helper.initialUsers[0].password,
            });

            const todosAtStart = await helper.todosInDb();
            await api
                .get(`/api/todos/${todosAtStart[0].id}`)
                .set("Authorization", `Bearer ${login.body.token}`)
                .expect(200)
                .expect("Content-Type", /application\/json/)
                .expect((res) => {
                    assert.strictEqual(res.body.success, true);
                    assert.strictEqual(res.body.result.title, "Buy milk");
                });
        });

        test("fails", async () => {
            const login = await api.post("/api/users/login").send({
                username: helper.initialUsers[0].username,
                password: helper.initialUsers[0].password,
            });

            await api
                .get(`/api/todos/66af9dc1185b2ca5e45675bf`)
                .set("Authorization", `Bearer ${login.body.token}`)
                .expect(404)
                .expect("Content-Type", /application\/json/);
        });
    });

    describe("delete", () => {
        test("successful", async () => {
            const login = await api.post("/api/users/login").send({
                username: helper.initialUsers[0].username,
                password: helper.initialUsers[0].password,
            });

            const todosAtStart = await helper.todosInDb();

            await api
                .delete(`/api/todos/${todosAtStart[0].id}`)
                .set("Authorization", `Bearer ${login.body.token}`)
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
            const login = await api.post("/api/users/login").send({
                username: helper.initialUsers[0].username,
                password: helper.initialUsers[0].password,
            });

            await api
                .delete(`/api/todos/66af9dc1185b2ca5e45675bf`)
                .set("Authorization", `Bearer ${login.body.token}`)
                .expect(404)
                .expect("Content-Type", /application\/json/);

            const todosAtEnd = await helper.todosInDb();
            assert.strictEqual(todosAtEnd.length, helper.initialTodos.length);
        });
    });

    describe("update", () => {
        test("successful", async () => {
            const login = await api.post("/api/users/login").send({
                username: helper.initialUsers[0].username,
                password: helper.initialUsers[0].password,
            });

            const todosAtStart = await helper.todosInDb();

            const updatedTodo = {
                title: "Pet the cat",
                description: "Meow",
                important: false,
            };

            await api
                .put(`/api/todos/${todosAtStart[0].id}`)
                .set("Authorization", `Bearer ${login.body.token}`)
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
