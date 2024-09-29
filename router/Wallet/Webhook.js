const crypto = require('crypto');
const { default: mongoose } = require('mongoose');
const { Errordisplay } = require('../../utils/Auth.utils');
const TemporaryDepositModel = require('../../model/Wallet/User/TemporaryDeposit.model');
const UserWalletModel = require('../../model/Wallet/User/UserWallet.model');
const TransactionModel = require('../../model/Wallet/User/Transaction.model');
const { Sendmail } = require('../../utils/mailer.utils');
const UserModel = require('../../model/User.model');
const adminTransactionMdel = require('../../model/Wallet/Admin/adminTransaction.mdel');
const adminBalanceModel = require('../../model/Wallet/Admin/adminBalance.model');
const secretKey = process.env.KoraSecretKey
const router= require('express').Router()

router.post('/', async (req, res, next) => {
  const hash = crypto.createHmac('sha256', secretKey).update(JSON.stringify(req.body.data)).digest('hex');

   if (hash === req.headers['x-korapay-signature']) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        
        // Continue with the request functionality
        let response= req.body

        if(response.event== 'charge.success'){
            let data= response.data

            let TempTransasction= await TemporaryDepositModel.findOneAndDelete({_id:data.reference}).session(session)

            // ['NGN', 'KES', 'GHS', 'USD']
            //updating user wallet
            await UserWalletModel.updateOne({user_id:TempTransasction.user_id},{$inc:{
              ...data.currency=='NGN'?{Ngn:data.amount}:{},
              ...data.currency=='KES'?{Kes:data.amount}:{},
              ...data.currency=='GHS'?{Ghs:data.amount}:{},
              ...data.currency=='USD'?{Usd:data.amount}:{},
            }}).session(session)

            //create transaction
            let transaction=await TransactionModel.create([{
              user_id:TempTransasction.user_id,
              amount:data.amount,
              type:'Credit',
              naration:`${data.currency} deposit`,
              from:'CASH',
              to:data.currency,
              process:'Successfull'
            }],{session:session})

            await session.commitTransaction();
            session.endSession();

            res.sendStatus(200)

            let user= await UserModel.findOne({_id:TempTransasction.user_id})

            await Sendmail(user.email, 'Payment Deposit Received - Island Pay',`
            <!DOCTYPE html>
            <html lang="en">
            
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Payment Deposit Received - Island Pay</title>
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
                        <h1>Payment Deposit Received</h1>
                    </div>
            
                    <!-- Main Content -->
                    <div class="content">
                        <h2>Deposit Successfully Received</h2>
                        <p>
                            We are pleased to inform you that your payment deposit has been successfully received.
                        </p>
                        <p>
                            Details of your transaction:
                        </p>
                        <ul style="line-height: 1.8; color: #333;">
                            <li><strong>Amount:</strong> ${data.amount}</li>
                            <li><strong>Currency:</strong> ${data.currency}</li>
                            <li><strong>Date:</strong> ${new Date().toLocaleString()}</li>
                            <li><strong>Transaction ID:</strong> ${transaction[0]._id}</li>
                        </ul>
                        <p>
                            You can view your updated balance and transaction history by viewing the app.
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
        
            return
        }else if(response.event== 'charge.failed'){
            let data= response.data

            let TempTransasction= await TemporaryDepositModel.findOneAndDelete({_id:data.reference}).session(session)

            //create transaction
            await TransactionModel.create([{
                user_id:TempTransasction.user_id,
                amount:data.amount,
                type:'Credit',
                naration:`${data.currency} deposit`,
                from:'CASH',
                to:data.currency,
                process:'Failed'
            }],{session:session})

            await session.commitTransaction();
            session.endSession();

            return res.sendStatus(200)

        }else if(response.event== 'transfer.success'){
            let data= response.data

            let TempTransasction= await TransactionModel.findOneAndUpdate({_id:data.reference},{process:'Successfull'}).session(session)

            //create transaction
            let earning=TempTransasction.charges-data.fee

            // updating admin
            await adminBalanceModel.updateOne({user_id:req.user._id},{
                $inc:{

                    // earning
                    ...data.currency== "NGN" ? { Ngn: earning } : {},
                    ...data.currency== "USD" ? { Usd: earning } : {},
                    ...data.currency== "KES" ? { Kes: earning } : {},
                    ...data.currency== "ZAR" ? { Zar: earning } : {},
                    ...data.currency== "GHS" ? { Ghs: earning } : {},
                    ...data.currency== "XOF" ? { Xof: earning } : {},
                    ...data.currency== "XAF" ? { Xaf: earning } : {},
                    ...data.currency== "GBP" ? { Gbp: earning } : {}
                }            
            }).session(session) 

            //user
            let User= await UserModel.findOne({_id:TempTransasction.user_id})

            //create admin transaction
            await adminTransactionMdel.create([
                //from
                {
                    user_id:TempTransasction.user_id,
                    amount:earning,
                    transaction_type:'credit',
                    currency:data.currency,
                    description:`Earnings: ${User.username} withdrawal funds from ${data.currency} to Cash`
                },
            ],{session:session})


            await session.commitTransaction();
            session.endSession();

            res.sendStatus(200)

            await Sendmail(User.email,'Withdrawal Successful - Island Pay',`
                <!DOCTYPE html>
                <html lang="en">

                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>Withdrawal Successful - Island Pay</title>
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

                        .details-box {
                            background-color: #f3e5f5;
                            padding: 15px;
                            margin: 20px 0;
                            border-radius: 8px;
                        }

                        .details-box p {
                            margin: 0;
                            font-size: 16px;
                            color: #6a1b9a;
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

                            .details-box p {
                                font-size: 14px;
                            }
                        }
                    </style>
                </head>

                <body>
                    <div class="container">
                        <!-- Header -->
                        <div class="header">
                            <h1>Withdrawal Successful</h1>
                        </div>

                        <!-- Main Content -->
                        <div class="content">
                            <h2>Transaction Completed</h2>
                            <p>
                                Dear ${User.username},
                            </p>
                            <p>
                                We are pleased to inform you that your recent withdrawal request has been successfully processed. The funds have been transferred to your designated account.
                            </p>
                            <div class="details-box">
                                <p><strong>Amount Withdrawn:</strong> ${TempTransasction.amount}${data.currency}</p>
                                <p><strong>Transaction ID:</strong> ${TempTransasction._id}</p>
                                <p><strong>Date:</strong>${new Date().toLocaleString()} </p>
                            </div>
                            <p>
                                If you have any questions or need further assistance, feel free to contact our support team. Thank you for choosing Island Pay.
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
            return;
        }else if(response.event== 'transfer.failed'){
            let data= response.data

            let TempTransasction= await TransactionModel.findOneAndUpdate({_id:data.reference},{process:'Failed'}).session(session)

            let totaReverse= TempTransasction.amount+TempTransasction.charges

            await UserWalletModel.updateOne({user_id:req.user._id},{
                $inc:{
                    ...currency== "NGN" ? { Ngn: totaReverse } : {},
                    ...currency== "USD" ? { Usd: totaReverse } : {},
                    ...currency== "KES" ? { Kes: totaReverse } : {},
                    ...currency== "ZAR" ? { Zar: totaReverse } : {},
                    ...currency== "GHS" ? { Ghs: totaReverse } : {},
                    ...currency== "XOF" ? { Xof: totaReverse } : {},
                    ...currency== "XAF" ? { Xaf: totaReverse } : {},
                    ...currency== "GBP" ? { Gbp: totaReverse } : {},
    
                }            
            }).session(session)
            
            await session.commitTransaction();
            session.endSession();

            return res.sendStatus(200)

        }

        await session.abortTransaction();
        session.endSession(); 

        return res.status(401).json({Access:false,Error:'style not correct'})
            
    } catch (error) {
        await session.abortTransaction();
        session.endSession(); 

        return res.status(500).json({Access:false,Error:Errordisplay(error).msg})
            
    } 

   } else {
     // Don’t do anything, the request is not from us.
     return res.status(404).json({Access:false,Error:"Page not found"})
   }
});

module.exports=router