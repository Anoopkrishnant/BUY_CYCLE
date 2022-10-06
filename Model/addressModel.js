const mongoose =require('mongoose');
const Schema = mongoose.Schema


const addressSchema = new mongoose.Schema({
 address:{
    firstname:{
        type:String
    },
    lastname:{
        type:String
    },
    deliveryaddress:{
        type:String
    },
    email:{
        type:String
    },
    city:{
        type:String
    },
    district:{
       type:String
    },
    state:{
        type:String
    },
    pin:{
        type:Number
    },
    mobile:{
        type:Number
    },
    deliverymode:{
        type:String
    },
    },
    userId:{
        type:Schema.Types.ObjectId,
        ref:'users'
    }
},{timestamps:true})

const addressModel = mongoose.model('address',addressSchema)
module.exports = addressModel