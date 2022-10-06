
const userModel = require('../Model/userModel')

module.exports={


    isblocked:(req,res,next)=>{

        if(req.session.user){
            console.log('middle');
            new Promise(async(resolve,reject)=>{
                let user=await userModel.findOne({email:req.session.email})
                console.log(user,'user');
                resolve(user)
            }).then((user)=>{
                if(user.status){
                    res.render('access-denied');  //sendStatus(404)
                }else{
                    next()
                }
            }).catch((err)=>{
                console.log(err,'error');
            })

        }else{
            next()
        }


    }

}