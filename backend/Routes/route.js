const express=require('express');
const router=express.Router();
const Issue=require('../models/IssueSchema');

router.get('/getissues',async(req,res)=>{
    try{
        const problems=await Issue.find();
        res.status(200).json(problems)
    }
    catch(e){
        res.status(500).json(e);
    }
})


router.post('/create',async(req,res)=>{
    const{title,description,dueDate,priority}=req.body;
    if(!title||!description||!dueDate||!priority){
        return res.status(400).json({message:"all fields are required"});
    }
    try{
        const newIssue=new Issue({title,description,dueDate,priority});
        const savedIssue=await newIssue.save();
        res.status(200).json({message:"Issue created successfully"});
    }
    catch(e){
        console.log(e);
    }
})

router.put('/updatedIssues/:id',async(req,res)=>{
    try{
        const updatedIssue=await Issue.findByIdAndUpdate(req.params.id,{title,description,dueDate,priority},{new:true});
        if(!updatedIssue){
            res.status(404).json({message:"Issue not found"})
        }

        else{
            res.status(200).json({ message: "Issue updated successfully", updatedIssue });
        }
    }
    catch(e){
        console.log(e);
    }
})

router.delete('/deletedIssues/:id',async(req,res)=>{
    try{
        const deletedIssue=await Issue.findByIdAndDelete(req.params.id);
        if(!deletedUser){
            res.status(404).json({message:"Issue not found"})
        }
        else{
            res.status(200).json({message:"Issue deleted successfully",deletedIssue});
        }

    }
    catch(e){
        console.log(e);
    }
})


module.exports=router;