const express=require("express");
const cors=require("cors");
const db=require("./db/db");
require('dotenv').config();
const port=3551;
const app=express();
app.use(express.json());
db();
app.use(cors());






app.use("/routes",router);
app.listen(port,()=>{
     console.log(`successfully connected at ${port}`);
});