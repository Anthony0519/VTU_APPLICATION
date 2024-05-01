import {Schema,model} from "mongoose"

const bankDetailsSchema = new Schema({
    acctName:{
        type:String
    },
    acctNumber:{
        type:String
    },
    bankCode:{
        type:String
    },
    ref_code:{
        type:String
    },
    user:{
        type:Schema.Types.ObjectId,
        ref:"users"
    }

},{timestamp:true})

const bankModel = model("BankDetail",bankDetailsSchema)

export default bankModel