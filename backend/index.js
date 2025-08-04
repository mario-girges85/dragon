const express = require("express");
const usersRouter = require("./Routes/users");
const orderRouter = require("./Routes/order");
const app = express();
const port = 3000;
const db = require("./util/db");
const sequelize = require("./util/db");
const cors = require("cors");
const path = require("path");
const session = require("express-session");
const { ensureUserTable } = require("./models/user");

app.use(express.json());
app.use(
  cors({
    origin: "http://localhost:5173", // must match frontend URL
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.urlencoded({ extended: false }));

app.use("/users", usersRouter);
app.use("/orders", orderRouter);
sequelize
  .sync()
  .then((res) => {
    // console.log("Database synchronized : ", res);
  })
  .catch((err) => {
    console.error("Database synchronization failed:", err);
  });

app.listen(port, () => {
  ensureUserTable();
  console.log(`Server is running on http://localhost:${port}`);
});
