const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const UserBankSchema = new Schema({
    user_id:{
        type: String,
        required: true
    },
    bvn:{
        type: Number,
        required: true
    },
    verified:{
        default: false
    },
    consent_verif:{
        default: true
    },
    nin:{
        type: Number,
        required: true
    },
    kora_ref:{
        type: String,
        required: true
    }
}, {timeseries: true});

module.exports= mongoose.model('UserBank_model', UserBankSchema);