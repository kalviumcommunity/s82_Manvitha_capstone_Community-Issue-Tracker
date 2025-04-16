const mongoose=require('mongoose');
const db=async()=>{
    try{
        mongoose.connect=(process.env.MONGO);
        console.log("connected");
    }
    catch(e){
        console.log(e);
    }
}

module.exports=db;
    