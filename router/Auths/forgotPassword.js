// const express = require('express');
// const router = express.Router();
const UserModel = require('../../model/User.model'); 
const userVerifModel = require('../../model/userVerif.model'); 
const bcrypt = require('bcryptjs');
const { GenOTP } = require('../../utils/random.utils');
const { Sendmail } = require('../../utils/mailer.utils');
const router= require('express').Router()


// Request Password Reset - Generate OTP and send via email
router.post('/1', async (req, res) => {
    try {
        const { email } = req.body;

        // Checking if user exists with the provided email
        const User = await UserModel.findOne({ email });
        if (!User) {
            return res.status(404).json({ Access: false, Error: 'Email not found.' });
        }

        // Generate OTP
        let OTP = GenOTP();

        // Save OTP in the verification model with a 10-minute expiration
        await userVerifModel.create({
            user_id: User._id,
            otp: OTP,
        });

        // Send OTP via email
        const emailResult = await Sendmail(
            User.email,
            'Password Reset',
            `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>IslandPay Password Reset</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            background-color: #f4f4f4;
            margin: 0;
            padding: 0;
            color: #333;
        }
        .email-container {
            max-width: 600px;
            margin: 20px auto;
            background-color: #ffffff;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
        }
        .header {
            background-color: #4b0082; /* Dark purple */
            padding: 20px;
            text-align: center;
            color: #ffffff;
            font-size: 24px;
            font-weight: bold;
        }
        .content {
            padding: 20px;
            text-align: center;
        }
        .otp {
            font-size: 20px;
            font-weight: bold;
            color: #4b0082; /* Dark purple */
            margin: 20px 0;
        }
        .message {
            font-size: 16px;
            line-height: 1.5;
            color: #555;
        }
        .footer {
            background-color: #eeeeee;
            padding: 10px;
            text-align: center;
            font-size: 12px;
            color: #777;
        }
    </style>
</head>
<body>
    <div class="email-container">
        <div class="header">
            IslandPay Password Reset
        </div>
        <div class="content">
            <p class="message">
                Your IslandPay OTP for password reset is:
            </p>
            <p class="otp">${OTP}</p> <!-- Replace with actual OTP value when sending -->
            <p class="message">
                This OTP will expire in 10 minutes.
            </p>
            <p class="message">
                If you did not request this, please ignore this message.
            </p>
        </div>
        <div class="footer">
            © 2024 IslandPay. All rights reserved.
        </div>
    </div>
</body>
</html>
`
        );

        // Check if the email was successfully sent
        if (emailResult.sent) {
            return res.status(200).json({
                Access: true,
                Error:false,
                Message: 'OTP sent to your email successfully.',
            });
        } else {
            return res.status(500).json({
                Access: false,
                Error: emailResult.error,
            });
        }
    } catch (error) {
        res.status(400).json({
            Access: false,
            Error: error.message,
        });
    }
});


// Route for verifying of OTP and reset password of user
router.post('/2', async (req, res) => {
    try {
        const { email, otp, password } = req.body;

        // Find user by email
        const User = await UserModel.findOne({ email });
        if (!User) {
            return res.status(404).json({ Access: false, Error: 'Email not found.' });
        }

        // Finding OTP record
        const verifRecord = await userVerifModel.findOne({
            user_id: User._id,
            otp
        });

        // Checking if OTP is valid
        if (!verifRecord) {
            return res.status(400).json({
                Access: false,
                Error: 'Invalid or expired OTP.',
            });
        }

         // Hash the new password before saving
         if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(password)) {
            return res.status(400).json({Access:false, Error:"Password does not meet the required criteria!"});
        }

        const hashedPassword = await bcrypt.hashSync(password, 10);
        User.password = hashedPassword;

        await User.save();

        // Delete the OTP record
        await userVerifModel.deleteOne({ _id: verifRecord._id });

        return res.status(200).json({
            Access: true,
            Error:false,
            Message: 'Password reset successfully.',
        });

         // Send OTP via email
        await Sendmail(
            User.email,
            ' Password Reset Successful',
            `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Password Reset Successful</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            background-color: #f4f4f4;
            margin: 0;
            padding: 0;
            color: #333;
        }
        .email-container {
            max-width: 600px;
            margin: 20px auto;
            background-color: #ffffff;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
        }
        .header {
            background-color: #4b0082; /* Dark purple */
            padding: 20px;
            text-align: center;
            color: #ffffff;
            font-size: 24px;
            font-weight: bold;
        }
        .content {
            padding: 20px;
            text-align: center;
        }
        .message {
            font-size: 16px;
            line-height: 1.5;
            color: #555;
        }
        .footer {
            background-color: #eeeeee;
            padding: 10px;
            text-align: center;
            font-size: 12px;
            color: #777;
        }
    </style>
</head>
<body>
    <div class="email-container">
        <div class="header">
            Password Reset Successful
        </div>
        <div class="content">
            <p class="message">
                Your password has been successfully reset. You can now log in to your IslandPay account with your new password.
            </p>
            <p class="message">
                If you did not request this change, please contact our support team immediately to secure your account.
            </p>
        </div>
        <div class="footer">
            © 2024 IslandPay. All rights reserved.
        </div>
    </div>
</body>
</html>

            `
        );

      
    } catch (error) {
        res.status(400).json({
            Access: false,
            Error: error.message,
        });
    }
});

module.exports=router
