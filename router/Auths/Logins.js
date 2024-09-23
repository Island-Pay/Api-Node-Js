const UserModel = require('../../model/User.model')
const { Errordisplay } = require('../../utils/Auth.utils')
const bcrypt= require('bcryptjs')
const { Sendmail } = require('../../utils/mailer.utils')
const { GenOTP } = require('../../utils/random.utils')
const userVerifModel = require('../../model/userVerif.model')
const bcryptjs = require('bcryptjs')
const userDetailsModel = require('../../model/userDetails.model')
const router= require('express').Router()


router.post('/',async (req, res) => {
    try {

        //user input
        let Collect= req.body

        //get data
        let User= await UserModel.findOne({email:Collect.email})

        //validate
        if (!User) return res.status(400).json({
            Access:true,
            Error:'User not found'
        })

        let checkPassword= bcryptjs.compareSync(Collect.password, User.password)

        //validate
        if (checkPassword==true) return res.status(400).json({
            Access:true,
            Error:'User not found'
        })

        res.json({Access:true,Error:false, Data:{

            LoginSteps:{
                step1:true,
                emailVerify:User.email_verif,
                phoneNoVerify:User.phone_number_verif,
                UserDetails:User.userDetails_verify
            },

            BasicVerification:User.email_verif==true&&User.phone_number_verif,
            BasicVerificationDetails:{
                Email:User.email_verif,
                Phone:User.phone_number_verif
            },

            KYCVerification:User.bank_verif==true&&User.id_verif==true,
            KYCVerificationDetails:{
                Bank:User.bank_verif,
                ID:User.id_verif
            },

            Email:User.email,
            PhoneNumber:User.phone_number,
            ...User.email_verif==true&&User.phone_number_verif&&User.userDetails_verify?{
                UserDetails:{
                    User,
                    Details:await userDetailsModel.findOne({user_id:User._id})
                },
            }:{}

        }})


    } catch (error) {
        res.status(400).json({
            Access:true,
            Error:Errordisplay(error).msg
        })
    }
})



module.exports=router