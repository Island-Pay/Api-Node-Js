const mongoose = require('mongoose');

const AdminTransactionSchema = new mongoose.Schema({
    admin_id: {
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
        required: true
    },
    description: {
        type: String
    }
}, { timestamps: true });

module.exports = mongoose.model('AdminTransaction_model', AdminTransactionSchema);
