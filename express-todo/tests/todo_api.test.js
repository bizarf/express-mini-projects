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
});

after(async () => {
    closeDatabase();
});
