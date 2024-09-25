const mongoose = require('mongoose');

const UserDetailsSchema = new mongoose.Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User_model', 
        required: true
    },
    profile_photo: {
        type: String,  // to store the image URL or a file path
        default:'none'
    },
    profile_photoPublicID:{
        type: String,  // to store the image URL or a file path
        default:'none'
    },
    dateOfBirth: {
        type: Date,
        required: [true, "Date of birth is required"]
    },
    address: {
        type: String,
        required: [true, "Address is required"]
    },
    city: {
        type: String,
        required: [true, "City is required"]
    },
    state: {
        type: String,
        required: [true, "State is required"]
    },
    country: {
        type: String,
        required: [true, "Country is required"]
    },
    zipCode: {
        type: String,
        required: [true, "Zip code is required"]
    }
    
}, { timestamps: true });

module.exports = mongoose.model('UserDetails_model', UserDetailsSchema);
