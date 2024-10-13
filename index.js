require("dotenv").config();
const express = require("express");
const app = express();
const cors = require("cors");
require("./db");
const authRoutes = require("./router/auth");
const userRoutes = require("./router/users");

// middlewares
app.use(cors({
    origin: 'http://localhost:3000', 
  }));
app.use(express.json());
  
 
//   app.get("/g",(req, res) => {
//     console.log("hi");
    
//   })
// routes
app.use("/api/users", userRoutes);
app.use("/api/auth", authRoutes);

// Export the app without starting the server
module.exports = app;
