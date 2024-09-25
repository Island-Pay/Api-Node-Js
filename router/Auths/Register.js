const UserModel = require('../../model/User.model')
const { Errordisplay } = require('../../utils/Auth.utils')
const bcrypt= require('bcryptjs')
const { Sendmail, SendSMS } = require('../../utils/mailer.utils')
const { GenOTP } = require('../../utils/random.utils')
const userVerifModel = require('../../model/userVerif.model')
const userDetailsModel = require('../../model/userDetails.model')
const router= require('express').Router()


router.post('/1',async (req, res) => {
    try {

        //user input
        let Collect= req.body

        //hash password
        const hashPwd = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(Collect.password)?await bcrypt.hashSync(Collect.password, 10):null
        Collect.password=hashPwd

        // if not nigerian verify id
        if(Collect.country!="Nigeria")Collect.bank_verif==true;

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

router.post('/verify/email/1', async (req, res) => {
    try {

        //getEmail
        let userEmail= req.query.email

        //get otp
        const {otp}= req.body

        //check user
        let User = await UserModel.findOne({email:userEmail,email_verif:false})

        if(!User) return res.status(404).json({Access:true,Error:"You dont have access to verify",})

        // get otp
        let Verif= await userVerifModel.findOne({user_id:User._id})

        //check otp
        if(Verif.otp!=otp) return res.status(404).json({Access:true,Error:"Invalid OTP",})
        
        await UserModel.updateOne({email:userEmail},{email_verif:true})

        res.json({Access:true,Error:false, Verified:true})
        
        await Sendmail(User.email,'Email verified',`
        <!DOCTYPE html>
        <html lang="en">
        
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Email Verified - Island Pay</title>
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
                    <h1>Email Successfully Verified</h1>
                </div>
        
                <!-- Main Content -->
                <div class="content">
                    
                    <p>
                        Congratulations! Your email address has been successfully verified, and your Island Pay account is now active.
                    </p>
                    <p>
                        You can now start using Island Pay to manage your payments and transactions with ease. Click the button below to get started:
                    </p>
                    <p style="text-align:center;">
                        <a href="https://yourappurl.com" class="button">Get Started</a>
                    </p>
                    <p>
                        If you have any questions or need support, feel free to contact us at <a href="mailto:support@islandpay.com">support@islandpay.com</a>.
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

router.get('/verify/phoneNumber/1', async (req, res) => {
    try {
        
        let userPhoneNo= req.query.phone_number

        let User = await UserModel.findOne({phone_number:userPhoneNo})

        if(!User) return res.status(404).json({Access:false,Error:"Phone number not found",})

        //create otp
        let OTP= GenOTP()
        await userVerifModel.create({
            user_id:User._id,
            otp:OTP,
        })

         // Sending OTP via SMS
         const smsResult = await SendSMS(User.phone_number,` Your IslandPay Phone Number Verification OTP is: ${OTP}. Expires in the next 10 minutes.`);

         console.log(smsResult);
         if (smsResult.sent) {
             return res.status(200).json({
                 Access: true,
                 Error:false,
                 Sent: true
             });
         } else {
             return res.status(500).json({
                 Access: true,
                 Error: smsResult.Error
             });
         }

    } catch (error) {

        res.status(400).json({
            Access:false,
            Error:Errordisplay(error).msg
        })
    }
})

router.post('/verify/phoneNumber/1', async (req, res) => {
    try {
        const { userPhoneNo, OTP } = req.body;  

        // Find the user by phone number
        const User = await UserModel.findOne({ phone_number: userPhoneNo });
        
        if (!User) {
            return res.status(404).json({
                Access: false,
                Error: "User not found with this phone number"
            });
        }

        // Finding the OTP entry from the userVerifModel
        const verifRecord = await userVerifModel.findOne({
            user_id: User._id,
            otp: OTP
        });

        if (verifRecord.otp !== OTP) {
            return res.status(400).json({
                Access: false,
                Error: "Invalid OTP"
            });
        }

        // If OTP is valid, update the user's mobile_number_verif to true
        User.phone_number_verif = true;
        await User.save();

        // delete the verification record after successful verification
        await userVerifModel.deleteOne({ _id: verifRecord._id });

        return res.status(200).json({
            Access: true,
            Error: false,
            Message: "Phone number verified successfully"
        });

    } catch (error) {
        return res.status(400).json({
            Access: false,
            Error: error.message
        });
    }
});

router.post('/userdetails',async (req, res) => {
    try {

        //user input
        let Collect= req.body

        let userEmail= req.query.email

        let User = await UserModel.findOne({email:userEmail, userDetails_verify:false})

        if(!User) return res.status(404).json({Access:true,Error:"User not found",})

        Collect.user_id=User._id

        await userDetailsModel.create(Collect)

        await UserModel.updateOne({email:userEmail},{userDetails_verify:true})

        res.json({Access:true,Error:false, Data:Collect})
    } catch (error) {
        res.status(400).json({
            Access:true,
            Error:Errordisplay(error).msg
        })
    }
})
module.exports=router