const express = require("express");
const router = express.Router();
const todosController = require("../controllers/todosController");

router.get("/", todosController.todo_all_get);

router.post("/", todosController.todo_create_todo_post);

module.exports = router;
