const randtoken = require('rand-token').generator()


function GenOTP() {
    return randtoken.generate(4,'0123456789');
}


function Links() {
    return randtoken.generate(16,'0123456789qwertyuiopasdfghjklzxcvbnm$.');
    
}

function percentagePrice(Amount, percentage){
 return (percentage*Amount)/100
}


module.exports={GenOTP,Links, percentagePrice}