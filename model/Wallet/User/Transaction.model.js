const mongoose = require('mongoose');

const Transactions_Model = new mongoose.Schema({
    user_id: {
        type: String,
        required: [true,"userId is damn required"]
    },

    amount: {
        type: Number,
        required: [true,"Amount is required"],
        min:[1,"Amount is too small"]
    },
    charges: {
        type: Number,
        required: [true,"Charges is required"],
        default:0
    },

    type: {
        type: String,
        required: [true,"Type is required"],
        enum:["Debit","Credit","Admin"]
    },

    naration: {
        type: String,
        required: [true,"Naration is required"],
    },
    from: {
        type: String,
        required: [true,"From is required"],
        enum:["NGN","USD","KES","ZAR","GHS","XOF","XAF","GBP","CASH"]
    },
    to: {
        type: String,
        required: [true,"To is required"],
        enum:["NGN","USD","KES","ZAR","GHS","XOF","XAF","GBP","CASH"]
    },
    process: {
        type: String,
        required: [true,"Process is required"],
        enum:["Successfull","Failed","Pending"]
    },
}, { timestamps: true });

module.exports = mongoose.model('Transactions_Model', Transactions_Model);
