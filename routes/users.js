var express = require('express');
const userModel = require('../Model/userModel');
var router = express.Router();
const userController = require('../controller/UserController');
let usermiddleware = require('../middleware/usermiddleware')
const productModel = require('../Model/productModel')
let session = require('express-session');
const { response } = require('../app');
const productController = require('../controller/productController');
const twilioController = require('../controller/twilioController');
const cartModel = require ('../Model/cartModel');
const adminController = require('../controller/adminController');
const bannerController = require('../controller/bannerController')
const multer = require("multer");
const { CategoryProducts } = require('../controller/UserController');
const categoryController = require('../controller/categoryController')






const storage = multer.diskStorage({
  destination: "public/userimages",
  filename: (req, file, cb) => {
    cb(null, Date.now() + '--' + file.originalname);
  }
})

const uploads = multer({
  storage
});


let verify = (req,res,next) => {
  if(req.session.user){
    next()
  }else{
    res.redirect('/')
  }
}




/* GET home page. */
router.get('/', usermiddleware.isblocked, async function (req, res, next) {
  if (req.session.user) {
    let user = req.session.user
    productController.GetProduct().then((listProduct) =>{
    console.log(user);
    bannerController.ListBanners(req.body).then((bannerDetails) => {
      categoryController.Getcategory().then((category) => {
    res.render('Users/home', { user,listProduct,bannerDetails,category });
    console.log(listProduct);
  })
})
})
  } else {
    productController.GetProduct().then((listProduct) =>{
      bannerController.ListBanners(req.body).then((bannerDetails) => {
        categoryController.Getcategory().then((category) => {  
    res.render('Users/home', { listProduct,bannerDetails,category });
  })
})
})
  }

});


//------------------User Signup----------------//

router.get('/signup', (req, res) => {
  if (req.session.user) {
    res.redirect('/')
  } else {
    res.render('Users/signup');
  }

});

router.post('/signup', function (req, res) {
  userController.Dosignup(req.body).then((state) => {
    if (state.userexist) {
      req.session.userAlreadyExist = true;
      console.log(req.body)

      res.redirect('/signup')
    } else {

      req.session.user = state.user;
      console.log(state.user);
      res.redirect('/')

    }


  })

});


//------------------User Login----------------//


router.get('/login', (req, res) => {
  if (req.session.user) {
    res.redirect('/')
  } else {
    // let user=req.session.usernotfound
    // let wrongpassword= req.session.wrongpassword
    res.render('Users/login', { user: req.session.usernotfound, wrongpassword: req.session.wrongpassword });
    req.session.wrongpassword = false
    req.session.usernotfound = false
  }
});


router.post('/login', (req, res) => {
  userController.Dologin(req.body).then((response) => {
    if (response.status) {
      // req.session.loggedIn = true
      req.session.user = response.user
      req.session.email = response.email
      console.log(response.email);
      req.session.loggedIn = true
      res.redirect('/')

    } else if ('usernotfound') {
      console.log('User not found');
      req.session.usernotfound = true;
      req.session.wrongpassword = true;
      res.redirect('/login')
    } else {
      console.log('failed login');
      req.session.wrongpassword = true;
      req.session.usernotfound = false;
      res.redirect('/login')

    }
  })

});

//------------------User Login With OTP----------------//

router.get('/Userotp', function (req, res) {

  res.render('Users/Userotp');
  
});



router.post('/otppage', (req, res) => {
  req.session.phonenumber = req.body.phonenumber
  twilioController.getOtp(req.body.phonenumber).then((response) => {

    if (response.exist) {
      if (response.ActiveStatus) {
        req.session.user = response.user
        // console.log(response.email);
        req.session.email = response.email
        res.redirect('/Userotp')
      } else {
        req.session.userBlocked = true
        res.redirect('/login')
      }
    } else {
      req.session.usernotfound = true
      res.redirect('/login')
    }
  })

})


router.post('/otpverify', (req, res) => {
  twilioController.checkOtp(req.body.otp, req.session.phonenumber).then((response) => {
    if (response == 'approved') {
      req.session.loggedIn = true
      res.redirect('/')
    } else {
      res.redirect('/Userotp')
    }
  })

})


//------------------product-details----------------//
router.get('/product-details/:_id', verify, (req, res)=> {
  
    productController.GetOneProduct(req.params._id).then((singleProduct) =>{
    console.log(singleProduct);
    res.render('Users/product-details',{singleProduct, user_header:true});
    
})
  
});

