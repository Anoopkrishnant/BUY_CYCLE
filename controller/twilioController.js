const { resolve } = require("promise");
const Promise = require("promise");
const userModel = require('../Model/userModel');
const dotenv = require('dotenv').config()

config = {
  serviceID:  process.env.serviceID,
  accountSID: process.env.accountSID,
  authToken:  process.env.authToken
};

const client = require("twilio")(config.accountSID, config.authToken);

module.exports = {
  // signUpGetOtp: (number) => {
  //   number = "+91" + number;
  //   return new Promise((resolve, reject) => {
  //     client.verify.v2.services(config.serviceID).verifications.create({
  //        to: number, channel: "sms" })
  //       .then((response) => {
  //         resolve(response);
  //         console.log("promise done");
  //       });
  //   });
  // },


  getOtp: (number) => {


    return new Promise(async (resolve, reject) => {
      console.log(number)
        try {
            let user = await userModel.findOne({ mobile: number });
            let response = {}
            
            if (user) {
                response.exist = true;
                console.log(user,'available');

                if (!user.ActiveStatus) {
                    client.verify.v2.services(config.serviceID).verifications.create({
                        to: '+91' + number,
                        channel: "sms"
                    })
                        .then((data) => {
                            console.log("response",data)
                            response.data = data;
                            response.user = user;
                            response.email = user.email
                            response.ActiveStatus = true;
                            resolve(response)
                            //console.log(response)
                        }).catch((err) => {
                            console.log("ERROR FOUND AT VERIFYING");
                            reject(err)
                        })
                } else {
                    response.userBlocked = true;
                    
                    resolve(response);

                }

            } else {
                response.exist = false
              
                resolve(response)
            }
        } catch (error) {
            reject(error)
        }
      

    })
},


  checkOtp: (otp, number) => {
   var  number = "+91" + number;
    return new Promise((resolve, reject) => {
      client.verify.v2.services(config.serviceID).verificationChecks.create({
         to: number, code: otp })
        .then((verification_check) => {
          console.log(verification_check.status);
          resolve(verification_check.status);
        }).catch((error)=>{
          console.log("erroorrr  ",error)
        })
    });
  },
};