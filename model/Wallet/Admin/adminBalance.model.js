const mongoose = require('mongoose');

const AdminBalanceSchema = new mongoose.Schema({
    admin_id:{
        type: String,
        required:true
    },
    total_balance: {
        type: Number,
        required: true
    },
    available_balance: {
        type: Number,
        required: true
    },
    currency: {
        type: String,
        required: true
    }
}, { timestamps: true });

module.exports = mongoose.model('AdminBalance_model', AdminBalanceSchema);
