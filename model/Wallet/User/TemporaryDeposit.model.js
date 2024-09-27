const mongoose = require('mongoose');

const Temporary_deposit = new mongoose.Schema({
    user_id: {
        type: String,
        required: true,
        unique:true
    },
    amount:{
        type:Number,
        required:[true,"amount is required"]
    },
    currency:{
        type: String,
        required: [true,"Select a currency"],
        enum:['NGN', 'KES', 'GHS', 'USD']
    },
}, { timestamps: true });

module.exports = mongoose.model('Temporary_deposit', Temporary_deposit);
