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
    },
    Ngn:{
        type:Number,
        default:0
    },
    Usd:{
        type:Number,
        default:0
    },
    Kes:{
        type:Number,
        default:0
    },
    Zar:{
        type:Number,
        default:0
    },
    Ghs:{
        type:Number,
        default:0
    },
    Xof:{
        type:Number,
        default:0
    },
    Xaf:{
        type:Number,
        default:0
    },
    Gbp:{
        type:Number,
        default:0
    },
}, { timestamps: true });

module.exports = mongoose.model('AdminBalance_model', AdminBalanceSchema);
