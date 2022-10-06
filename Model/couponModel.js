const mongoose = require('mongoose');

const Schema = mongoose.Schema ;

const couponSchema = new mongoose.Schema({
    name: {
        type: String,
    },
    code:{
        type: String,
        unique:true
    },
    description:{
        type: String,
    },
    percentage:{
        type: Number,
    },
    maxLimit:{
        type:Number,
        require:true
    },
    minPurchase:{
        type:Number,
        require:true
    },
    userId:{
        type: Schema.Types.ObjectId,
        ref: 'users',
    },
},
{
    timestamps: true
});

const couponModel = mongoose.model('coupons',couponSchema)
module.exports = couponModel;