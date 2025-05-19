const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose"); 
require("dotenv").config();

const db = require("./db/db");
const issueRoutes = require("./Routes/route");
const authRouter = require("./Routes/authRoutes");
const google=require("./Routes/geminiApi");
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
app.use("/api/issues",issueRoutes); // protected issues route
app.use("/api/google",google);

// START SERVER
app.listen(port, () => {
  console.log(`Successfully connected at port ${port}`);
});
