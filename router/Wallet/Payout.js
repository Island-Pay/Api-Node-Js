const { Errordisplay,CreateJWTToken, VerifyJWTToken } = require('../../utils/Auth.utils')
const { default: axios } = require('axios')
const TemporaryDepositModel = require('../../model/Wallet/User/TemporaryDeposit.model')
const { default: mongoose } = require('mongoose')
const adminTransactionMdel = require('../../model/Wallet/Admin/adminTransaction.mdel')
const TransactionModel = require('../../model/Wallet/User/Transaction.model')
const UserWalletModel = require('../../model/Wallet/User/UserWallet.model')
const router= require('express').Router()
const bcrypt = require('bcryptjs')
const adminBalanceModel = require('../../model/Wallet/Admin/adminBalance.model')
const failedTransactionModel = require('../../model/Wallet/User/failedTransaction.model')

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


//verify resolve bank
router.post('/resolve-bank',VerifyJWTToken,async (req, res) => {
    try {

        //banks
        let Country= req.query.country

        let {account,bank}=req.body;

        //validate Banks
        const excludedCurrencies = ["NGN","KES","ZAR","USD","GBP"];
        if (!excludedCurrencies.includes(Country)) {
            return res.status(400).json({
            Access:true,
            Error:'Invalid Country.'
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
                bank, account, currency:Country
            })
        })).data.data

        res.json({Access:true,Error:false, Details:Intigration})
    } catch (error) {
        console.log(error.response.data);
        
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
router.post('/resolve-mobileMoney',VerifyJWTToken,async (req, res) => {
    try {

        //banks
        let Country= req.query.country

        let {mobileMoneyCode,phoneNumber}=req.body;

        //validate Banks
        const excludedCurrencies = ["GHS","KES","XOF",'XAF'];
        if (!excludedCurrencies.includes(Country)) {
            return res.status(400).json({
            Access:true,
            Error:'Invalid currency.'
        }) }

        let Intigration= (await axios({
            url:`${process.env.KoraApiLink}/api/v1/misc/mobile-money/resolve`,
            method:'post',
            headers:{
                Accept:'application/json',
                'Content-Type':'application/json',
                Authorization:`Bearer ${process.env.KoraPublicKey}`
            },
            data:JSON.stringify({
                mobileMoneyCode, phoneNumber, currency:Country
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


//send out money
router.post('/bank/disburse',VerifyJWTToken,async (req, res) => {

    const session = await mongoose.startSession();
    session.startTransaction();

    let price=0,
    charge=0,
    transaID="",
    currencyFailed='';

    try {
        let {pin,amount,currency,narration, account, bankCode, accountName, }= req.body


        //check pin
        if(!bcrypt.compareSync(`${pin}`,req.user.pin)){
            await session.abortTransaction();
            session.endSession(); 
            return res.status(400).json({
            Access:true,
            Error:'Incorrect pin'
        }) }


        //currency validator
        const excludedCurrencies = ["NGN","KES","ZAR","USD","GBP"];
        if (!excludedCurrencies.includes(currency)) {
            await session.abortTransaction();
            session.endSession(); 
            return res.status(400).json({
            Access:true,
            Error:'Invalid currency.'
        }) }

        currencyFailed=currency;

        //under pay
        if(amount<1){
            await session.abortTransaction();
            session.endSession(); 
            return res.status(400).json({
            Access:true,
            Error:'Amount is too small'
        }) }

        //calculate admin earning
        let earning= currency=="NGN"?amount<40000?70:amount<300000?200:1000:percentagePrice(amount,process.env.islandWithdrawlEarining)

        //get amount and charges price
        let TotalWithdrawal= amount+earning

        price=amount;
        charge=earning;

        //check balance
        let SenderBalance= await UserWalletModel.findOne({user_id:req.user._id}).session(session)

        if(currency== 'NGN' && SenderBalance.Ngn < TotalWithdrawal) {
            await session.abortTransaction();
            session.endSession(); 
            return res.status(400).json({
                Access: true,
                Error: `Not enough funds in NGN wallet. Amount is ${amount}, Charges ${earning}`
            });
        }
        
        if(currency== 'USD' && SenderBalance.Usd < TotalWithdrawal) {
            await session.abortTransaction();
            session.endSession(); 
            return res.status(400).json({
                Access: true,
                Error: `Not enough funds in USD wallet. Amount is ${amount}, Charges ${earning}`
            });
        }
        
        if(currency== 'KES' && SenderBalance.Kes < TotalWithdrawal) {
            await session.abortTransaction();
            session.endSession(); 
            return res.status(400).json({
                Access: true,
                Error: `Not enough funds in KES wallet. Amount is ${amount}, Charges ${earning}`
            });
        }
        
        if(currency== 'ZAR' && SenderBalance.Zar < TotalWithdrawal) {
            await session.abortTransaction();
            session.endSession(); 
            return res.status(400).json({
                Access: true,
                Error: `Not enough funds in ZAR wallet. Amount is ${amount}, Charges ${earning}`
            });
        }
        
        if(currency== 'GBP' && SenderBalance.Gbp < TotalWithdrawal) {
            await session.abortTransaction();
            session.endSession(); 
            return res.status(400).json({
                Access: true,
                Error: `Not enough funds in GBP wallet. Amount is ${amount}, Charges ${earning}`
            });
        }

        //convert sender
        await UserWalletModel.updateOne({user_id:req.user._id},{
            $inc:{
                ...currency== "NGN" ? { Ngn: -TotalWithdrawal } : {},
                ...currency== "USD" ? { Usd: -TotalWithdrawal } : {},
                ...currency== "KES" ? { Kes: -TotalWithdrawal } : {},
                ...currency== "ZAR" ? { Zar: -TotalWithdrawal } : {},
                ...currency== "GHS" ? { Ghs: -TotalWithdrawal } : {},
                ...currency== "XOF" ? { Xof: -TotalWithdrawal } : {},
                ...currency== "XAF" ? { Xaf: -TotalWithdrawal } : {},
                ...currency== "GBP" ? { Gbp: -TotalWithdrawal } : {},

            }            
        }).session(session)

        // //updating admin
        // await adminBalanceModel.updateOne({user_id:req.user._id},{
        //     $inc:{

        //         // earning
        //         ...currency== "NGN" ? { Ngn: earning } : {},
        //         ...currency== "USD" ? { Usd: earning } : {},
        //         ...currency== "KES" ? { Kes: earning } : {},
        //         ...currency== "ZAR" ? { Zar: earning } : {},
        //         ...currency== "GHS" ? { Ghs: earning } : {},
        //         ...currency== "XOF" ? { Xof: earning } : {},
        //         ...currency== "XAF" ? { Xaf: earning } : {},
        //         ...currency== "GBP" ? { Gbp: earning } : {}
        //     }            
        // }).session(session)

        //create transaction
        let transaction= await TransactionModel.create([
            //from
            {
                user_id:req.user._id,
                amount,
                charges:earning,
                type:'Debit',
                naration:`withdrawal to Bank`,
                from:currency,
                to:'CASH',
                process:'Pending'
            },
            
        ],{session:session})

        transaID=transaction[0]._id;

        // //create admin transaction
        // await adminTransactionMdel.create([
        //     //from
        //     {
        //         user_id:req.user._id,
        //         amount,
        //         transaction_type:'credit',
        //         currency:currency,
        //         description:`Earnings: ${req.user.username} withdrawal funds from ${currency} to Cash`
        //     },
        // ],{session:session})

        await session.commitTransaction();
        session.endSession();

        //intigration
        await axios({
            url:`${process.env.KoraApiLink}/api/v1/transactions/disburse`,
            method:'post',
            headers:{
                Accept:'application/json',
                'Content-Type':'application/json',
                Authorization:`Bearer ${process.env.KoraSecretKey}`
            },
            data:JSON.stringify({
                reference:transaction[0]._id,
                destination:{
                    type:"bank_account",
                    amount,
                    currency,
                    narration,
                    bank_account:{
                        bank:bankCode,
                        account,
                        account_name:accountName
                    },
                    customer:{
                        name:req.user.username,
                        email:req.user.email,
                    }
                },
            })
        })

        //response
        res.json({Access:true, Error:false, Sent:true})

        


    } catch (error) {
        
        if (error.isAxiosError) {
            // Axios specific error handling

            await failedTransactionModel.create({
                user_id:req.user._id,
                transaction_id:transaID,
                reason:'withdrawal',
                amount:price,
                charges:charge,
                currency:currencyFailed,

            })
            return res.status(400).json({
                Access: false,
                Error: error.response ? error.response.data?.message : 'Axios API error'
            });
        }

        res.status(400).json({
            Access:true,
            Error:Errordisplay(error).msg
        })
        await session.abortTransaction();
        session.endSession(); 
    }
})

router.post('/mobilemoney/disburse',VerifyJWTToken,async (req, res) => {

    const session = await mongoose.startSession();
    session.startTransaction();

    let price=0,
    charge=0,
    transaID="",
    currencyFailed='';

    try {
        let {pin,amount,currency,narration, account, mobileMoneySlug, }= req.body


        //check pin
        if(!bcrypt.compareSync(`${pin}`,req.user.pin)){
            await session.abortTransaction();
            session.endSession(); 
            return res.status(400).json({
            Access:true,
            Error:'Incorrect pin'
        }) }


        //currency validator
        const excludedCurrencies = ["GHS","KES","XOF",'XAF'];
        if (!excludedCurrencies.includes(currency)) {
            await session.abortTransaction();
            session.endSession(); 
            return res.status(400).json({
            Access:true,
            Error:'Invalid currency.'
        }) }

        currencyFailed=currency;

        //under pay
        if(amount<1){
            await session.abortTransaction();
            session.endSession(); 
            return res.status(400).json({
            Access:true,
            Error:'Amount is too small'
        }) }

        //calculate admin earning
        let earning= currency=="NGN"?amount<40000?70:amount<300000?200:1000:percentagePrice(amount,process.env.islandWithdrawlEarining)

        //get amount and charges price
        let TotalWithdrawal= amount+earning

        price=amount;
        charge=earning;

        //check balance
        let SenderBalance= await UserWalletModel.findOne({user_id:req.user._id}).session(session)

        if(currency== 'NGN' && SenderBalance.Ngn < TotalWithdrawal) {
            await session.abortTransaction();
            session.endSession(); 
            return res.status(400).json({
                Access: true,
                Error: `Not enough funds in NGN wallet. Amount is ${amount}, Charges ${earning}`
            });
        }
        
        if(currency== 'USD' && SenderBalance.Usd < TotalWithdrawal) {
            await session.abortTransaction();
            session.endSession(); 
            return res.status(400).json({
                Access: true,
                Error: `Not enough funds in USD wallet. Amount is ${amount}, Charges ${earning}`
            });
        }
        
        if(currency== 'KES' && SenderBalance.Kes < TotalWithdrawal) {
            await session.abortTransaction();
            session.endSession(); 
            return res.status(400).json({
                Access: true,
                Error: `Not enough funds in KES wallet. Amount is ${amount}, Charges ${earning}`
            });
        }
        
        if(currency== 'ZAR' && SenderBalance.Zar < TotalWithdrawal) {
            await session.abortTransaction();
            session.endSession(); 
            return res.status(400).json({
                Access: true,
                Error: `Not enough funds in ZAR wallet. Amount is ${amount}, Charges ${earning}`
            });
        }
        
        if(currency== 'GBP' && SenderBalance.Gbp < TotalWithdrawal) {
            await session.abortTransaction();
            session.endSession(); 
            return res.status(400).json({
                Access: true,
                Error: `Not enough funds in GBP wallet. Amount is ${amount}, Charges ${earning}`
            });
        }

        //convert sender
        await UserWalletModel.updateOne({user_id:req.user._id},{
            $inc:{
                ...currency== "NGN" ? { Ngn: -TotalWithdrawal } : {},
                ...currency== "USD" ? { Usd: -TotalWithdrawal } : {},
                ...currency== "KES" ? { Kes: -TotalWithdrawal } : {},
                ...currency== "ZAR" ? { Zar: -TotalWithdrawal } : {},
                ...currency== "GHS" ? { Ghs: -TotalWithdrawal } : {},
                ...currency== "XOF" ? { Xof: -TotalWithdrawal } : {},
                ...currency== "XAF" ? { Xaf: -TotalWithdrawal } : {},
                ...currency== "GBP" ? { Gbp: -TotalWithdrawal } : {},

            }            
        }).session(session)

        // //updating admin
        // await adminBalanceModel.updateOne({user_id:req.user._id},{
        //     $inc:{

        //         // earning
        //         ...currency== "NGN" ? { Ngn: earning } : {},
        //         ...currency== "USD" ? { Usd: earning } : {},
        //         ...currency== "KES" ? { Kes: earning } : {},
        //         ...currency== "ZAR" ? { Zar: earning } : {},
        //         ...currency== "GHS" ? { Ghs: earning } : {},
        //         ...currency== "XOF" ? { Xof: earning } : {},
        //         ...currency== "XAF" ? { Xaf: earning } : {},
        //         ...currency== "GBP" ? { Gbp: earning } : {}
        //     }            
        // }).session(session)

        //create transaction
        let transaction= await TransactionModel.create([
            //from
            {
                user_id:req.user._id,
                amount,
                charges:earning,
                type:'Debit',
                naration:`withdrawal to Bank`,
                from:currency,
                to:'CASH',
                process:'Pending'
            },
            
        ],{session:session})

        transaID=transaction[0]._id;

        // //create admin transaction
        // await adminTransactionMdel.create([
        //     //from
        //     {
        //         user_id:req.user._id,
        //         amount,
        //         transaction_type:'credit',
        //         currency:currency,
        //         description:`Earnings: ${req.user.username} withdrawal funds from ${currency} to Cash`
        //     },
        // ],{session:session})

        await session.commitTransaction();
        session.endSession();

        //intigration
        await axios({
            url:`${process.env.KoraApiLink}/api/v1/transactions/disburse`,
            method:'post',
            headers:{
                Accept:'application/json',
                'Content-Type':'application/json',
                Authorization:`Bearer ${process.env.KoraSecretKey}`
            },
            data:JSON.stringify({
                reference:transaction[0]._id,
                destination:{
                    type:"mobile_money",
                    amount,
                    currency,
                    narration,
                    mobile_money:{
                        operator:mobileMoneySlug,
                        mobile_number:account,
                    },
                    customer:{
                        name:req.user.username,
                        email:req.user.email,
                    }
                },
            })
        })

        //response
        res.json({Access:true, Error:false, Converted:true})

        


    } catch (error) {
        
        if (error.isAxiosError) {
            // Axios specific error handling

            await failedTransactionModel.create({
                user_id:req.user._id,
                transaction_id:transaID,
                reason:'withdrawal',
                amount:price,
                charges:charge,
                currency:currencyFailed,

            })
            return res.status(400).json({
                Access: false,
                Error: error.response ? error.response.data?.message : 'Axios API error'
            });
        }

        res.status(400).json({
            Access:true,
            Error:Errordisplay(error).msg
        })
        await session.abortTransaction();
        session.endSession(); 
    }
})
module.exports=router