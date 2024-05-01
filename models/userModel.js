import {Schema,model} from 'mongoose'

const userSchema = new Schema({
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
    bankDetail:[{
        type:Schema.Types.ObjectId,
        ref:"bankDetails"
    }],
    blacklist : {
        type: Array,
        default: [],
    }
})

const userModel  = model('user', userSchema)

export default userModel


