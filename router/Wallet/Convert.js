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
            url:`https://v6.exchangerate-api.com/v6/${process.env.exchangerateKey}/pair/${from}/${to}`,
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

router.post('/convert',VerifyJWTToken,async (req, res) => {

    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        let {pin,amount,from,to}= req.body


        //check pin
        if(!bcrypt.compareSync(`${pin}`,req.user.pin)){
            await session.abortTransaction();
            session.endSession(); 
            return res.status(400).json({
            Access:true,
            Error:'Incorrect pin'
        }) }


        //currency validator
        const excludedCurrencies = ["NGN","USD","KES","ZAR","GHS","XOF","XAF","GBP"];
        if (!excludedCurrencies.includes(from)) {
            await session.abortTransaction();
            session.endSession(); 
            return res.status(400).json({
            Access:true,
            Error:'Invalid currency.'
        }) }
        if (!excludedCurrencies.includes(to)) {
            await session.abortTransaction();
            session.endSession(); 
            return res.status(400).json({
            Access:true,
            Error:'Invalid currency.'
        }) }

        //under pay
        if(amount<1){
            await session.abortTransaction();
            session.endSession(); 
            return res.status(400).json({
            Access:true,
            Error:'Amount is too small.'
        }) }


        //check balance
        let SenderBalance= await UserWalletModel.findOne({user_id:req.user._id}).session(session)

        if(from == 'NGN' && SenderBalance.Ngn < amount) {
            await session.abortTransaction();
            session.endSession(); 
            return res.status(400).json({
                Access: true,
                Error: 'Not enough funds in NGN wallet'
            });
        }
        
        if(from == 'USD' && SenderBalance.Usd < amount) {
            await session.abortTransaction();
            session.endSession(); 
            return res.status(400).json({
                Access: true,
                Error: 'Not enough funds in USD wallet'
            });
        }
        
        if(from == 'KES' && SenderBalance.Kes < amount) {
            await session.abortTransaction();
            session.endSession(); 
            return res.status(400).json({
                Access: true,
                Error: 'Not enough funds in KES wallet'
            });
        }
        
        if(from == 'ZAR' && SenderBalance.Zar < amount) {
            await session.abortTransaction();
            session.endSession(); 
            return res.status(400).json({
                Access: true,
                Error: 'Not enough funds in ZAR wallet'
            });
        }
        
        if(from == 'GHS' && SenderBalance.Ghs < amount) {
            await session.abortTransaction();
            session.endSession(); 
            return res.status(400).json({
                Access: true,
                Error: 'Not enough funds in GHS wallet'
            });
        }
        
        if(from == 'XOF' && SenderBalance.Xof < amount) {
            await session.abortTransaction();
            session.endSession(); 
            return res.status(400).json({
                Access: true,
                Error: 'Not enough funds in XOF wallet'
            });
        }
        
        if(from == 'XAF' && SenderBalance.Xaf < amount) {
            await session.abortTransaction();
            session.endSession(); 
            return res.status(400).json({
                Access: true,
                Error: 'Not enough funds in XAF wallet'
            });
        }
        
        if(from == 'GBP' && SenderBalance.Gbp < amount) {
            await session.abortTransaction();
            session.endSession(); 
            return res.status(400).json({
                Access: true,
                Error: 'Not enough funds in GBP wallet'
            });
        }
        
        //get rate
        let rate = (await axios({
            url:`https://v6.exchangerate-api.com/v6/${process.env.exchangerateKey}/pair/${from}/${to}/${amount}`,
            method:'get'
        }))?.data.conversion_result

        //calculate admin earning
        let earning= percentagePrice(rate,process.env.islandConversionEarining)

        //get converted price
        let ConvertedAmout= rate-earning

        //convert sender
        await UserWalletModel.updateOne({user_id:req.user._id},{
            $inc:{
                ...from == "NGN" ? { Ngn: -amount } : {},
                ...from == "USD" ? { Usd: -amount } : {},
                ...from == "KES" ? { Kes: -amount } : {},
                ...from == "ZAR" ? { Zar: -amount } : {},
                ...from == "GHS" ? { Ghs: -amount } : {},
                ...from == "XOF" ? { Xof: -amount } : {},
                ...from == "XAF" ? { Xaf: -amount } : {},
                ...from == "GBP" ? { Gbp: -amount } : {},

                // earning
                ...to == "NGN" ? { Ngn: ConvertedAmout } : {},
                ...to == "USD" ? { Usd: ConvertedAmout } : {},
                ...to == "KES" ? { Kes: ConvertedAmout } : {},
                ...to == "ZAR" ? { Zar: ConvertedAmout } : {},
                ...to == "GHS" ? { Ghs: ConvertedAmout } : {},
                ...to == "XOF" ? { Xof: ConvertedAmout } : {},
                ...to == "XAF" ? { Xaf: ConvertedAmout } : {},
                ...to == "GBP" ? { Gbp: ConvertedAmout } : {}
            }            
        }).session(session)

        //updating admin
        await adminBalanceModel.updateOne({user_id:req.user._id},{
            $inc:{

                // earning
                ...to == "NGN" ? { Ngn: earning } : {},
                ...to == "USD" ? { Usd: earning } : {},
                ...to == "KES" ? { Kes: earning } : {},
                ...to == "ZAR" ? { Zar: earning } : {},
                ...to == "GHS" ? { Ghs: earning } : {},
                ...to == "XOF" ? { Xof: earning } : {},
                ...to == "XAF" ? { Xaf: earning } : {},
                ...to == "GBP" ? { Gbp: earning } : {}
            }            
        }).session(session)

        //create transaction
        let transaction= await TransactionModel.create([
            //from
            {
                user_id:req.user._id,
                amount,
                type:'Debit',
                naration:`Converted ${from} to ${to}`,
                from,
                to,
                process:'Successfull'
            },
            //to
            {
                user_id:req.user._id,
                amount:ConvertedAmout,
                type:'Credit',
                naration:`Converted ${from} to ${to}`,
                from,
                to,
                process:'Successfull'
            }
        ],{session:session})

        //create admin transaction
        await adminTransactionMdel.create([
            //from
            {
                user_id:req.user._id,
                amount,
                transaction_type:'credit',
                currency:to,
                description:`Earnings: ${req.user.username} converted funds from ${from} to ${to}`
            },
            
        ],{session:session})

        await session.commitTransaction();
        session.endSession();

        //response
        res.json({Access:true, Error:false, Converted:true})

        //sender
        await Sendmail(req.user.email,'Currency Conversion Successful - Island Pay',`
            <!DOCTYPE html>
            <html lang="en">

            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Currency Conversion Successful - Island Pay</title>
                <style>
                    body {
                        margin: 0;
                        padding: 0;
                        font-family: Arial, sans-serif;
                        background-color: #f4f4f9;
                    }

                    .container {
                        max-width: 600px;
                        margin: 0 auto;
                        background-color: #fff;
                        border-radius: 8px;
                        overflow: hidden;
                        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
                    }

                    .header {
                        background-color: #6a1b9a;
                        color: #fff;
                        padding: 20px;
                        text-align: center;
                    }

                    .header h1 {
                        margin: 0;
                        font-size: 24px;
                    }

                    .content {
                        padding: 20px;
                        color: #333;
                    }

                    .content h2 {
                        font-size: 22px;
                        color: #6a1b9a;
                        margin-top: 0;
                    }

                    .content p {
                        font-size: 16px;
                        line-height: 1.6;
                        margin-bottom: 20px;
                    }

                    .button {
                        display: inline-block;
                        padding: 12px 25px;
                        background-color: #6a1b9a;
                        color: #fff;
                        text-decoration: none;
                        border-radius: 5px;
                        font-size: 16px;
                    }

                    .footer {
                        background-color: #f4f4f9;
                        color: #999;
                        padding: 10px;
                        text-align: center;
                        font-size: 14px;
                    }

                    @media (max-width: 600px) {
                        .container {
                            width: 100%;
                            padding: 0;
                        }

                        .content h2 {
                            font-size: 20px;
                        }

                        .content p {
                            font-size: 14px;
                        }

                        .button {
                            font-size: 14px;
                        }
                    }
                </style>
            </head>

            <body>
                <div class="container">
                    <!-- Header -->
                    <div class="header">
                        <h1>Currency Conversion Successful</h1>
                    </div>

                    <!-- Main Content -->
                    <div class="content">
                        <h2>Your Conversion is Complete</h2>
                        <p>
                            You have successfully converted <strong>${amount} ${from}</strong> to <strong>${ConvertedAmout} ${to}</strong> on Island Pay.
                        </p>
                        <p>
                            Here are the details of your conversion:
                        </p>
                        <ul style="line-height: 1.8; color: #333;">
                            <li><strong>Amount Converted:</strong> ${amount} ${from}</li>
                            <li><strong>Converted To:</strong> ${ConvertedAmout} ${to}</li>
                            <li><strong>Transaction ID:</strong> ${transaction[0]._id}</li>
                            <li><strong>Date:</strong> ${new Date().toLocaleString()}</li>
                        </ul>
                        <p>
                            You can view your updated balance and transaction history by viewing app
                        </p>
                        
                        <p>
                            If you have any questions, please contact us at <a href="mailto:${process.env.email}">${process.env.email}</a>.
                        </p>
                    </div>

                    <!-- Footer -->
                    <div class="footer">
                        <p>&copy; 2024 Island Pay. All Rights Reserved.</p>
                    </div>
                </div>
            </body>

            </html>

        `)


    } catch (error) {
        

        res.status(400).json({
            Access:true,
            Error:Errordisplay(error).msg
        })
        await session.abortTransaction();
        session.endSession(); 
    }
})

module.exports=router