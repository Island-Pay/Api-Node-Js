const express = require('express')
const app = express()
const port = process.env.PORT||3001

//body parser
app.use(require('body-parser').urlencoded({extended:true,limit:"50mb"}))
app.use(require('body-parser').json({extended:true,limit:"50mb"}))

//cors
app.use(require('cors')())

//dotenv
require('dotenv').config()

//morgan
app.use(require('morgan')('dev'))

//ejs
app.set('view engine','ejs')
//static public
app.use(express.static('public'))

//fileupload
app.use(require('express-fileupload')({useTempFiles:true}))

//session
app.use(require('express-session')({secret:process.env.sessionSecret, resave: true,
    saveUninitialized: true,
    cookie: { expires: 172800000 }}))

// mongoose 
let mongoose= require('mongoose')
const UserModel = require('./model/User.model')
const UserWalletModel = require('./model/Wallet/User/UserWallet.model')
mongoose.set('strictQuery',true)
mongoose.set('runValidators',true)
mongoose.connect(process.env.mongoUri)
  .then(() => {
    console.log("db connected");
    app.listen(port, () => console.log(`http://localhost:${port}`))
  })
  .catch((error) => {
    console.error("Error connecting to the database:", error);
  });





  ////////////Routes///////////////////

  //////////////Auth///////////////
app.use('/register',require('./router/Auths/Register'))//register routes
app.use('/login',require('./router/Auths/Logins'))//Login routes
app.use('/forgotpassword',require('./router/Auths/forgotPassword'))//Login routes

/////////////Wallet//////////////
app.use('/deposit',require('./router/Wallet/Deposit'))//deposit routes
app.use('/webhook',require('./router/Wallet/Webhook'))//webhook routes
app.use('/sendmoney',require('./router/Wallet/SendMoneyInit'))//send money routes
app.use('/convert',require('./router/Wallet/Convert'))//convert money routes
