const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();

const db = require("./db/db");
const issueRoutes = require("./Routes/route");
const authRouter = require("./Routes/authRoutes");
const authenticateToken = require("./middleware/authMiddleWare");

const app = express();
const port = 3551;

// MIDDLEWARE
app.use(cors());
app.use(express.json());

// DATABASE CONNECTION
db();

// ROUTES
app.use("/auth", authRouter); // signup, login, etc.
app.use("/api/issues", authenticateToken, issueRoutes); // protected issues route

// START SERVER
app.listen(port, () => {
  console.log(`Successfully connected at port ${port}`);
});
