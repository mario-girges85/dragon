const express = require("express");
const usersRouter = express.Router();
const usersController = require("../Controllers/users");

// Define a route for creating a new user
usersRouter.post("/new", usersController.newUser);

// Define a route for getting all users
usersRouter.get("/getall", usersController.getAllUsers);

// Define a route for deleting a user by ID
usersRouter.delete("/delete/:id", usersController.deleteUserById);

// Define a route for login and JWT
usersRouter.post("/login", usersController.loginUser);
module.exports = usersRouter;
