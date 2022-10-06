const mongoose = require('mongoose')

const Schema = mongoose.Schema

const wishListSchema = new mongoose.Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'users',
    },
    wishListItems: [{
        product:{
        type: Schema.Types.ObjectId,
        ref: 'products'}
    }],
},
{
    timestamps: true,
}
)

const wishlistModel = mongoose.model('wishlist',wishListSchema);
module.exports =  wishlistModel