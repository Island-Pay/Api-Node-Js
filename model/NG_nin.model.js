const mongoose = require('mongoose');

const NGNinSchema = new mongoose.Schema({
    user_id: {
        type: String,
        required: true
    },
    nin: {
        type: Number,
        required: true,
        unique: true,  // NIN should be unique per user
        minlength: 11,
        maxlength: 11,  // NIN is 11 digits long in Nigeria
        match: [/^[0-9]{11}$/, "Invalid NIN format"]
    },
    verified: {
        type: Boolean,
        default: false
    },
    consent_verif: {
        type: Boolean,
        default: true
    }
}, { timestamps: true });

module.exports = mongoose.model('NGNin_model', NGNinSchema);
