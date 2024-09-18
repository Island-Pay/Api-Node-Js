const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const UserVerifSchema = new Schema({

    user_id:{
        type:String
    },
    otp:{
        type: Number,
        required: [true,"Otp is required"],
    },
    link:{
        type: String
    },
    expiresAt: {
        type: Date,
        default: Date.now,
        expires: 610,
      },

}, {timestamps:true})


module.exports= mongoose.model('UserVerif_model', UserVerifSchema);


