require("dotenv").config();
const express = require("express");
const app = express();
const cors = require("cors");
require("./db");
const authRoutes = require("./router/auth");
const userRoutes = require("./router/users");

// middlewares
app.use(express.json());
app.use(cors());

// routes
app.use("/api/users", userRoutes);
app.use("/api/auth", authRoutes);

// Export the app without starting the server
module.exports = app;
