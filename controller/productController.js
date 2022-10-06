const { ObjectId } = require('bson');
const { resolve, reject } = require('promise');
const { UserBindingPage } = require('twilio/lib/rest/ipMessaging/v2/service/user/userBinding');
const { response } = require('../app');
const cartModel = require('../Model/cartModel');
const categoryModel = require('../Model/categoryModel');
const couponModel = require('../Model/couponModel');
const orderModel = require('../Model/orderModel');
const productModel = require('../Model/productModel');
const wishlistModel = require('../Model/wishlistModel');
const Razorpay = require('razorpay');

var instance = new Razorpay({
    key_id: 'rzp_test_zWZr8w5XEgbWD6',
    key_secret: process.env.Razorpay_key_secret
  });


Helpers = {




    ListCategory: () => {
        return new Promise(async (resolve, reject) => {
            let category = await categoryModel.find({}).lean()
            resolve(category)

        });
    },






    addProduct: (productData) => {
        return new Promise(async (resolve, reject) => {
            await productModel.create(productData).then((data) => {
                console.log(data);
                resolve(data)

            });


        });

    },

    viewProduct: () => {
        return new Promise(async (resolve, reject) => {
            const productDetails = await productModel.find({}).populate('category').lean()
            // console.log(productDetails);
            resolve(productDetails)
        });

    },




    DeleteProduct: (id) => {
        return new Promise(async (resolve, reject) => {
            await productModel.deleteOne({ _id: ObjectId(id) }).then((data) => {
                resolve()

            }).catch((err) => {
                reject()
            })
        })
    },




    EditProduct: (id) => {
        console.log('murukku+urumb=dipin')
        return new Promise(async (resolve, reject) => {
            const product = await productModel.findOne({ _id: ObjectId(id) }).populate('category').lean()
            console.log(product);
            resolve(product)
        })
    },



    GetProduct: () => {
        return new Promise(async (resolve, reject) => {
            let listProduct = await productModel.find({}).lean()
            resolve(listProduct)

        })
    },




    UpdateProduct: (data) => {
        return new Promise(async (resolve, reject) => {
            let product = await productModel.findById(data.id);
            let status = {
                check: false,
            };
            if (!product) {
                status.check = true;
                resolve(data);
            } else {
                productModel.findByIdAndUpdate(data.id, {

                    productname: data.productname,
                    price: data.price,
                    discount: data.discount,
                    category: data.category,
                    discription: data.discription

                }).then((data) => {
                    resolve(data)
                })
            }

        });
    },



    GetOneProduct: (id) => {
        console.log(id);
        return new Promise(async (resolve, reject) => {
            let singleProduct = await productModel.findOne({ _id: ObjectId(id) }).populate('category').lean()
            console.log(singleProduct);
            resolve(singleProduct)

        })
    },

    //------------------------------------------------------------------ ADD To CART --------------------------------------------------------------------//


    AddToCart: (proId, userid) => {
        const response = {
            duplicate: false
        }
        return new Promise(async (resolve, reject) => {

            let cart = await cartModel.findOne({ userId: userid })
            if (cart) {
                let cartProduct = await cartModel.findOne({ userId: userid, 'cartItems.product': proId })
                if (cartProduct) {
                    cartModel.updateOne({ userId: userid, 'cartItems.product': proId }, { $inc: { 'cartItems.$.quantity': 1 } }).then((response) => {
                        response.duplicate = true
                        resolve(response)
                    })

                } else {
                    let cartArray = { product: proId, quantity: 1 }
                    cartModel.findOneAndUpdate({ userId: userid },
                        {
                            $push: { cartItems: cartArray }

                        }).then((data) => {
                            resolve(response)
                        })
                }
            } else {
                let quantity = 1
                // let total = product.price
                let cart = new cartModel({
                    userId: userid,
                    cartItems: [{
                        product: proId,
                        quantity

                    }]
                })
                cart.save().then((data) => {
                    resolve(response)
                })
            }
        })

    },




    GetCount: (userid) => {
        return new Promise(async (resolve, reject) => {
            try {
                
           
            let count = 0
            let cart = await cartModel.findOne({ userId: userid })
            if (cart) {
                count = cart.cartItems.length
                console.log("count  ",count)
                resolve(count)
            }
        } catch (error) {
               console.log("error ",error) 
        }
            
        })
    },




    GetCartItem: (userid) => {
        return new Promise(async (resolve, reject) => {
            const response = {};
            let cart = await cartModel.findOne({ userId: userid, }).populate('cartItems.product').lean()


            if (cart) {

                if (cart.cartItems.length > 0) {
                    response.cartempty = false
                    response.cart = cart
                    resolve(response)

                } else {

                    response.cartempty = true
                    response.cart = cart
                    resolve(response)
                }

            } else {
                response.cartempty = true
                resolve(response)
            }
        })


    },




    IncQty: (proId, userid) => {

        return new Promise(async (resolve, reject) => {
            await cartModel.updateOne({ userId: userid, "cartItems.product": proId }, { $inc: { "cartItems.$.quantity": 1 } }).then(async (response) => {
                let cart = await cartModel.findOne({ userId: userid })

                let quantity
                for (let i = 0; i < cart.cartItems.length; i++) {
                    if (cart.cartItems[i].product == proId) {
                        quantity = cart.cartItems[i].quantity
                    }
                }
                response.quantity = quantity
                resolve(response)
            })
        })
    },




    DecQty: (proId, userid) => {

        return new Promise(async (resolve, reject) => {
            await cartModel.updateOne({ userId: userid, "cartItems.product": proId }, { $inc: { "cartItems.$.quantity": -1 } }).then(async (response) => {
                let cart = await cartModel.findOne({ userId: userid })

                let quantity
                for (let i = 0; i < cart.cartItems.length; i++) {
                    if (cart.cartItems[i].product == proId) {
                        quantity = cart.cartItems[i].quantity
                    }
                }
                response.quantity = quantity
                resolve(response)
            })
        })
    },




    GetTotalAmout: (userid) => {

        return new Promise(async (resolve, reject) => {
            try {
                Helpers.GetCartItem(userid).then((res) => {


                    let response = {}
                    cart = res.cart
                    console.log(cart);
                    let total;

                    if (cart) {
                        let cartLength = cart.cartItems.length
                        console.log(cartLength);
                        if (cartLength >= 0) {
                            total = cart.cartItems.reduce((acc, curr) => {
                                console.log(curr,'wish');
                                acc += curr.product.price * curr.quantity
                                return acc

                            }, 0)
                            response.cart = cart
                            response.totalAmount = total;
                            console.log(total);
                            resolve(response)
                        }
                    } else {
                        response.cartempty = true
                        resolve(response)
                    }
                })

            } catch (err) {
                console.log("error found " + err);
                reject(err)
            }
        })

    },




    DeleteFrmCart: (productid, userid) => {

        return new Promise(async (resolve, reject) => {
            console.log("assssssss", productid, userid)
            try {
                let deleteCart = await cartModel.updateOne({ userId: ObjectId(userid) }, {
                    $pull: { cartItems: { product: ObjectId(productid) } }

                })
                console.log('vhvjkjk', deleteCart);
                resolve(deleteCart)

            } catch (error) {
                reject(error, "error")
            }
        })

    },


    //------------------------------------------------------------------ Wishlist --------------------------------------------------------------------//

    addToWishlist: (userID, proID) => {
        return new Promise(async (resolve, reject) => {
            try {
                let response = {};
                let userWishlist = await wishlistModel.findOne({ userId: userID })
                let cartItem = await cartModel.findOne({ userId: userID, "cartItems.product": proID });

                if (cartItem) {
                    response.cart = true;
                    resolve(response);

                } else {
                    if (userWishlist) {
                        let exist = await wishlistModel.findOne({ userId: userID, "wishListItems.product": proID, });
                        if (!exist) {
                            let check = {
                                userId: userID, "wishListItems.product": { $ne: proID },
                            };
                            var update = {
                                $addToSet: { wishListItems: { product: proID } },
                            };
                            wishlistModel.findOneAndUpdate(check, update).then((data) => {
                                response.added = true;
                                response.data = true;
                                response.cart = false;
                                resolve(response);

                            });
                        }

                    } else {
                        let userId = userID;
                        let product = proID;
                        let wishListItems = [];
                        wishListItems[0] = { product };
                        newWishList = new wishlistModel({ userId, wishListItems });
                        newWishList.save().then((data) => {
                            response.added = true;
                            response.data = data;
                            response.cart = false
                            resolve(response);
                        });
                    }
                }
            } catch (err) {
                reject(err);
            }
        });
    },
    checkWishlist: (userID, proID) => {
        return new Promise(async (resolve, reject) => {
            try {
                let wishlist = null
                wishlistModel.find({ userId: userID, wishListItems: { $elemMatch: { product: proID } } }).then((data) => {
                    if (data.length > 0) {
                        wishlist = true;
                        console.log(wishlist, "exist");
                    } else {
                        wishlist = false;
                        console.log(wishlist, "not avilable");
                    }
                    resolve(wishlist);
                })

            } catch (err) {
                reject(err)
            }
        });
    },

    wishListItems: (userId) => {
        return new Promise(async (resolve, reject) => {
            try {
                let response = {};
                let products = await wishlistModel.findOne({ userId }).populate("wishListItems.product").lean()
                console.log("wishlist items ",products)
                if (products.wishListItems.length >= 0) {
                    response.notEmpty = true;
                    response.products = products;
                    resolve(response);
                } else {
                    response.notEmpty = false;
                    resolve(response);
                }
            } catch (err) {
                reject(err);
            }
        });
    },


    DeleteWishListItem: (userID, proId) => {
        return new Promise((resolve, reject) => {
            try {
                let response = {};
                wishlistModel.updateOne({ userId: userID }, { $pull: { wishListItems: { product: proId } } }).then((data) => {
                    response.removed = true;
                    response.data = data;
                    resolve(response)
                });

            } catch (err) {
                reject(err);
            }
        });
    },


 //----------------------------------------------------------------------  Checkout  ----------------------------------------------------------------------//

    ApplyCoupon: (couponData, userId) => {
        return new Promise(async (resolve, reject) => {
            try {

            let response = {};
            response.discount = 0
            let coupon = await couponModel.findOne({code: couponData.code})
              
            if(coupon) {
                response.coupon = coupon
                let couponUser = await couponModel.findOne({code:couponData.code, userId: {$in: [userId]}});
                if(couponUser) {
                    response.status = false
                    resolve(response)
                } else {
                    response.status = true
                    response.coupon = response
                    Helpers.GetCartItem(userId).then((cartProd) => {
                        cart = cartProd.cart
                        let grandTotal
                        if (cart) {
                            let cartLength = cart.cartItems.length
                            console.log("length" ,cartLength);
                            if (cartLength >= 0) {
                                grandTotal = cart.cartItems.reduce((acc,curr) => {
                                    acc += curr.product.price * curr.quantity
                                    return acc
                                }, 0)
                               
                                response.discount = (grandTotal * coupon.percentage) /100
                                grandTotal = grandTotal - response.discount;

                                response.grandTotal = grandTotal
                                response.coupon = coupon
                                resolve(response)

                            } else {
                                resolve(response)
                            }
                        } else {
                            resolve(response)
                        }
                    })
                }
             }else {
                response.status = false
                resolve(response)
             }

            } catch (err) {
                reject(err)
            }
 
        })
               
    },

     couponUser:(userId,coupon) => {
        return  new  Promise (async(resolve,reject) => {
            try {
                await couponModel.findByIdAndUpdate(coupon._id,{$push:{userId:userId}}).then((response) => {
                    resolve(response)
                })
            }catch(err) {
                reject(err)
            }
        })
     },



    placeOrder: (checkoutData,userId,grandTotal,discount) => {
        console.log(grandTotal,discount,'hahahah');
        return new Promise (async(resolve,reject) => {
            try {
                if(checkoutData.productDetails === "COD") {
                    OrderStatus = true ;
                }

                Helpers.GetTotalAmout(userId).then(async(response) => {
                 let cartprod = response.cart.cartItems
                 var date = new Date()
                 var newdate = date.toISOString() 
                 newdate = newdate.slice(0,10)
                 console.log(newdate);

                 let newOrder = new orderModel({

                  userId:userId,
                  orderItems:response.cart.cartItems,
                  totalPrice: response.totalAmount,
                  paymentDetails:checkoutData.paymentDetails,
                  deliveryStatus:'pending',
                  deliveryDetails: checkoutData.deliveryDetails,
                  discount: discount,
                  grandTotal: grandTotal,
                  orderStatus: true,
                  productStatus: 'pending',
                  newDate:newdate
                  


                 })
                 newOrder.save()
                 let removed = await cartModel.deleteOne({userId:userId})
                 resolve(newOrder)
                })
            } catch(err) {
                reject(err,"error")
            }
        })
    },


    GenerateRazorpay: (orderId,grandTotal) =>{
        console.log(grandTotal,'undoo');
        let Total = parseInt(grandTotal)
        return new Promise (async(resolve,reject) => {
            try{
                var options = {
                    amount: Total * 100,
                    currency: "INR",
                    receipt: "" + orderId,
                };
                instance.orders.create(options,function (err,order) {
                    if(err){
                        console.log(err);
                    }
                    console.log(order,'vfdgfgh');
                 resolve(order);
                })
            }catch (err){
                reject(err)
            }
        })
    },
    

    VerifyPayment: (details) => {
        return new Promise(async (resolve, reject) => {
          try {
            const crypto = require('crypto')
            let hmac = crypto.createHmac('sha256','SgiyIxZXM3iDEkBadaLFCkPL')
            let body = details.payment.razorpay_order_id + "|" + details.payment.razorpay_payment_id;
            hmac.update(body.toString());
            hmac = hmac.digest('hex')
            if (hmac == details.payment.razorpay_signature) {
              resolve()
            } else {
              reject()
            }
          } catch (err) {
            reject(err)
          }
        })
      },

      ChangePaymentStatus: (orderId) => {
        return new Promise(async (resolve, reject) => {
          try {
            await orderModel.findOneAndUpdate({ _id: orderId }, { OrderStatus: true, deliveryStatus: "success" }).then((response) => {
              resolve(response)
            })
          } catch (error) {
            reject(error)
          }
        })
      },

      GetOrder:(id) => {
        console.log(id,'id');
        return new Promise ((resolve,reject) => {
            try {
                orderModel.find({userId:id})
                .populate("orderItems.product")
                .populate("deliveryDetails")
                .sort({ createdAt: -1 })
                .lean().then((order) => {
                    console.log(order,'order');
                    resolve(order)
                }).catch((err) => {
                    reject(err);
                })
            }catch(err){
                reject(err)
            }
        });
      },


    OrderCount: (userid) =>{
        return new Promise (async(resolve,reject) => {
            try{
                let orderCount = 0;
                let cart = await orderModel.findOne({userId:userid})
                if (cart) {
                    orderCount = cart.orderItems.length

                }
                resolve(orderCount)
            }catch(err) {
            reject(err)
            }

        })
    },
    
    singleOrder: (orderId) => {
        return new Promise (async(resolve,reject) => {
            try {
                let  order = await orderModel.findOne({_id:orderId}).populate('orderItems.product').populate('deliveryDetails').lean()
                resolve(order) 
            } catch(err) {
                reject(err)
            }
        })
    },
 }
















module.exports = Helpers