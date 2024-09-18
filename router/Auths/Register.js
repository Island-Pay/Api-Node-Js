const UserModel = require('../../model/User.model')
const { Errordisplay } = require('../../utils/Auth.utils')
const bcrypt= require('bcryptjs')
const { Sendmail } = require('../../utils/mailer.utils')
const { GenOTP } = require('../../utils/random.utils')
const userVerifModel = require('../../model/userVerif.model')
const router= require('express').Router()


router.post('/1',async (req, res) => {
    try {

        //user input
        let Collect= req.body

        //hash password
        const hashPwd = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(Collect.password)?await bcrypt.hashSync(Collect.password, 10):null
        Collect.password=hashPwd

        let User = await UserModel.create(Collect)

        res.json({Access:true,Error:false, Data:User})

        await Sendmail(Collect.email,'Welcome to Island Pay',`
            <!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Welcome to Island Pay</title>
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
            <h1>Welcome to Island Pay</h1>
        </div>

        <!-- Main Content -->
        <div class="content">
            <h2>Hello and Welcome!</h2>
            <p>
                Thank you for joining Island Pay, your trusted partner for seamless cross-border payments. We’re excited to have you on board!
            </p>
            <p>
                You now have access to secure and fast payment services that make sending and receiving money across borders easier than ever. We’re here to support you at every step of your financial journey.
            </p>
            <p>
                Click the button below to explore your account and get started with Island Pay.
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
    }
})

router.get('/verify/email/1',async (req, res) => {
    try {

        //getEmail
        let userEmail= req.query.email

        let User = await UserModel.findOne({email:userEmail})

        if(!User) return res.status(404).json({Access:true,Error:"Email not found",})

        //create otp
        let OTP= GenOTP()
        await userVerifModel.create({
            user_id:User._id,
            otp:OTP
        })

        await Sendmail(User.email,'Verify Your Email',`
          <!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Verify Your Account - Island Pay</title>
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

        .otp-box {
            text-align: center;
            background-color: #f3e5f5;
            padding: 15px;
            margin: 20px 0;
            border-radius: 8px;
            font-size: 24px;
            color: #6a1b9a;
            letter-spacing: 4px;
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

            .otp-box {
                font-size: 22px;
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
            <h1>Verify Your Email</h1>
        </div>

        <!-- Main Content -->
        <div class="content">
            <h2>Confirm Your Identity</h2>
            <p>
                To complete your registration with Island Pay, please verify your account using the One-Time Password (OTP) provided below.
            </p>
            <div class="otp-box">${OTP}</div>
            <p>
                Enter this OTP in the verification page to activate your account. This code is valid for the next 10 minutes.
            </p>
            <p>
                If you didn’t request this email, please ignore it.
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

        res.json({Access:true,Error:false, Sent:true})

    } catch (error) {
        res.status(400).json({
            Access:true,
            Error:Errordisplay(error).msg
        })
    }
})


module.exports=router