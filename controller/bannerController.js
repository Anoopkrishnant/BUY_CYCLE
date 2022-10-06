const { resolve, reject } = require('promise')
const {ObjectId} = require('bson')
const bannerModel = require ('../Model/bannerModel')


module.exports = {

addBanner: (bannerData) => {
    return new Promise(async(resolve,reject) => {
        await bannerModel.create(bannerData).then((data)=>{
            console.log("add banner post",data);
            resolve(data)
        })
    })

},



 ListBanners:() =>{
    return new Promise (async(resolve,reject) => {
        const bannerDetails = await bannerModel.find({}).lean()
        console.log(bannerDetails);
        resolve(bannerDetails)
    });
 },

 DeleteBanner:(id) =>{
    return new Promise (async(resolve,reject) => {
        await bannerModel.findByIdAndDelete({_id:ObjectId(id)}).then((data) => {
            resolve()
        }).catch((err)=>{
            reject()
        })
    });
 }



}


