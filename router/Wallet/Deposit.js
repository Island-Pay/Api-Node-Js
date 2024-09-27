const UserModel = require('../../model/User.model')
const { Errordisplay,CreateJWTToken, VerifyJWTToken } = require('../../utils/Auth.utils')
const bcrypt= require('bcryptjs')
const { Sendmail } = require('../../utils/mailer.utils')
const { GenOTP } = require('../../utils/random.utils')
const userVerifModel = require('../../model/userVerif.model')
const bcryptjs = require('bcryptjs')
const { default: axios } = require('axios')
const TemporaryDepositModel = require('../../model/Wallet/User/TemporaryDeposit.model')
const router= require('express').Router()


router.post('/',VerifyJWTToken,async (req, res) => {
    try {

        let currency= req.query.currency

        if (currency!='NGN'&&currency!='KES'&&currency!='GHS'&&currency!='USD')return res.status(400).json({
            Access:true,
            Error:'Invalid currency.'
        }) 
        
        //get data
        let amount= req.body.amount
        // amount,narration

        //deleting old temporary deposit
        await TemporaryDepositModel.deleteOne({user_id:req.user._id})
        //save temporary deposit
        let TempDeposit= await TemporaryDepositModel.create({
            user_id:req.user._id,
            amount,
            currency
        })
        
        //intigration
        let intigration= await axios({
            url:`${process.env.KoraApiLink}/api/v1/charges/initialize`,
            method:'post',
            headers:{
                Accept:'application/json',
                'Content-Type':'application/json',
                Authorization:`Bearer ${process.env.KoraSecretKey}`
            },
            data:JSON.stringify({
                amount,
                currency,
                reference:TempDeposit._id,
                narration:`${currency} deposit`,
                customer:{
                    email:req.user.email,
                    name:req.user.username
                },
                merchant_bears_cost:false
            })
        })

        let data=intigration.data

        res.json({Access:true, Error:false, RedirectURl:data.data.checkout_url})

    } catch (error) {
        if (error.isAxiosError) {
            // Axios specific error handling
            return res.status(400).json({
                Access: false,
                Error: error.response ? error.response.data?.message : 'Axios API error'
            });
        }

        res.status(400).json({
            Access:true,
            Error:Errordisplay(error).msg
        })
    }
})



module.exports=router