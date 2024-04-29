const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    fullname: {
        type: String,
    },
    email: {
        type: String,
        unique: true
    },
    phoneNumber: {
        type: String,
    },
    walletId: {
        type: String,
    },
    password: {
        type: String,
    },
    Pin: {
        type: String,
    },
    acctBalance:{
        type: Number,
        default: 0.00
    },
    blacklist : {
        type: Array,
        default: [],
    }
})

const userModel  = mongoose.model('user', userSchema)

module.exports = userModel


