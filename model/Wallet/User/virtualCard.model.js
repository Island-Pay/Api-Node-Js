const mongoose = require('mongoose');

const VirtualCardSchema = new mongoose.Schema({
    user_id: {
        type: String,
        required: true
    },
    card_number: {
        type: String,
        required: true,
        unique: true
    },
    card_type: {
        type: String,
        enum: ['Visa', 'MasterCard'],  //card types
        required: true
    },
    expiration_date: {
        type: Date,
        required: true
    },
    cvv: {
        type: Number,
        required: true
    },
    balance: {
        type: Number,
        required: true
    },
    currency: {
        type: String,
        required: true,
        enum:['NGN',"USD"]
    },
    status: {
        type: String,
        enum: ['active', 'inactive', 'blocked'],
        default: 'active'
    }
}, { timestamps: true });

module.exports = mongoose.model('VirtualCard_model', VirtualCardSchema);
