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

module.exports=router;