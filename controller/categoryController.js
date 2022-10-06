const {ObjectID} = require('bson')
const { resolve, reject } = require('promise');
const { response } = require('../app');
const categoryModel = require('../Model/categoryModel');



module.exports = {




    Addcategory: (categorydata) => {

        return new Promise(async (resolve, reject) => {
             console.log(categorydata);
            categorydata.categoryname =categorydata.categoryname.toUpperCase()
            let category = await categoryModel.findOne({ categoryname: categorydata.categoryname }).lean()
            let response = {
                exist: false
            }
            if (!category) {
                categoryModel.create(categorydata).then((date) => {
                    response.exist = false
                    response.category = categorydata
                    resolve(response)
                }).catch((err) => {
                    console.log("error created", err);
                    resolve(err)
                })
            } else {
                response.exist = true
                response.category = categorydata
                resolve(response)
            }
        })
    },


    Getcategory: () => {
        return new Promise(async (resolve, reject) => {
            let category = await categoryModel.find({}).sort({ createdAt: -1 }).lean()
            resolve(category)
         
        })
    },


    Deletecategory:(categoryId)=>{
        return new Promise((resolve,reject)=>{
            categoryModel.findByIdAndDelete({_id: ObjectID(categoryId)}).then((response)=>{
                console.log(ObjectID(categoryId));
                resolve(response)
            })
        })
    },
    
    getDataUpdate:(categoryId)=>{
        console.log(categoryId);
        return new Promise (async(resolve,reject)=>{
            let categorydata = await categoryModel.findOne({_id:ObjectID(categoryId) }).lean()
            // console.log(categorydata);
            resolve(categorydata)
        })
    },
    

    UpdateCategory:(categoryId,categoryDetails)=>{
        return new Promise(async(resolve,reject)=>{
           const cat= await categoryModel.findOne({_id:ObjectID(categoryId) })
           console.log(cat);
           console.log(categoryDetails);
          await categoryModel.findByIdAndUpdate({_id:ObjectID(categoryId) },{$set:{categoryname:categoryDetails.categoryname}})
            resolve()
        })
        
    }
    



}