const express = require("express");
const cors = require("cors");
const session = require("express-session");
const { sequelize, User, DeliveryOrder } = require("./models");
const usersRouter = require("./Routes/users"); // adjust path if needed

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(express.urlencoded({ extended: false }));

app.use("/users", usersRouter);

async function start() {
  try {
    await sequelize.sync({ alter: true }); // or { force: true } in dev to reset
    app.listen(port, () => {
      console.log(`Server running at http://localhost:${port}`);
    });
  } catch (err) {
    console.error("Failed to start:", err);
  }
}

start();
