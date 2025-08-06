const express = require("express");
const usersRouter = express.Router();
const usersController = require("../Controllers/users");
const { verifyAdmin, verifyToken } = require("../Controllers/tokenVerify");

// Define a route for login and JWT
usersRouter.post("/login", usersController.loginUser);

// Define a route for creating a new user
usersRouter.post("/new", usersController.newUser);
// Alias for frontend compatibility
usersRouter.post("/register", usersController.newUser);

// Logout route (stateless)
usersRouter.post("/logout", usersController.logoutUser);

// Get current user's profile
usersRouter.get("/profile", verifyToken, usersController.getProfile);

// Update current user's profile
usersRouter.put("/update-profile", verifyToken, usersController.updateProfile);

// Define a route for getting all users (admin only)
usersRouter.get("/getall", verifyAdmin, usersController.getAllUsers);

// Define a route for deleting a user by ID (admin only)
usersRouter.delete("/delete/:id", verifyAdmin, usersController.deleteUserById);

// Define a route for changing user role (must come before /:id route)
usersRouter.put("/:id/role", verifyAdmin, usersController.changeUserRole);

// Define a route for updating user profile (by id, admin or self)
usersRouter.put(
  "/:id/editprofile",
  verifyToken,
  usersController.updateUserProfile
);

// Define a route for getting a user by ID (protected)
usersRouter.get("/:id", verifyToken, usersController.getUserById);

module.exports = usersRouter;
