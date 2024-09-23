const mongoose = require('mongoose');

const FailedTransactionSchema = new mongoose.Schema({
    user_id: {
        type: String,
        required: true
    },
    transaction_id: {
        type: String,
        required: true,
        unique: true
    },
    reason: {
        type: String,
        required: true,
        enum: ['insufficient funds', 'network error', 'card declined', 'limit exceeded', 'other']
    },
    amount: {
        type: Number,
        required: true
    },
    charges: {
        type: Number,  
        default: 0
    },
    currency: {
        type: String,
        required: true
    },
    attempted_on: {
        type: Date,
        default: Date.now
    },
    ip_address: {
        type: String  // Captures the IP address for extra security/audit
    }
}, { timestamps: true });

module.exports = mongoose.model('FailedTransaction_model', FailedTransactionSchema);
