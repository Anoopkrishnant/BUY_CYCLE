const mongoose =require('mongoose');
const Schema = mongoose.Schema

const cartSchema = new mongoose.Schema({

    userId:{
        type:Schema.Types.ObjectId,
        ref:'users'
    },
    cartItems:[{
        product:{
            type:Schema.Types.ObjectId,
            ref:'products'

        },
        quantity:Number
    }]


},{timestamps:true})


const cartModel = mongoose.model('cart',cartSchema)
module.exports = cartModel


