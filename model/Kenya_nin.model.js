const mongoose = require('mongoose');

const KenyaNinSchema = new mongoose.Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User_model',  // references user
        required: true
    },
    nin: {
        type: String,
        required: [true,"Kenya Nin is required"],
        unique: true,  // NIN should be unique
        // match: [/^[0-9]{8}$/, "Invalid Kenyan NIN format"],  // Kenyan NIN is 8 digits long
        minlength: [8,"Minimum of 8 character"],
        maxlength: [8,"Maximum of 8 character"]
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

module.exports = mongoose.model('KenyaNin_model', KenyaNinSchema);
