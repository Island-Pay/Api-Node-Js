const mongoose = require('mongoose');

const UserWallet = new mongoose.Schema({
    user_id: {
        type: String,
        required: true,
        unique:true,
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
    Kof:{
        type:Number,
        default:0
    },
    Kaf:{
        type:Number,
        default:0
    },
    Gbp:{
        type:Number,
        default:0
    },
}, { timestamps: true });

module.exports = mongoose.model('UserWallet', UserWallet);
