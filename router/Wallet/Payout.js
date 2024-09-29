const { Errordisplay,CreateJWTToken, VerifyJWTToken } = require('../../utils/Auth.utils')
const { default: axios } = require('axios')
const TemporaryDepositModel = require('../../model/Wallet/User/TemporaryDeposit.model')
const router= require('express').Router()

// Nigeria,,us, gbp, Kenya and South Africa.
router.get('/get-banks',VerifyJWTToken,async (req, res) => {
    try {

        //banks
        let Country= req.query.country

        //validate Banks
        const excludedCurrencies = ["NG","KE","ZA","US","GB",];
        if (!excludedCurrencies.includes(Country)) {
            return res.status(400).json({
            Access:true,
            Error:'Invalid currency.'
        }) }

        let Intigration= (await axios({
            url:`${process.env.KoraApiLink}/api/v1/misc/banks`,
            params:{
                countryCode:Country
                
            },
            headers:{
                Accept:'application/json',
                'Content-Type':'application/json',
                Authorization:`Bearer ${process.env.KoraPublicKey}`
            }
        })).data.data

        res.json({Access:true,Error:false, Banks:Intigration})
    } catch (error) {
        console.log('====================================');
        console.log(error);
        console.log('====================================');
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

// Nigeria, Kenya and South Africa.
router.get('/get-mobileMoney',VerifyJWTToken,async (req, res) => {
    try {

        //banks
        let Country= req.query.country

        //validate Banks
        const excludedCurrencies = ["GH","KE","CI",'CM'];
        if (!excludedCurrencies.includes(Country)) {
            return res.status(400).json({
            Access:true,
            Error:'Invalid currency.'
        }) }

        let Intigration= (await axios({
            url:`${process.env.KoraApiLink}/api/v1/misc/banks`,
            params:{
                countryCode:Country
                
            },
            headers:{
                Accept:'application/json',
                'Content-Type':'application/json',
                Authorization:`Bearer ${process.env.KoraPublicKey}`
            }
        })).data.data

        res.json({Access:true,Error:false, Banks:Intigration})
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


//verify resolve
router.post('/resolve-bank',VerifyJWTToken,async (req, res) => {
    try {

        //banks
        let Country= req.query.country

        let {amount,bank}=req.body;

        //validate Banks
        const excludedCurrencies = ["GH","KE","CI",'CM'];
        if (!excludedCurrencies.includes(Country)) {
            return res.status(400).json({
            Access:true,
            Error:'Invalid currency.'
        }) }

        let Intigration= (await axios({
            url:`${process.env.KoraApiLink}/api/v1/misc/banks/resolve`,
            method:'post',
            headers:{
                Accept:'application/json',
                'Content-Type':'application/json',
                Authorization:`Bearer ${process.env.KoraPublicKey}`
            },
            data:JSON.stringify({
                bank, amount, currency:Country
            })
        })).data.data

        res.json({Access:true,Error:false, Details:Intigration})
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