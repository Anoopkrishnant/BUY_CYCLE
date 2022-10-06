const { response } = require('express');
var express = require('express');
let usermiddleware = require('../middleware/usermiddleware')
const adminController = require('../controller/adminController');
var router = express.Router();
const multer = require('multer')
const { resolve } = require('promise');
const categoryController = require('../controller/categoryController');
const productController = require('../controller/productController');
const bannerController = require('../controller/bannerController');



let verify = (req, res, next) => {
  if (req.session.admin) {
    next()
  } else {
    res.redirect('/admin')
  }
}



//=====================> Multer <====================//

const storage = multer.diskStorage({
  destination: "public/productimages",
  filename: (req, file, cb) => {
    cb(null, Date.now() + '--' + file.originalname);

  }
});

const upload = multer({
  storage
})


/* GET admin listing. */
router.get('/', function (req, res, next) {
  if (req.session.admin) {
    let admin = req.session.admin
    res.redirect('/admin/dashboard', { admin })
  } else {
    res.render('admin/adminlogin');
  }
});

///=====================> Admin Dashboard <====================//

router.get('/dashboard', (req, res) => {
  if (req.session.admin) {
    let admin = req.session.admin
    adminController.GetAllUsers().then((userLength) =>{
      adminController.GetAllOrders().then((orderLength) => {
        adminController.GetAllProducts().then((productLength) => {
          adminController.AllPendingOrders().then((totalPending) => {
            adminController.AllShippedOrders().then((totalShipped) => {
              adminController.AllDeliverdOrders().then((totalDeliverd) => {
                adminController.GetTotalIncome().then((totalIncome) => {
                res.render('admin/dashboard', { layout: 'dashboard-layout',userLength,orderLength,productLength,totalPending,totalShipped,totalDeliverd,totalIncome })
              })
            })
          })
        })
      })
    })
  })

  } else {
    let admin = req.session.adminnotfound
    let wrongpassword = req.session.wrongpassword
    res.render('admin/adminlogin', { admin, wrongpassword })
  }
})


//=====================> Admin Login <====================//


router.post('/adminlogin', (req, res) => {

  adminController.adminlogin(req.body).then((response) => {
    if (response.status) {
      req.session.admin = response.admin
      console.log(req.session.admin);
      console.log('success');
      res.redirect('/admin/dashboard')

    } else if (response.adminnotfound) {
      console.log('adminnotfound');
      req.session.adminnotfound = true;
      req.session.wrongpassword = false;
      res.redirect('/admin/adminlogin')

    } else {
      console.log('failed login');
      req.session.wrongpassword = true;
      req.session.adminnotfound = false;
      res.redirect('/admin/adminlogin')

    }

  })

});


//=====================> Dashboard Router <====================//


// router.get('/dashboard',  (req, res) => {

//   res.render('admin/dashboard', { layout: 'dashboard-layout' });
// });



//=====================> Get User Details <====================//

router.get('/user-details', (req, res) => {
  adminController.getUserData().then((users) => {
    console.log(users);

    res.render('admin/user-details', { layout: 'dashboard-layout', users });
  })

});

//=====================> Block User <====================//

router.get('/block-user/:id', (req, res) => {
  var id = req.params.id
  console.log('asdfdfadfasfafs');
  adminController.block_User(id).then((response) => {
    console.log(response);
    res.redirect('/admin/user-details')
  })

});



//=====================> Activate User <====================//


router.get('/activate-user/:id', (req, res) => {
  var id = req.params.id
  console.log('asdfdfadfasfafs');
  adminController.activate_User(id).then((response) => {
    console.log(response);
    res.redirect('/admin/user-details')
  })

});



//=====================> Category Management <====================//


router.get('/category-management', (req, res) => {
  let Categoryexist = req.session.Categoryexist
  req.session.Categoryexist = null
  res.render('admin/category-management', { Categoryexist, layout: 'dashboard-layout' });
});

//=====================> Category List <====================//

router.get('/category-list', (req, res) => {
  if (req.session.admin) {
    categoryController.Getcategory().then((category) => {
      res.render('admin/category-list', { category, layout: 'dashboard-layout' });
    })

  } else {
    res.redirect('/admin')
  }

});

//=====================> Get Category <====================//

router.post('/category-management', (req, res) => {
  categoryController.Addcategory(req.body).then((response) => {
    if (response.exist) {
      req.session.Categoryexist = true
      req.session.category = response.category
      res.redirect('/admin/category-list')

    } else {
      req.session.category = response.category
      res.redirect('/admin/category-list')
    }

  })
    .catch((err) => {
      console.log("error", err)
      resolve(err)
    })

});

//=====================> Get Data For Update <====================//



router.get('/update-category/:id', (req, res) => {
  let categoryId = req.params.id
  categoryController.getDataUpdate(categoryId).then((categorydata) => {
    console.log(categorydata);
    res.render('admin/category-list', { categorydata })
  })


});

//=====================> Update category <====================//

router.post('/update-category/:id', (req, res) => {
  let categoryId = req.params.id
  categoryController.UpdateCategory(categoryId, req.body).then(() => {
    res.redirect('/admin/category-list')
  })

});






//=====================> Delete Category  <====================//

router.get('/delete-category/:_id', (req, res) => {
  let categoryId = req.params._id
  categoryController.Deletecategory(categoryId).then((data) => {
    res.redirect('/admin/category-list')
  })
})



