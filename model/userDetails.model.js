const mongoose = require('mongoose');

const UserDetailsSchema = new mongoose.Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User_model', 
        required: true
    },
    profile_photo: {
        type: String,  // to store the image URL or a file path
        required: false
    },
    dateOfBirth: {
        type: Date,
        required: false
    }
}, { timestamps: true });

module.exports = mongoose.model('UserDetails_model', UserDetailsSchema);
