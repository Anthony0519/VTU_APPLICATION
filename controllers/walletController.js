const userModel = require("../models/userModel")
const crypto = require("crypto")
require("dotenv").config()

// const PAYSTACK_KEY = ""

const url = 'https://api.paystack.co/transaction/initialize'

const axios = require('axios')
// const userModel = require('../models/userModel')

exports.fundWallet = async(req,res)=>{
    try{

        // the id of the user making payment
        const {userId} = req.user

        // find the user
        const user = await userModel.findById(userId)
        if(!user){
            return res.status(404).json({
                error:"user not found"
            })
        }

        // get the user's amount inputed
        const { amount } = req.body; 

        // callback url 
        // const callBack = `https://localhost:${process.env.port}/api/v1/paystack/callback`

        // proccess the payment
        const response = await axios.post(
            url,
            {
                email: user.email,
                amount: amount*100,
            metadata:{
                user_Id:userId
            }
                // callback_url: callBack 
            },
            {
                headers: {
                    Authorization: `Bearer ${process.env.PAYSTACK_SECRET}`,
                    'Content-Type': 'application/json'
                }
            }
        )
        console.log('Paystack Response:', response);
        // res.redirect(response.data.data.authorization_url)
        res.status(200).json({
            message: "Transaction initialization successful",
            data: response.data.data
        })

    } catch (error) {
        // console.error('Error initiating transaction:', error.response ? error.response.data : error.message),
        res.status(500).json({
            error: error.message
        })
    }
}

exports.callBackUrl = async(req,res)=>{
    try{
        console.log(req.body)
        const eventPayload = JSON.stringify(req.body);
        const paystackSignature = req.headers['x-paystack-signature'];
    
        // Verify signature
        const hash = crypto.createHmac('sha512', process.env.PAYSTACK_SECRET).update(eventPayload).digest('hex');
        if (hash !== paystackSignature) {
            // Signature does not match, reject the request
            console.error('Invalid   signature');
            return res.status(403).json({ 
                error: 'Invalid signature' 
            });
        }
    
        // Signature is valid, process the event
        console.log('Signature is valid');
        const event = req.body;
    
        // Verify event type and handle accordingly
        if (event.event === 'charge.success') {
            // Retrieve necessary information from the event
            const userId = event.data.metadata.user_id;
            const amount = event.data.amount;

            const user = await userModel.findById(userId)
            if(!user){
                return res.status(404).json({
                    error:"user not found"
                })
            }

            user.acctBalance+amount
            await user.save()
    
            // Respond with success status
            res.status(200).json({ 
                message: 'Webhook received and processed successfully' 
            });
        } else {
            // Handle other event types if needed
            res.status(200).json({ 
                message: 'Webhook received but not processed for this event type'
             });
        }

    }catch(error){
        res.status(500).json({
            error:error.message
        })
    }
}
