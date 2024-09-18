const mongoose = require('mongoose');

const GhanaSSNITSchema = new mongoose.Schema({
    user_id: {
        type: String,
        required: true
    },
    ssnit: {
        type: String,
        required: true,
        unique: true,  // SSNIT number should be unique
        match: [/^[A-Z0-9]{10}$/, "Invalid SSNIT number format"],  // SSNIT numbers are alphanumeric and 10 characters long
        minlength: 10,
        maxlength: 10
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

module.exports = mongoose.model('GhanaSSNIT_model', GhanaSSNITSchema);
