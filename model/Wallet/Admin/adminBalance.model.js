const mongoose = require('mongoose');

const AdminBalanceSchema = new mongoose.Schema({
    total_balance: {
        type: Number,
        required: true,
        default:0
    },
    available_balance: {
        type: Number,
        required: true,
        default:0
    },
    SystemBalance: {
        type: Number,
        required: true,
        default:0
    }
}, { timestamps: true });

module.exports = mongoose.model('AdminBalance_model', AdminBalanceSchema);
