
// import mongoose from 'mongoose';
const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const UserSchema = new Schema({
    firstName:{
        type: String,
        required: [true,"first name is required"]
    },
    lastName:{
        type: String,
        required: [true,"last name is required"]
    },
    middleName:{
        type: String,
    },
    username:{
        type: String,
        unique: true,
        required: [true, "username is required"],
    },
    email:{
        type: String,
        unique:true,
        required:[true, "email is required"],
        match:[/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, "not a valid email address"]
    },
    phone_number:{
        type: Number,
        unique:true,
        required: [true,"Mobile number is required"]
    },
    country:{
        type: String,
        required: [true, "country is required"]
    },
    password:{
        type: String,
        required: [true, "password is invalid"]
    },
    pin:{
        type: String,
        required: [true, "pin is invalid"],
        default:'null'
    },
    userDetails_verify:{
        type: Boolean,
        default:false
    },
    email_verif:{
        type: Boolean,
        default:false
    },
    phone_number_verif:{
        type: Boolean,
        default:true
    },
    kyc:{
        type: Boolean,
        default: false
    },
    bank_verif:{
        type: Boolean,
        default: false
    },
    id_verif:{
        type: Boolean,
        default: false
    },
    agree_to_terms:{
        type:Boolean,
        default:false
    },
    Referral:{
        type:String,
    },
    Blocked:{
        type:Boolean,
        default:false
    }
}, {timestamps: true})


module.exports= mongoose.model('User_model', UserSchema);
