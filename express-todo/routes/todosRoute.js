const express = require("express");
const router = express.Router();
const todosController = require("../controllers/todosController");
const passport = require("passport");

router.get(
    "/",
    passport.authenticate("jwt", { session: false }),
    todosController.todo_all_get
);

router.get(
    "/:id",
    passport.authenticate("jwt", { session: false }),
    todosController.todo_single_get
);

router.post(
    "/",
    passport.authenticate("jwt", { session: false }),
    todosController.todo_create_post
);

router.delete(
    "/:id",
    passport.authenticate("jwt", { session: false }),
    todosController.todo_remove_delete
);

router.put(
    "/:id",
    passport.authenticate("jwt", { session: false }),
    todosController.todo_update_put
);

module.exports = router;
