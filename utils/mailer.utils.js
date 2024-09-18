const mailer = require("nodemailer");
const { default: axios } = require("axios");

const myemail = mailer.createTransport({

  service: process.env.service,
  host: process.env.host,
  // port: 465,

  port: 465,

  auth: {
    user: process.env.email,
    pass: process.env.pass,
  },
  tls: {
    rejectUnauthorized: false
  }
});

const https = require('follow-redirects').https;

async function Sendmail(to, subject, html, many=false) {
    try {
        const mailoption = {
            from: `${process.env.Company} <${process.env.email}>`,
            ...{bcc:to},
            subject: subject,
            html: html,
          };
          await myemail.sendMail(mailoption);
          return {sent:true}
    } catch (error) {
        console.log(error.message);
        return{error:error.message}
    }
}

async function SendSMS(to, text){
  try {

    //integrating api
    await axios({
      url:'https://www.bulksmsnigeria.com/api/v2/sms',
      method:'post',
      headers:{
        Accept:'application/json',
        'Content-Type':'application/json'
      },
      data:JSON.stringify({
        from:process.env.Company,
        to,
        body:text,
        api_token:process.env.bulkSMSApiKey,
        gateway:'international'
      })
    })

    return{sent:true}
    
  } catch (error) {
    console.log(error.response.data);

    return {Error:error.response.data.data.message}
  }
}


module.exports={Sendmail, SendSMS}