const UserModel = require('../../model/User.model')
const { Errordisplay,CreateJWTToken, VerifyJWTToken } = require('../../utils/Auth.utils')
const bcrypt= require('bcryptjs')
const { Sendmail } = require('../../utils/mailer.utils')
const { GenOTP } = require('../../utils/random.utils')
const userVerifModel = require('../../model/userVerif.model')
const bcryptjs = require('bcryptjs')
const userDetailsModel = require('../../model/userDetails.model')
const userBvnNGModel = require('../../model/userBvnNG.model')
const { default: axios } = require('axios')
const router= require('express').Router()


router.post('/',VerifyJWTToken,async (req, res) => {
    try {
        let checkBvnVerification= await userBvnNGModel.findOne({user_id:req.user._id})

        if(checkBvnVerification)return res.status(403).json({
            Access:true,
            Error:'Already verified bvn'
        })

        //get data
        let Collect= req.body

        //get userdetails
        let getUserDetails= await userDetailsModel.findOne({user_id:req.user._id})
        
        //intigration
        let intigration= await axios({
            url:`${process.env.KoraApiLink}`,
            headers:{
                Accept:'application/json',
                'Content-Type':'application/json',
                Authorization:`Bearer `
            },
            data:JSON.stringify({
                id:Collect.id,
                verification_consent:true,
                validation:{
                    first_name:req.user.firstName,
                    last_name:req.user.lastName,
                    date_of_birth:`${getUserDetails.dateOfBirth}`.split('T')[0]
                }
            })
        })

        let data=intigration.data
        
        //bvn details
        if (data.message!="BVN verified successfully" && data.data.validation.first_name.match==false && data.data.validation.last_name.match==false && data.data.validation.date_of_birth.match==false  ) return res.status(403).json({
            Access:true,
            Error:data.message,
        })

        //save data
        await userBvnNGModel.create({
            user_id:req.user._id,
            bvn:data.data.id,
            kora_ref:data.data.reference,
            verified:true,
            nin:data.data.nin
        })

        await UserModel.updateOne({_id:req.user._id},{bank_verif:true})

        res.json({Access:true, Error:false, Verified:true})

    } catch (error) {
        res.status(400).json({
            Access:true,
            Error:Errordisplay(error).msg
        })
    }
})



module.exports=router