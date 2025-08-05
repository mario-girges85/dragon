const express = require("express");
const usersRouter = express.Router();
const usersController = require("../Controllers/users");
const { verifyAdmin, verifyToken } = require("../Controllers/tokenVerify");

// Define a route for login and JWT
usersRouter.post("/login", usersController.loginUser);

// Define a route for creating a new user
usersRouter.post("/new", usersController.newUser);

// Define a route for getting all users
usersRouter.get("/getall", usersController.getAllUsers);

// Define a route for deleting a user by ID
usersRouter.delete("/delete/:id", usersController.deleteUserById);

// Define a route for changing user role (must come before /:id route)
usersRouter.put("/:id/role", verifyAdmin, usersController.changeUserRole);

// Define a route for updating user profile
usersRouter.put(
  "/:id/editprofile",
  verifyToken,
  usersController.updateUserProfile
);

// Define a route for getting a user by ID
usersRouter.get("/:id", usersController.getUserById);

module.exports = usersRouter;