router.get('/categorywise/:id',usermiddleware.isblocked, async (req, res) => {
   console.log('nandhu');
  let user = req.session.user
  let id = req.params.id
  // let cartCount = null;
  // if (req.session.user) {
  //   cartCount = await productController.GetCount(req.session.user._id)
  // }
  userController.CategoryProducts(id).then((CategoryProducts) => {
    console.log(CategoryProducts,'category');
  res.render('Users/categorywise',{user,CategoryProducts,user_header:true}) ;

})
  
});


 //------------------User cart----------------//

    router.get('/add-to-cart',verify, async(req,res,next) => {
      let user = req.session.user
      let cartCount = null
      if(req.session.user){
        cartCount = await productController.GetCount(req.session.user._id)
        console.log("cart count ",cartCount)
      }
      
    productController.GetCartItem(req.session.user._id).then ((cartItems) => {
      cart =  cartItems.cart
      // console.log(cart);
      let totalAmount
      cartempty = cartItems.cartempty
      productController.GetTotalAmout(req.session.user._id).then((total)  => {
        totalAmount = total.totalAmount
        res.render('Users/add-to-cart',{cartItems,user_header:true,cartCount,totalAmount,cartempty,user})
        
      })
     
    }).catch((err) =>{
      next(err)
    })
    
   })


  

 //------------------Cart Onclick Reload----------------//

 router.post('/addToCart/:id',verify,(req,res)  => {
  let cartID = req.params.id
  productController.AddToCart(cartID,req.session.user._id).then((response) =>{
    if(response.cartempty){
      req.session.cartempty = true
      req.session.cart = response.cart
      // console.log(response);
      res.json(response)
    }else{
      req.session.cart = response.cart
      res.json(response)
    }
   
  }).catch((err) => {
    next(err)
  })
 })


  router.post('/Incqty/:id',(req,res) => {
  let IncId = req.params.id
  productController.IncQty(IncId,req.session.user._id).then((response) => {
    res.json({response})
  })
 })


 router.post('/Decqty/:id',(req,res) => {
  let DecId = req.params.id
  productController.DecQty(DecId,req.session.user._id).then((response) => {
    res.json({response})
  })
 })


 router.get('/delete-cart/:_id',(req,res) =>{
  console.log("assasasasas")
  let userid = req.session.user._id
  let productid = req.params._id
  console.log(productid+"productid"+userid);
  productController.DeleteFrmCart(productid,userid).then((response) =>{
    console.log(response);
    res.redirect('/add-to-cart')
  })
 })

 router.get('/getCoupon',verify,(req,res) => {
  adminController.GetCoupons().then((coupons) => {
    res.redirect('/add-to-cart')
  })
 })

//------------------User Wishlist----------------//

  router.post('/addToWishlist/:id',verify,(req,res,next) => {
  productController.addToWishlist(req.session.user._id,req.params.id).then((response) => {
    console.log(response);
    res.json({ response });

  }).catch((err)=>{
    next(err);
  });

})
  
router.get('/wishlist', verify,(req, res)=> {
  let wishListProduct = req.session.user;
  let user = req.session.user
  productController.wishListItems(req.session.user._id).then((response) => {
    if(response.notEmpty){
      console.log(response.wishListItems,'anvaa');
      let wishListItems = response.products.wishListItems;
      userController.UserProfile(req.session.user._id).then((userData) => {
      res.render('Users/wishlist',{ user_header: true,wishListItems,wishListProduct,response,user,userData });
      })
    }else{
     
      res.render('Users/wishlist',{ user_header: true,wishListProduct,response,user });
    }
  
  })
  
 });
 
 router.post("/deleteWishListItem/:id",verify,(req,res,next) =>{
  productController.DeleteWishListItem(res.session.user._id,req.params.id).then((response) => {
    res.json({response});
  }).catch((err) => {
    next(err);
  });
 });


 router.post('/addtoCart/:id',verify,(req,res)  => {
  let cartID = req.params.id
  productController.AddToCart(cartID,req.session.user._id).then((response) =>{
    res.json({response})
  }).catch((err) => {
    next(err)
  })
 })
 //------------------Coupon----------------//

router.post('/applyCoupon',verify,(req,res,next) => {
  console.log('coupon apply');
  let userid = req.session.user._id
  // console.log(req.body,"varuooo", userid);
  productController.ApplyCoupon(req.body,userid).then((response) => {
     req.session.response = response
    
     if(response) {
      req.session.coupon = response.coupon;
      req.session.discount = response.discount
      req.session.grandTotal = response.grandTotal
    }
    console.log(req.session)
    console.log(response);
    res.json({response});

  }).catch((err) => {
    next(err)
  })
})


 //------------------Place Order----------------//



 router.get('/orderSuccess',verify,usermiddleware.isblocked, (req, res) => {
  let user= req.session.user
  res.render('Users/orderSuccess',{ user_header: true ,user });
  })
  





