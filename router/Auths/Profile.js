const { Errordisplay,CreateJWTToken, VerifyJWTToken } = require('../../utils/Auth.utils')
const userDetailsModel = require('../../model/userDetails.model')
const router= require('express').Router()


router.get('/',VerifyJWTToken,async (req, res) => {
    try {
        
        res.json({Access:true,Error:false,Data:{
            User:req.user,
            Details:await userDetailsModel.findOne({_id:req.user._id})
        }})
    } catch (error) {

        res.status(400).json({
            Access:true,
            Error:Errordisplay(error).msg
        })
    }
})



module.exports=router