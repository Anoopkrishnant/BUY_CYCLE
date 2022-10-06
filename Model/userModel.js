const mongoose =require('mongoose');
const bcrypt = require ('bcrypt')

const userSchema = new mongoose.Schema({
    name:String,
    email:{
        type:String,
        unique:true
    },
    mobile:Number,
    password:String,
    status:Boolean,
    address:String,
    DOB:String,
    gender:String,
    location:String,
    hintname:String,
    image:{
        
    }


   


},{timestamps:true});
// userSchema.pre('save',async function(next){
//     try{
//          const hash=await bcrypt.hash(this.password,10)
//          this.password=hash
//          next();
//     }catch(err){
//         next(err);

//     }
// })

const userModel= mongoose.model('users',userSchema)
module.exports = userModel;