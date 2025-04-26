const express = require("express");
const cors = require("cors");
const mongoose = require('mongoose');
require('dotenv').config();
const db = require("./db/db");

const router = require('./Routes/route');
const authRouter = require('./Routes/authRoutes');

const app = express();
const port = 3551;

// MIDDLEWARE — must come first!
app.use(cors());
app.use(express.json()); 

// Connect to DB
db();

// ROUTES
app.use("/auth", authRouter);
app.use("/routes", router);

app.listen(port, () => {
    console.log(`successfully connected at ${port}`);
});
