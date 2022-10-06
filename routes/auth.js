var express = require('express');
// const userModel = require('../Model/userModel');
// var router = express.Router();
// const userController= require('../controller/UserController')


// router.get('/signup', function(req, res) {
//   res.render('Users/signup');
// });
// router.post('/signup',(req,res)=>{
//     const newUser=new userModel(req.body)
//     newUser.save();
//     console.log(req.body)
//     res.render('index')
// });




// router.get('/login', function(req, res) {
//     res.render('Users/login');
//   });

//   router.post('/login', (req, res) => {
//     userController.Dologin(req.body).then((response) => {
//         if (response.status) {
//             // req.session.loggedIn = true
//             // req.session.user=response.user
//             // req.session.deletionCheck=true
//             res.redirect('/index')
            
//         } else if ('usernotfound') {
//             console.log('User not found');
//             // req.session.usernotfound = true;
//             // req.session.wrongpassword = false;
//             res.redirect('/login')
//         } else {
//             console.log('failed login');
//             // req.session.wrongpassword = true;
//             // req.session.usernotfound = false;
//             res.redirect('/login')

//         }
//     })

// });

// module.exports = router;
