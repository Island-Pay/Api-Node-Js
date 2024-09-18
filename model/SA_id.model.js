const mongoose = require('mongoose');

const SAIDSchema = new mongoose.Schema({
    user_id: {
        type: String,
        required: true
    },
    said: {
        type: String,
        required: true,
        unique: true,  // SA ID should be unique per user
        match: [/^[0-9]{13}$/, "Invalid South African ID format"],  // SA ID is 13 digits long
        minlength: 13,
        maxlength: 13
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

module.exports = mongoose.model('SAID_model', SAIDSchema);
