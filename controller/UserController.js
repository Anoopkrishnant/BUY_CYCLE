const userModel= require('../Model/userModel')
const Promise = require('promise')
const bcrypt=require('bcrypt')
const cartModel = require('../Model/cartModel')
const addressModel = require('../Model/addressModel')
const { response } = require('../app')
const { ObjectId } = require('bson');
const productModel = require('../Model/productModel')

module.exports = {
    Dosignup:(userdata) => {
        console.log(userdata,'user in');
        return new Promise(async (resolve, reject) => {



        let user =await userModel.findOne({ email: userdata.email });
        const state = {
            userexist: false,
            user:null
        }
        if (!user) {
            userdata.password = await bcrypt.hash(userdata.password, 10);
           userModel.create(userdata).then((data) => {
                state.userexist =false
                state.user=userdata
                console.log(userdata,"function",data);
                console.log('insert');
                resolve(state)
            })
        } else {
            state.userexist = true
            resolve(state)
            
        }

    })

},
    Dologin: (loginDetails) => {

        return new Promise(async (resolve,reject) => {
            console.log
            let response = {
                status: false,
                usernotfound: false
    
            }
            let user = await userModel.findOne({ email: loginDetails.email });
            if (user) {
                bcrypt.compare(loginDetails.password, user.password, (err, status) => {
                    if (status) {
    
                        console.log("login success")
                        response.user = user
                        response.status = true;
                        response.email=user.email
    
                        resolve(response)
                        
                    } else {
                        console.log("login failed")
                        resolve({status:false})
                      
    
                    }
    
                })
            } else {
                response.usernotfound = true
                resolve({status:false})
            }
        })
    
     },

     GetToCheckout: (uid) =>{
        return new Promise (async(resolve,reject) => {
            try{
                let check = await cartModel.find({userId:uid}).populate("cartItems.product").lean()
                resolve(check)
            }catch(err){
                console.log('error',err);
                reject(err)
            }
        })
     },

     addAddress:(addressDetails,userid) =>{
        console.log('Happy Onam');
        console.log(addressDetails);
        return new Promise(async (resolve, reject) => {
            try{
             let address = new addressModel({
                    address:{
                    firstname:addressDetails.firstname,
                    lastname:addressDetails.lastname,
                    deliveryaddress:addressDetails.deliveryaddress,
                    email:addressDetails.email,
                    mobile:addressDetails.mobile,
                    city:addressDetails.city,
                    state:addressDetails.state,
                    pin:addressDetails.pin,
                    district:addressDetails.district,
                    deliverymode:addressDetails.deliverymode
                    },
                    userId:userid
                })
                address.save().then((response) =>{
                    resolve(response)
                })
               
                
            } catch(err){
             console.log('erroe',err);
             reject(err)
            }
     })

     },
     Getaddress:(userid) => {
        return new Promise(async(resolve,reject)  => {
        try{
            await addressModel.find({userId:ObjectId(userid)}).lean().then((response) =>{
             resolve(response)   
            })
        }catch(err){
            reject(err)
        }
        })
     },


//--------------------------------------------------------------------- User-Profile ------------------------------------------------------------------------//
     UserProfile: (Userid) => {
        console.log("iddddddddddddddddddd  ",Userid)
        return new Promise (async(resolve,reject) => {
            try {
                await userModel.findById({_id:Userid}).lean().then((userData) => {
                    resolve(userData)
                })
            } catch(err) {
                reject(err)
            }
        })
     },
       
     EditProfile:(userData,Userid) => {
        return new Promise(async(resolve,rejest) => {
            try {
                await userModel.findByIdAndUpdate({_id:ObjectId(Userid)}, {
                    name:userData.name,
                    email:userData.email,
                    mobile:userData.mobile,
                    address:userData.address,
                    DOB:userData.DOB,
                    gender:userData.gender,
                    location:userData.location,
                    hintname:userData.hintname,
                    image:userData.image
                })
                .then((response) => {
                    resolve(response)
                })
            } catch(err) {
                console.log(err ,"err");
                reject(err)
            }
        })
     },

     CategoryProducts: (categoryid) => {
        console.log(categoryid,'id');
        return new Promise(async (resolve, reject) => {
          try {
            await productModel.find({ category: categoryid }).populate('category').lean().then((response) => {
                console.log(response);
              resolve(response)
              
            })
          } catch (error) {
            reject(error)
          }
        })
      },




    
    }