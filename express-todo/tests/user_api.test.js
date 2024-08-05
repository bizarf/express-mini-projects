const { test, after, beforeEach, describe } = require("node:test");
const assert = require("node:assert");
const User = require("../models/user");
const { closeDatabase } = require("../utils/config");
const supertest = require("supertest");
const app = require("../app");
const helper = require("./test_helper");

const api = supertest(app);

describe("there are initial users saved", () => {
    beforeEach(async () => {
        await User.deleteMany({});

        for (let user of helper.initialUsers) {
            const newUser = {
                username: user.username,
                name: user.name,
                password: user.password,
            };

            await api
                .post("/api/users/signup")
                .send(newUser)
                .expect(201)
                .expect("Content-Type", /application\/json/);
        }
    });

    test("users are returned in JSON", async () => {
        await api
            .get("/api/users")
            .expect(200)
            .expect("Content-Type", /application\/json/);
    });

    test("there are three users", async () => {
        const response = await api.get("/api/users");
        assert.strictEqual(
            response.body.result.length,
            helper.initialUsers.length
        );
    });

    describe("signup", () => {
        test("successful", async () => {
            const newUser = {
                username: "Binky235",
                name: "Binky",
                password: "827tg8q39pyqhjpyy9sv",
            };

            await api
                .post("/api/users/signup")
                .send(newUser)
                .expect(201)
                .expect("Content-Type", /application\/json/);

            const usersAtEnd = await helper.usersInDb();
            assert.strictEqual(
                usersAtEnd.length,
                helper.initialUsers.length + 1
            );

            const contentsUsername = usersAtEnd.map((u) => u.username);
            const contentsName = usersAtEnd.map((u) => u.name);

            assert(contentsUsername.includes("Binky235"));
            assert(contentsName.includes("Binky"));
        });

        test("unsuccessful", async () => {
            const newUser = {
                username: "",
                name: "Binky",
                password: "827tg8q39pyqhjpyy9sv",
            };

            await api
                .post("/api/users/signup")
                .send(newUser)
                .expect(400)
                .expect("Content-Type", /application\/json/);

            const usersAtEnd = await helper.usersInDb();
            assert.strictEqual(usersAtEnd.length, helper.initialUsers.length);

            const contentsName = usersAtEnd.map((u) => u.name);

            assert(!contentsName.includes("Binky"));
        });
    });

    describe("login", () => {
        test("successful", async () => {
            const user = {
                username: helper.initialUsers[0].username,
                password: helper.initialUsers[0].password,
            };

            await api
                .post("/api/users/login")
                .send(user)
                .expect(200)
                .expect("Content-Type", /application\/json/)
                .expect((res) => console.log(res.body));
        });

        test("unsuccessful", async () => {
            const user = {
                username: "root",
                password: "827tg8q39pyqhjpyy9sv",
            };

            await api
                .post("/api/users/login")
                .send(user)
                .expect(401)
                .expect("Content-Type", /application\/json/);
        });
    });
});

after(async () => {
    await User.deleteMany({});
    closeDatabase();
});
