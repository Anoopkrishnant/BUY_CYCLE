const mongoose =require('mongoose');
const Schema = mongoose.Schema

const bannerSchema = new mongoose.Schema({
    bannername:{ 
        type:String
    },
    heading:{
        type:String
    },
    discription:{
        type:String
    },
    image:{
        type:Array
    }
    
},{timestamps:true})

const bannerModel = mongoose.model('banners',bannerSchema)
module.exports = bannerModel

