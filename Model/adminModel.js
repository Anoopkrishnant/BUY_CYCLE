const mongoose =require('mongoose');
const bcrypt = require ('bcrypt')

const adminSchema = new mongoose.Schema({
    email:{
        type:String,
        unique:true
    },
    
    password:String


});

const adminModel= mongoose.model('admins',adminSchema)
module.exports = adminModel;