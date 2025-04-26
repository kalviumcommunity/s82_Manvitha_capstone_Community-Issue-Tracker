const express = require('express');
const User = require('../models/UserSchema');
const authRouter = express.Router();

// Signup route
router.post('/signup', async (req, res) => {
    try {
        const { phoneNumber, password } = req.body;

        if (!phoneNumber || !password) {
            return res.status(400).json({ message: "All fields are required" });
        }

        const userExists = await User.findOne({ phoneNumber });

        if (userExists) {
            return res.status(400).json({ message: "User already exists" });
        }

        const newUser = new User({ phoneNumber, password });
        await newUser.save();

        res.status(201).json({ message: "Signup Successful" });

    } catch (e) {
        console.error(e)
        res.status(500).json({ message: "Something went wrong", error: e.message });
    }
});


router.get('/getusers', async (req, res) => {
    try {
        const users = await User.find(); 
        res.status(200).json(users);     
    } catch (e) {
        console.error(e);
        
    }
});

router.put('/:id',async(req,res)=>{
    try{
        const updatedUser=await User.findByIdAndUpdate(req.params.id,{phoneNumber,password},{new:true});
        if(!updatedUser){
            return res.status(404).json({message:"user not found"});
        }
        res.status(200).json({ message: "User updated successfully", updatedUser });

    }
    catch(e){
        console.log(e);
    }
})


module.exports = authRouter;