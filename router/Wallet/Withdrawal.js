const { default: axios } = require('axios');
const UserWalletModel = require('../../model/Wallet/User/UserWallet.model');
const TransactionModel = require('../../model/Wallet/User/Transaction.model');
const TemporaryWithdrawalModel = require('../../model/Wallet/User/TemporaryWithdrawal.model');
const { Sendmail } = require('../../utils/mailer.utils');
const { Errordisplay, VerifyJWTToken } = require('../../utils/Auth.utils');
const mongoose = require('mongoose');
const router = require('express').Router();

// Withdrawal route
router.post('/', VerifyJWTToken, async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        //mobile number for country like KES or GHS 
        let { amount, currency, mobile_number, provider } = req.body;  
        let user_id = req.user._id;

        // Validate currency and mobile money fields
        if (!['NGN', 'USD', 'KES', 'GHS'].includes(currency)) {
            return res.status(400).json({ Access: false, Error: 'Invalid currency' });
        }

        if (['GHS', 'KES'].includes(currency) && (!mobile_number || !provider)) {
            return res.status(400).json({ Access: false, Error: 'Mobile money details required for this currency.' });
        }

        // Checking if the user has enough balance
        const userWallet = await UserWalletModel.findOne({ user_id }).session(session);
        if (!userWallet || userWallet[currency.toLowerCase()] < amount) {
            return res.status(400).json({ Access: false, Error: 'Insufficient balance' });
        }

        // here to deduct the amount from user’s wallet temporarily
        await UserWalletModel.updateOne({ user_id }, {
            $inc: { [currency.toLowerCase()]: - amount }
        }).session(session);

        // Save temporary withdrawal balance oh
        let tempWithdrawal = await TemporaryWithdrawalModel.create([{
            user_id,
            amount,
            currency
        }], { session });

        // Prepare the request data based on currency
        let withdrawalRequest = {
            amount,
            currency,
            reference: tempWithdrawal._id,
            narration: `Withdrawal request for ${currency} by ${req.user.username}`
        };

        // For GHS and KES, send to mobile money
        if (currency === 'GHS' || currency === 'KES') {
            withdrawalRequest.mobile_money = {
                phone_number: mobile_number,
                provider: provider  // e.g., 'MTN', 'Vodafone', 'AirtelTigo' for GHS; 'Safaricom' for KES
            };
        } else {
            // For NGN or USD, send to bank account
            withdrawalRequest.bank_account = {
                account_name: req.user.account_name,
                account_number: req.user.account_number,
                bank_code: req.user.bank_code
            };
        }

        // Send withdrawal request to Korapay
        let integration = await axios({
            url: `${process.env.KoraApiLink}/api/v1/withdrawals`,
            method: 'post',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
                Authorization: `Bearer ${process.env.KoraSecretKey}`
            },
            data: JSON.stringify(withdrawalRequest)
        });

        let data = integration.data;

        // Save the successful transaction
        let transaction = await TransactionModel.create([{
            user_id,
            amount,
            type: 'Debit',
            narration: `Withdrawal of ${amount} ${currency}`,
            from: currency,
            to: currency === 'NGN' || currency === 'USD' ? 'Bank Account' : 'Mobile Money',
            process: 'Successful'
        }], { session });

        await session.commitTransaction();
        session.endSession();

        // Send confirmation email
        await Sendmail(req.user.email, 'Withdrawal Successful - Island Pay', `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Withdrawal Successful</title>
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
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>Withdrawal Successful</h1>
                </div>
                <div class="content">
                    <h2>Your withdrawal has been processed</h2>
                    <p>Dear ${req.user.username},</p>
                    <p>We are pleased to inform you that your withdrawal of <strong>${amount} ${currency}</strong> has been successfully processed via ${currency === 'NGN' || currency === 'USD' ? 'Bank Account' : 'Mobile Money'}.</p>
                    <p>If you have any questions, please contact our support team at <a href="mailto:${process.env.supportEmail}">${process.env.supportEmail}</a>.</p>
                </div>
                <div class="footer">
                    <p>&copy; 2024 Island Pay. All Rights Reserved.</p>
                </div>
            </div>
        </body>
        </html>
        `);

        return res.status(200).json({
            Access: true,
            Message: 'Withdrawal successful',
            RedirectUrl: data.data.checkout_url
        });

    } catch (error) {
        await session.abortTransaction();
        session.endSession();

        if (error.isAxiosError) {
            return res.status(400).json({
                Access: false,
                Error: error.response ? error.response.data.message : 'Axios API error'
            });
        }

        return res.status(500).json({
            Access: false,
            Error: Errordisplay(error).msg
        });
    }
});

module.exports = router;
