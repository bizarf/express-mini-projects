const express = require("express");
const router = express.Router();
const todosController = require("../controllers/todosController");

router.get("/", todosController.todo_all_get);

router.get("/:id", todosController.todo_single_get);

router.post("/", todosController.todo_create_post);

router.delete("/:id", todosController.todo_remove_delete);

router.put("/:id", todosController.todo_update_put);

module.exports = router;
