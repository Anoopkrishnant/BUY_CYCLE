const mongoose = require('mongoose');

const Schema = mongoose.Schema;
const orderSchema = new mongoose.Schema({
    userId:{
        type: Schema.Types.ObjectId,
        ref: 'users',
    },
    orderItems:[
        {
            product: {
                type: Schema.Types.ObjectId,
                ref: 'products',
            },
            quantity: {
                type: Number,
            }
        }
    ],
    totalPrice: {
        type: Number,
    },
    
    deliveryDetails:{
        type: Schema.Types.ObjectId,
        ref: 'address',
    },
    paymentDetails:{
        type: String,
    },
    orderStatus:{
        type: Boolean,
    },
    deliveryStatus:{
        type: String,
    },
    orderStatus:Boolean,
    discount:String,
    grandTotal:String,
    productStatus:String,
    newDate:String

},
{
    timestamps: true,
})

const orderModel = mongoose.model('order',orderSchema);
module.exports = orderModel