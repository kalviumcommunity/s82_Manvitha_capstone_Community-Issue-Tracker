const express = require('express');
const User = require('../models/UserSchema');
const authRouter = express.Router();
const jwt=require('jsonwebtoken');

// Signup route
authRouter.post('/signup', async (req, res) => {
    try {
        const { mail, password } = req.body;

        if (!mail || !password) {
            return res.status(400).json({ message: "All fields are required" });
        }
       const userExists = await User.findOne({ mail });

        if (userExists) {
            return res.status(400).json({ message: "User already exists" });
        }
         const newUser = new User({ mail, password });
        await newUser.save();
          res.status(201).json({ message: "Signup Successful" });

    } catch (e) {
        console.error(e)
        res.status(500).json({ message: "Something went wrong", error: e.message });
    }
});


authRouter.get('/getusers', async (req, res) => {
    try {
        const users = await User.find(); 
        res.status(200).json(users);     
    } catch (e) {
        console.error(e);    
    }
});

authRouter.put('/:id',async(req,res)=>{
    try{
        const {mail,password}=req.body;
        const updatedUser=await User.findByIdAndUpdate(req.params.id,{mail,password},{new:true});
        if(!updatedUser){
            return res.status(404).json({message:"user not found"});
        }
        res.status(200).json({ message: "User updated successfully", updatedUser });
    }
    catch(e){
        console.log(e);
    }
})

authRouter.delete('/deleteUser/:id',async(req,res)=>{
    try{
       const deleteUser=await User.findByIdAndDelete(req.params.id);
       if(!deleteUser){
        return res.status(404).json({message:"User not found"});
       }
       res.status(200).json({message:"User deleted successfully",deleteUser});
    }
    catch(e){
        console.log(e);
    }
})


module.exports = authRouter;