const UserModel = require('../../model/User.model')
const { Errordisplay, VerifyJWTToken } = require('../../utils/Auth.utils')
const bcrypt= require('bcryptjs')
const { Sendmail } = require('../../utils/mailer.utils')
const UserWalletModel = require('../../model/Wallet/User/UserWallet.model')
const TransactionModel = require('../../model/Wallet/User/Transaction.model')
const { default: mongoose } = require('mongoose')
const router= require('express').Router()


router.post('/',VerifyJWTToken,async (req, res) => {

    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        let {pin,amount,reciever}= req.body


        //check pin
        if(!bcrypt.compareSync(`${pin}`,req.user.pin)){
            await session.abortTransaction();
            session.endSession(); 
            return res.status(400).json({
            Access:true,
            Error:'Incorrect pin'
        }) }

        if(req.user.username==reciever){
            await session.abortTransaction();
            session.endSession(); 
            return res.status(400).json({
            Access:true,
            Error:'Cant send money to yourself'
        }) }

        //currency
        let currency= req.query.currency

        //currency validator
        const excludedCurrencies = ["NGN","USD","KES","ZAR","GHS","XOF","XAF","GBP"];
        if (!excludedCurrencies.includes(currency)) {
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

        //get reciever details
        let RecieverDetails= await UserModel.findOne({username:reciever, email_verif:true,phone_number_verif:true,userDetails_verify:true})

        if(!RecieverDetails){
            await session.abortTransaction();
            session.endSession(); 
            return res.status(400).json({
                Access: true,
                Error: 'Reciever does not exist'
            });
        }

        //check balance
        let SenderBalance= await UserWalletModel.findOne({user_id:req.user._id}).session(session)

        if(currency == 'NGN' && SenderBalance.Ngn < amount) {
            await session.abortTransaction();
            session.endSession(); 
            return res.status(400).json({
                Access: true,
                Error: 'Not enough funds in NGN wallet'
            });
        }
        
        if(currency == 'USD' && SenderBalance.Usd < amount) {
            await session.abortTransaction();
            session.endSession(); 
            return res.status(400).json({
                Access: true,
                Error: 'Not enough funds in USD wallet'
            });
        }
        
        if(currency == 'KES' && SenderBalance.Kes < amount) {
            await session.abortTransaction();
            session.endSession(); 
            return res.status(400).json({
                Access: true,
                Error: 'Not enough funds in KES wallet'
            });
        }
        
        if(currency == 'ZAR' && SenderBalance.Zar < amount) {
            await session.abortTransaction();
            session.endSession(); 
            return res.status(400).json({
                Access: true,
                Error: 'Not enough funds in ZAR wallet'
            });
        }
        
        if(currency == 'GHS' && SenderBalance.Ghs < amount) {
            await session.abortTransaction();
            session.endSession(); 
            return res.status(400).json({
                Access: true,
                Error: 'Not enough funds in GHS wallet'
            });
        }
        
        if(currency == 'XOF' && SenderBalance.Xof < amount) {
            await session.abortTransaction();
            session.endSession(); 
            return res.status(400).json({
                Access: true,
                Error: 'Not enough funds in XOF wallet'
            });
        }
        
        if(currency == 'XAF' && SenderBalance.Xaf < amount) {
            await session.abortTransaction();
            session.endSession(); 
            return res.status(400).json({
                Access: true,
                Error: 'Not enough funds in XAF wallet'
            });
        }
        
        if(currency == 'GBP' && SenderBalance.Gbp < amount) {
            await session.abortTransaction();
            session.endSession(); 
            return res.status(400).json({
                Access: true,
                Error: 'Not enough funds in GBP wallet'
            });
        }
        
        

        //debit sender
        await UserWalletModel.updateOne({user_id:req.user._id},{
            $inc:{
                ...currency == "NGN" ? { Ngn: -amount } : {},
                ...currency == "USD" ? { Usd: -amount } : {},
                ...currency == "KES" ? { Kes: -amount } : {},
                ...currency == "ZAR" ? { Zar: -amount } : {},
                ...currency == "GHS" ? { Ghs: -amount } : {},
                ...currency == "XOF" ? { Xof: -amount } : {},
                ...currency == "XAF" ? { Xaf: -amount } : {},
                ...currency == "GBP" ? { Gbp: -amount } : {}
            }            
        }).session(session)
        //credit reciever
        await UserWalletModel.updateOne({user_id:RecieverDetails._id},{
            $inc:{
                ...currency == "NGN" ? { Ngn: amount } : {},
                ...currency == "USD" ? { Usd: amount } : {},
                ...currency == "KES" ? { Kes: amount } : {},
                ...currency == "ZAR" ? { Zar: amount } : {},
                ...currency == "GHS" ? { Ghs: amount } : {},
                ...currency == "XOF" ? { Xof: amount } : {},
                ...currency == "XAF" ? { Xaf: amount } : {},
                ...currency == "GBP" ? { Gbp: amount } : {}
            }            
        }).session(session)

        //create transaction
        let transaction= await TransactionModel.create([
            //sender
            {
                user_id:req.user._id,
                amount,
                type:'Debit',
                naration:`Money sent to ${reciever}`,
                from:currency,
                to:currency,
                process:'Successfull'
            },
            //reciever
            {
                user_id:RecieverDetails._id,
                amount,
                type:'Credit',
                naration:`Money recieved from ${req.user.username}`,
                from:currency,
                to:currency,
                process:'Successfull'
            }
        ],{session:session})

        await session.commitTransaction();
        session.endSession();

        //response
        res.json({Access:true, Error:false, Transaction:transaction[0]})

        //sender
        await Sendmail(req.user.email,'Money Sent Successfully - Island Pay',`
        <!DOCTYPE html>
        <html lang="en">
        
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Money Sent Successfully - Island Pay</title>
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
                    <h1>Money Sent Successfully</h1>
                </div>
        
                <!-- Main Content -->
                <div class="content">
                    <h2>Transaction Completed</h2>
                    <p>
                        You have successfully sent <strong>${amount} ${currency}</strong> to <strong>${RecieverDetails.username}</strong> on Island Pay.
                    </p>
                    <p>
                        Here are the details of your transaction:
                    </p>
                    <ul style="line-height: 1.8; color: #333;">
                        <li><strong>Amount Sent:</strong> ${amount} ${currency}</li>
                        <li><strong>Recipient:</strong> ${RecieverDetails.firstName} ${RecieverDetails.lastName}</li>
                        <li><strong>Transaction ID:</strong> ${transaction[0]._id}</li>
                        <li><strong>Date:</strong> ${new Date().toLocaleString()}</li>
                    </ul>
                    <p>
                        You can view your updated balance and transaction history in the app.
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

        //reciever
        await Sendmail(RecieverDetails.email,'Money Received - Island Pay',`
            <!DOCTYPE html>
            <html lang="en">

            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Money Received - Island Pay</title>
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
                        <h1>Money Received</h1>
                    </div>

                    <!-- Main Content -->
                    <div class="content">
                        <h2>Funds Added to Your Account</h2>
                        <p>
                            You have received <strong>${amount} ${currency}</strong> from <strong>${req.user.username}</strong> on Island Pay.
                        </p>
                        <p>
                            Here are the details of your transaction:
                        </p>
                        <ul style="line-height: 1.8; color: #333;">
                            <li><strong>Amount Received:</strong> ${amount} ${currency}</li>
                            <li><strong>Sender:</strong> ${req.user.firstName} ${req.user.lastName}</li>
                            <li><strong>Transaction ID:</strong> ${transaction[1]._id}</li>
                            <li><strong>Date:</strong> ${new Date().toLocaleString()}</li>
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

    } catch (error) {
        await session.abortTransaction();
        session.endSession(); 

        res.status(400).json({
            Access:true,
            Error:Errordisplay(error).msg
        })
    }
})



module.exports=router