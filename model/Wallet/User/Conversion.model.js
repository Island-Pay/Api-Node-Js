const mongoose = require('mongoose');

const ConversionSchema = new mongoose.Schema({
    user_id: {
        type: String,
        required: true
    },
    from_currency: {
        type: String,
        required: true
    },
    to_currency: {
        type: String,
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    conversion_rate: {
        type: Number,
        required: true
    },
    converted_amount: {
        type: Number,
        required: true
    }
}, { timestamps: true });

module.exports = mongoose.model('Conversion_model', ConversionSchema);