router.get('/orders',verify,async (req, res,next)=> {
  let id = req.session.user._id;
  let user = req.session.user;
  // let cartCount = null;
  // if(req.session.user) {
  //   cartCount = await productController.GetCount(req.session.user._id)
  // }
  productController.OrderCount(id).then((orderCount) => {
    productController.GetOrder(id).then((allOrders) => {
      console.log(allOrders,'orders');
      userController.UserProfile(req.session.user._id).then((userData) => {
      res.render('Users/orders',{ user_header: true ,user,orderCount,allOrders,userData});

    }).catch((err) => {
      console.log(err,'error');
      next(err)
    })

  })
})
  
});


//------------------Invoice----------------//
router.get('/invoice/:id', (req, res) => {
  invoiceid = req.params.id
console.log(invoiceid,"invoice id is here");
productController.singleOrder(invoiceid).then((order)=>{
  console.log(order,"order may be get");
  res.render('Users/invoice',{user_header: true,order});

})
  
});






router.get('/trackOrder/:id', verify,usermiddleware.isblocked, (req, res,next)=> {
 orderid = req.params.id
 productController.singleOrder(orderid).then((order) => {


  res.render('Users/trackOrder',{ user_header: true,order });

 })
  
});
//------------------User Profile----------------//

router.get('/user-profile',verify,usermiddleware.isblocked, (req, res,next ) => {
  let user = req.session.user
  userController.UserProfile(req.session.user._id).then((userData) => {
    console.log("users profile  ",userData)
    res.render('Users/user-profile',{ user_header: true,userData ,user});
  }).catch((err) => {
    next(err)
  })

});

router.post('/editProfile/:id',uploads.single("image"),(req,res) => {
  let id = req.params.id
  let userimage = req.file
  req.body.image = userimage
  userController.EditProfile(req.body,id).then((profileDetails) => {
    res.redirect('/user-profile')
  })
})
//------------------Check Out----------------//


router.get('/checkout', (req, res)=> {
  let session = req.session
  let user = req.session.user
  let totalAmount 
  productController.GetTotalAmout(req.session.user._id).then((total)  => {
    totalAmount = total.totalAmount
    userController.GetToCheckout(req.session.user._id).then((check) => {
      userController.Getaddress(req.session.user._id).then((address)  => {
        console.log(address);
        adminController.GetCoupons(req.session.user._id).then((coupons) =>{
       
      res.render('Users/checkout',{ user_header: true,totalAmount,check,address,coupons,session,user });
        })
    })  
  })
  }).catch((err) => {
    next(err)
  })

});

router.post('/addaddress',(req,res,next)  =>{
  console.log(req.body);
  userController.addAddress(req.body,req.session.user._id).then((response)=>{
    res.redirect('/checkout')
  }).catch((err) => {
    next(err)
  })
});


router.post('/checkOut',verify, (req,res,next) => {
  try{
    
  let userId = req.session.user._id
  if(req.session.coupon) {
    let coupon = req.session.coupon
    let discount = req.session  .discount
    console.log(coupon,discount,"discount is here");
    let grandTotal = req.session.grandTotal
    productController.placeOrder(req.body,userId,grandTotal,discount).then(async(orderDetails) => {
      req.session.orders = orderDetails;
      if (orderDetails.paymentDetails === "COD"){
        if(req.session.coupon) {
          await productController.couponUser(userId,coupon)
        }
        res.json({orderDetails})
        console.log(orderDetails,'gsg');
      }else {
       
        productController.GenerateRazorpay(orderDetails._id,orderDetails.grandTotal).then((data) => {
          console.log(orderDetails._id,orderDetails.grandTotal,'ununun');
          console.log(data,'jnjnjnjn');
          res.json({data})
        })
      }
    }).catch((err) => {
      next(err)
    })
  } else {

    

    productController.placeOrder(req.body,userId).then(async(orderDetails) => {
      req.session.orders = orderDetails;
      if (orderDetails.paymentDetails === "COD"){
        if(req.session.coupon) {
          await productController.couponUser(userId,coupon)
        }
        console.log(orderDetails,'order');
        res.json(orderDetails)
      }else {
        productController.GenerateRazorpay(orderDetails._id,orderDetails.totalPrice).then((data) => {
          res.json({data})
        })
      }

    }).catch((err) => {
      console.log("errrrorr", err);
      next(err)
    })

  }
}catch(error){
  console.log('error',error);
}
})


router.post('/verifyPayment',(req,res) => {
  productController.VerifyPayment(req.body).then((data) => {
    productController.ChangePaymentStatus(req.body.order.receipt).then((response) => {
      res.json({status: true})
    }).catch((err) => {
      console.log(err);
      res.json({status : false})
    })
  })
})

//------------------User Logout----------------//
router.get('/Electric', (req, res) => {
  res.render('Users/Electric');
  
});

router.get('/about', (req, res) => {
  res.render('Users/about');
  
});


//------------------User Logout----------------//
router.get('/logout', (req, res) => {
  req.session.destroy()
  res.redirect('/')
});

module.exports = router;