//=====================> Product <====================//



router.post('/add-product', upload.array("image", 4), (req, res) => {
  const images = req.files
  let array = []
  array = images.map((value) => value.filename)
  req.body.image = array
  productController.addProduct(req.body).then((response) => {
    console.log(response);
    res.redirect('/admin/product-management')
  })



});

//=====================> View Product <====================//


router.get('/product-management', (async (req, res) => {
  if (req.session.admin) {
    const category = await productController.ListCategory()
    productController.viewProduct().then((productDetails) => {
      res.render('admin/product-management', { layout: 'dashboard-layout', productDetails, category })

    });

  } else {
    res.redirect('/admin')
  }
}));

//=====================> Delete Product <====================//


router.get('/delete-product/:_id', (req, res) => {
  let productId = req.params._id
  productController.DeleteProduct(productId).then((data) => {
    res.redirect('/admin/product-management')
  })
});


//=====================> Edite Product <====================//

router.get('/update-product/:id', (req, res, next) => {

  productController.EditProduct(req.params.id).then((product) => {
    productController.ListCategory().then((category) => {
      res.render('admin/product-management', { product, category })
    });

  }).catch((err) => {
    next(err);

  })

})


router.post('/update-product/:id', (req, res) => {
  productController.UpdateProduct(req.body).then((response) => {
    console.log('hdhdhdhdh');
    console.log(req.body);
    console.log(response);
    res.redirect('/admin/product-management')
  })
});




router.get('/product-details', (req, res) => {
  res.render('admin/product-details', { layout: 'dashboard-layout' });
});

//=====================> Banner Management <====================//



router.get('/banner-management', (req, res) => {
  bannerController.ListBanners(req.body).then((bannerDetails) => {
    console.log(bannerDetails);
    res.render('admin/banner-management', { layout: 'dashboard-layout', bannerDetails })

  });

});

router.post('/add-banner', upload.array("image", 4), (req, res) => {
  let bannerimages = req.files
  let array = []
  array = bannerimages.map((value) => value.filename)
  req.body.image = array
  bannerController.addBanner(req.body).then((response) => {
    console.log("banner response",response)
    res.redirect('/admin/banner-management')
  })
})


router.get('/delete-banner/:_id', (req, res) => {
  let banner = req.params._id
  bannerController.DeleteBanner(banner).then(() => {
    res.redirect('/admin/banner-management')
  })
})

//=====================> Order Management <====================//

router.get('/order-management', verify, (req, res, next) => {
  adminController.GetOrderDetails().then((orderDetails) => {
  console.log(orderDetails, 'details');
  res.render('admin/order-management', { layout: 'dashboard-layout', orderDetails });

  }).catch((err) => {
    next(err)
  })

});

router.get('/Order-details/:id',verify, (req, res,next) => {
  let id = req.params.id
  adminController.GetSingleOrder(id).then((singleOrder) => {
    res.render('admin/Order-details', { layout: 'dashboard-layout',singleOrder });
}).catch((err) => {
  next(err)
})
});


router.post('/productShiped/:id',(req,res) => {
  let id = req.params.id
  console.log(id,'shippmwnt id');
  adminController.ShipProduct(id).then((response) => {
    res.json({response})
  })
})


router.post('/productDeliverd/:id',(req,res) => {
  let id = req.params.id
  adminController.DeliverProduct(id).then((response) => {
    res.json({response})
  })
})


router.post('/cancelOrder/:id',(req,res) => {
  let id = req.params.id
  adminController.CancelOrder(id).then((response) => {
    res.json({response})
  })
})

//=====================> Coupon Management <====================//

router.get('/coupon-management', verify, (req, res) => {
  adminController.GetCoupons().then((coupons) => {

    res.render('admin/coupon-management', { layout: 'dashboard-layout', coupons });
  })
});


router.post('/coupons', verify, (req, res, next) => {
  console.log(req.body, 'vhvhbjjnjnjn');
  adminController.addNewCoupon(req.body).then((coupons) => {
    res.redirect('/admin/coupon-management')
  }).catch((err) => {
    next(err)
  });
});


router.post('/edit-coupon/:id', verify, (req, res, next) => {
  adminController.EditCoupon(req.body, req.params.id).then((data) => {
    res.redirect('/admin/coupon-management')

  }).catch((err) => {
    err.admin = true
    next(err);
  });
});


router.get('/delete-coupon/:id', verify, (req, res, next) => {
  adminController.DeleteCoupon(req.params.id).then((data) => {
    res.redirect('/admin/coupon-management')

  }).catch((err) => {
    err.admin = true;
    next(err);
  })
})


router.get('/coupons', (req, res) => {
  adminController.GetCoupons().then((coupons) => {
    res.render('admin/coupons', { layout: 'dashboard-layout', coupons });
  })
});



//=====================> Admin Logout <====================//


router.get('/adminlogout', function (req, res, next) {
  req.session.destroy()
  res.redirect('/admin')
});



router.get('/getchart' ,(req,res,next) => {
  adminController.Stati().then((status) => {
    res.json({status})
  }) .catch((err) => {
    next(err)
  })
})

router.get('/sales-report', (req, res,next) => {
  adminController.GetOrderDetails().then((orderDetails) => {

  res.render('admin/sales-report', { layout: 'dashboard-layout',orderDetails });
}).catch((err) => {
  next(err)
});
});



module.exports = router;
