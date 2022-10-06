const adminModel=require('../Model/adminModel')
const Promise = require('promise')
const bcrypt=require('bcrypt');
const userModel = require('../Model/userModel');
const { resolve, reject } = require('promise');
const couponModel = require('../Model/couponModel');
const { response } = require('../app');
const orderModel = require('../Model/orderModel');
const productModel = require('../Model/productModel');
const objectid=require('mongodb').ObjectId

module.exports={

    adminlogin: (adminlogin) => {
        console.log("adminlogin");
        return new Promise(async (resolve, reject) => {
            let response = {
                status: false,
                adminnotfound: false

            }

            let admin = await adminModel.findOne({ email: adminlogin.email });
            console.log(adminlogin);
            if (admin) {
                bcrypt.compare(adminlogin.password, admin.password, (err, valid) => {
                    if (valid) {

                        console.log("login success")
                        response.admin = admin
                        response.status = true;
                       

                        resolve(response)
                        
                    } else {
                        resolve(response)
                        console.log(err);

                    }

                })
            } else {
                response.adminnotfound = true
                resolve(response)
            }
        })
    },
    getUserData: () => {
        return new Promise(async (resolve,reject) => {
          
            let users = await userModel.find({}).lean()

            resolve(users)
    
        })
    },
    block_User:(id)=>{

        return new Promise(async(resolve,reject)=>{
            let user=await userModel.findById({_id:objectid(id)})
            console.log(user);
           
                user.status=true
                await userModel.updateOne({_id:objectid(id)},user)
                resolve('sathanam kitti')
        })

    },
    activate_User:(id)=>{

        return new Promise(async(resolve,reject)=>{
            let user=await userModel.findById({_id:objectid(id)})
            console.log(user);
           
                user.status=false
                await userModel.updateOne({_id:objectid(id)},user)
                resolve('sathanam kitti')
        })

    },



    //------------------------------------------------------------------ Coupon Management --------------------------------------------------------------------//
    
    
    addNewCoupon: (couponData) => {
        return new Promise(async (resolve, reject) => {
         couponData.code = couponData.code.toUpperCase()
         let response = {}
         try{
            let code = await couponModel.findOne({code:couponData.code})
            if(code){
                response.couponExist = true
                resolve(response)
            }else{
                coupons = await couponModel({
                    name:couponData.name,
                    code:couponData.code,
                    percentage:couponData.percentage,
                    description:couponData.description
                })
                coupons.save().then((response) => {
                    response.couponExist = false
                    resolve(response)
                })
            }
         }catch (err) {
            console.log('error',err);
            reject(err)
         }
         
        })
     },



    GetCoupons:() => {
        return new Promise(async(resolve, reject) => {
         couponModel.find({}).lean().then((coupons) => {
            resolve(coupons)
         });
        });
    },


    EditCoupon: (data,id) => {
        return new Promise (async(resolve,reject) => {
            try {
                let codeById = await couponModel.findById(id);
                let code1 = await couponModel.findOne({code:data.code})
                if (codeById.code === data.code || !code1){
                    let code = data.code.toUpperCase();
                    couponModel.findByIdAndUpdate(id,{
                        name :data.name,
                        code: data.code,
                        description : data.description,
                        percentage : data.percentage
                    }).then((response) => {
                        resolve(response); 
                    })
                }
            }catch(err) {
                reject(err);
            }
        });
    },

    DeleteCoupon : (id) => {
        return new Promise (async(resolve,reject) => {
            try {
                couponModel.findByIdAndDelete(id).then((response) => {
                    resolve(response);
                })
            } catch (err) {
                reject(err);
            }
        });
    },


    GetOrderDetails: () => {
        return new Promise(async (resolve, reject) => {
            try {
                await orderModel.find()
                .populate('userId')
                .populate('orderItems.product')
                .populate('deliveryDetails')
                .sort({ createdAt: -1 })
                .lean().then((response) => {
                    resolve(response)
                })
            } catch (error) {
                console.log("errrerreoer", error);
                reject(error)
            }
        })
    },

    GetSingleOrder:(OrderId) => {
        return new Promise(async(resolve,reject) => {
            try {
                 await orderModel.findOne({_id:OrderId})
                 .populate('userId')
                .populate('orderItems.product')
                .populate('deliveryDetails')
                .sort({ createdAt: -1 })
                .lean().then((response) => {
                    resolve(response)
                    console.log(response);
                })
            } catch (error) {
                console.log("errrerreoer", error);
                reject(error)
            }
        })
    },

    ShipProduct: (orderid) => {
        return new Promise(async (resolve, reject) => {
            try {
                await orderModel.findByIdAndUpdate({ _id: orderid }, { productStatus: "shipped" }).then((response) => {
                    resolve(response)
                })
            } catch (error) {
                reject(error)
            }
        })
    },

    DeliverProduct: (orderid) => {
        return new Promise(async (resolve, reject) => {
            try {
                await orderModel.findByIdAndUpdate({ _id: orderid }, { productStatus: "deliverd" }).then((response) => {
                    resolve(response)
                })
            } catch (error) {
                reject(error)
            }
        })
    },

    CancelOrder: (orderid) => {
        return new Promise(async (resolve, reject) => {
            try {
                await orderModel.findByIdAndUpdate({ _id: orderid }, { productStatus: "Cancelled" }).then((response) => {
                    resolve(response)
                })
            } catch (error) {
                reject(error)
            }
        })
    },
    

    GetAllOrders: () => {
        return new Promise(async (resolve, reject) => {
            try {
                let AllOrders = await orderModel.find().lean()
                let orderLength = AllOrders.length
                resolve(orderLength)
            } catch (error) {
                console.log("errror", error)
                reject(error)
            }
        })
    },

    GetAllUsers: () => {
        return new Promise(async (resolve, reject) => {
            try {
                let AllUsers = await userModel.find().lean()
                let userLength = AllUsers.length
                resolve(userLength)
            } catch (error) {

            }
        })
    },

    GetAllProducts: () => {
        return new Promise(async(resolve,reject)  => {
            try{
                let count = 0;
                let allProducts = await productModel.find().lean()
                let productLength = allProducts.length
                resolve(productLength)
            } catch (err) {
              reject(err)
            }
        })
    },

    GetTotalIncome: () => {
        return new Promise(async (resolve, reject) => {
            try {
                let AllIncome = await orderModel.find().lean()
                let totalIncome = AllIncome.map(function (income) { return income.totalPrice });
                let total = totalIncome.reduce((acc, curr) => acc + parseInt(curr), 0)
                resolve(total)
            } catch (err) {
                console.log("error", err)
                reject(err)
            }
        })
    },

    AllPendingOrders: () => {
        return new Promise(async (resolve, reject) => {
            try {
                let pendingOrders = await orderModel.find().lean()
                let totalPending = pendingOrders.map(function (pending) { return pending.productStatus })
                let pendingCount = 0
                for (let i = 0; i < totalPending.length; i++) {
                    if (totalPending[i] === "pending") {
                        pendingCount = pendingCount + 1
                    }
                }
                resolve(pendingCount)

            } catch (err) {
                reject(err)
            }
        })
    },

    AllDeliverdOrders: () => {
        return new Promise(async (resolve, reject) => {
            try {
                let deliverdOrders = await orderModel.find().lean()
                let totalDeliver = deliverdOrders.map(function (deliver) { return deliver.productStatus })
                let deliverCount = 0
                for (let i = 0; i < totalDeliver.length; i++) {
                    if (totalDeliver[i] === "deliverd") {
                        deliverCount = deliverCount + 1
                    }
                }
                resolve(deliverCount)
            } catch (err) {
                reject(err)
            }
        })
    },

    AllShippedOrders: () => {
        return new Promise(async (resolve, reject) => {
            try {
                let shippedOrders = await orderModel.find().lean()
                let totalShipped = shippedOrders.map(function (Shipped) { return Shipped.productStatus })
                let ShippedCount = 0
                for (let i = 0; i < totalShipped.length; i++) {
                    if (totalShipped[i] === "shipped") {
                        ShippedCount = ShippedCount + 1
                    }
                }
                resolve(ShippedCount)

            } catch (err) {
                reject(err)
            }
        })
    },

    Stati: () => {
        return new Promise(async (resolve, reject) => {
            try {

                var dateArray = []
                for (let i = 0; i < 5; i++) {
                    var d = new Date();
                    d.setDate(d.getDate() - i)
                    var newdate = d.toISOString()
                    newdate = newdate.slice(0, 10)
                    dateArray[i] = newdate
                }
                var dateSale = []
                for (let i = 0; i < 5; i++) {
                    dateSale[i] = await orderModel.find({ newDate: dateArray[i] }).lean().count()
                }
                var status = {
                    dateSale: dateSale,
                    dateArray: dateArray
                }
                resolve(status)

            } catch (error) {
                console.log("errrror", error)
            }
        })
    }

}
