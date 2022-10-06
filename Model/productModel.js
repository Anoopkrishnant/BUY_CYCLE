const mongoose =require('mongoose');
const Schema = mongoose.Schema
  
const productSchema = new mongoose.Schema({
    productname:{
        type:String
    },
    stock:{
        type:Number,
        required:true,
        min:0,
        max:250
    },
    price:{
        type:Number
    },
    discount:{
        type:String
    },
    category:{
        type:Schema.Types.ObjectId,
        ref:'Categories',
      
    },
    discription:{
        type:String
    },
    image:{
        type:Array
    }

    
    
},{timestamps:true})

const productModel = mongoose.model('products',productSchema)
module.exports = productModel