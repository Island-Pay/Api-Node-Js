const UserModel = require('../../model/User.model')
const { Errordisplay,CreateJWTToken, VerifyJWTToken } = require('../../utils/Auth.utils')
const bcrypt= require('bcryptjs')
const { Sendmail } = require('../../utils/mailer.utils')
const { GenOTP, percentagePrice } = require('../../utils/random.utils')
const userVerifModel = require('../../model/userVerif.model')
const bcryptjs = require('bcryptjs')
const { default: axios } = require('axios')
const TemporaryDepositModel = require('../../model/Wallet/User/TemporaryDeposit.model')
const router= require('express').Router()


router.get('/get-rate',VerifyJWTToken,async (req, res) => {
    try {
        let {from,to}=req.query

        const excludedCurrencies = ["NGN","USD","KES","ZAR","GHS","XOF","XAF","GBP"];
        if (!excludedCurrencies.includes(from)) {
            return res.status(400).json({
            Access:true,
            Error:'Invalid base currency.'
        }) }
        if (!excludedCurrencies.includes(from)) {
            return res.status(400).json({
            Access:true,
            Error:'Invalid target currency.'
        }) }

        let rate = (await axios({
            url:`https://v6.exchangerate-api.com/v6/${process.env.exchangerateKey}/pair/${from}/${to}/100`,
            method:'get'
        }))?.data.conversion_rate

        let earning= percentagePrice(rate,process.env.islandConversionEarining)

        res.json({Access:true,Error:false,Rate:rate-earning})
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