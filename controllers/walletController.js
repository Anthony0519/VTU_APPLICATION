import axios from 'axios'
import crypto from 'crypto'
import userModel from '../models/userModel.js'
import bankModel from "../models/bankModel.js"
import dotenv from 'dotenv'
dotenv.config()
import {createWriteStream} from "fs"

const url = 'https://api.paystack.co/transaction/initialize';

export const fundWallet = async (req, res) => {
    try {
        const { userId } = req.user;
        const user = await userModel.findById(userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const { amount } = req.body;

        const initiateTransfer = await axios.post(
            url,
            {
                email: user.email,
                amount: amount * 100,
                metadata: {
                    user_id: userId
                }
            },
            {
                headers: {
                    Authorization: `Bearer ${process.env.PAYSTACK_SECRET}`,
                    'Content-Type': 'application/json'
                }
            }
        );
        const response = initiateTransfer.data.data

        res.status(200).json({
            message: 'Transaction initialization successful',
            data: response
        });
    } catch (error) {
        console.error('Error initializing transaction:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const callbackUrl = async (req, res) => {
    try {
        // Log incoming request to server logs
        const logStream = createWriteStream('webhook.log', { flags: 'a' });
        logStream.write(`[${new Date().toISOString()}] ${req.method} ${req.url} - ${JSON.stringify(req.body)}\n`);
        logStream.end();

        // Extract necessary data from the request
        const { event, data } = req.body;
        const paystackSignature = req.headers['x-paystack-signature'];

        // Verify Paystack signature
        const hash = crypto.createHmac('sha512', process.env.PAYSTACK_SECRET)
            .update(JSON.stringify(req.body))
            .digest('hex');

        if (hash !== paystackSignature) {
            console.error('Invalid signature');
            return res.status(403).json({
                 error: 'Invalid signature'
                 });
        }

        console.log('Signature is valid');

        // Handle the event based on its type
        if (event === 'charge.success') {
            const userId = data.metadata.user_id;
            const amount = data.amount;

            // Find the user in the database
            const user = await userModel.findById(userId);
            if (!user) {
                return res.status(404).json({ 
                    error: 'User not found' 
                });
            }

            // Update user's account balance
            user.acctBalance += amount;
            await user.save();

            // Respond with success status
            res.status(200).json({
                 message: 'User balance updated successfully'
             });
        } else {
            // Handle other event types if needed
            res.status(200).json({
                 message: 'Webhook received but not processed for this event type' 
            });
        }
    } catch (error) {
        console.error('Error processing webhook:', error);
        res.status(500).json({ 
            error: 'Internal server error'
         });
    }
}

export const getBanks = async(req,res)=>{
        try {
        const allAvailableBanks = await axios.get(
            'https://api.paystack.co/bank',
            {
                headers: {
                    Authorization: `Bearer ${process.env.PAYSTACK_SECRET}`
                }
            }
        );
        const extractBank = allAvailableBanks.data.data
        const filterBank = extractBank.filter(banks => {
            const neededBank = ["Access Bank","Guaranty Trust Bank","Zenith Bank","Fidelity Bank","United Bank For Africa","Kuda Micro Finance Bank","Opay Limited"]
            return neededBank.includes(banks.name)
        })
        return res.status(200).json({
            lenths:filterBank.length,
            banks:filterBank
        })
    } catch (error) {
        console.error('Error fetching bank list:', error.allAvailableBanks ? error.allAvailableBanks.data : error.message)
        return res.status(500).json({
            error:error.message
        }) 
    }
}

export const bankDetails = async (req,res)=>{
    try{
        // get the user id
        const {userId} = req.user

        // find the user with the id
        const user = await userModel.findById(userId)
        if(!user){
            return res.status(404).json({
                message:"user not found"
            })
        }

        // get the bank details from the body
        const {acctName,acctNumber,bankCode} = req.body

        // validate the bank details with paystack
        const addBank = await axios.post(
            'https://api.paystack.co/transferrecipient',
            {
                type: "nuban",
                name: acctName,
                account_number: acctNumber,
                bank_code: bankCode,
                currency: "NGN"
            },
            {
                headers: {
                    Authorization: `Bearer ${process.env.PAYSTACK_SECRET}`,
                    'Content-Type': 'application/json'
                }
            }
        )

        // get the response from the api
        const response = addBank.data.data

        const saveBankDetails = await bankModel.create({
            acctName,
            acctNumber,
            bankCode,
            user:userId,
            ref_code:response.recipient_code,
        })

        user.bankDetail.push(saveBankDetails._id)
        await user.save()

        res.status(200).json({
            message:"bank details added successfully",
            data:response,
            bank:saveBankDetails,
        })

    }catch(error){
        console.error('Error fetching bank list:', error.allAvailableBanks ? error.allAvailableBanks.data : error.message),
        res.status(500).json({
            error:error.message
        })
    }
}
