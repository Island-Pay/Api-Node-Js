const mongoose = require('mongoose');

const AdminTransactionSchema = new mongoose.Schema({
    user_id: {
        type: String,
        required: true
    },
    transaction_type: {
        type: String,
        enum: ['credit', 'debit'],
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    currency: {
        type: String,
        required: true,
        enum:["NGN","USD","KES","ZAR","GHS","XOF","XAF","GBP","CASH"]
    },
    description: {
        type: String
    }
}, { timestamps: true });

module.exports = mongoose.model('AdminTransaction_model', AdminTransactionSchema);
