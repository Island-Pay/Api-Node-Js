const UserModel = require('../../model/User.model')
const { Errordisplay,CreateJWTToken, VerifyJWTToken } = require('../../utils/Auth.utils')
const bcrypt= require('bcryptjs')
const { Sendmail } = require('../../utils/mailer.utils')
const { GenOTP, percentagePrice } = require('../../utils/random.utils')
const userVerifModel = require('../../model/userVerif.model')
const bcryptjs = require('bcryptjs')
const { default: axios } = require('axios')
const TemporaryDepositModel = require('../../model/Wallet/User/TemporaryDeposit.model')
const TransactionModel = require('../../model/Wallet/User/Transaction.model')
const UserWalletModel = require('../../model/Wallet/User/UserWallet.model')
const { default: mongoose } = require('mongoose')
const adminBalanceModel = require('../../model/Wallet/Admin/adminBalance.model')
const adminTransactionMdel = require('../../model/Wallet/Admin/adminTransaction.mdel')
const virtualCardModel = require('../../model/Wallet/User/virtualCard.model')
const router= require('express').Router()


router.get('/',VerifyJWTToken,async (req, res) => {
    try {
        
        res.json({Access:true,Error:false,Balance:{
            Wallet:await UserWalletModel.findOne({user_id:req.user._id}),
            Transactions:(await TransactionModel.find({user_id:req.user._id}))?.reverse(),
            virtualCard:await virtualCardModel.find({user_id:req.user._id})
        }})
    } catch (error) {

        res.status(400).json({
            Access:true,
            Error:Errordisplay(error).msg
        })
    }
})



module.exports=router