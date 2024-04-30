const axios = require('axios');
const crypto = require('crypto');
const userModel = require('../models/userModel');
require('dotenv').config();
const fs = require("fs")

const url = 'https://api.paystack.co/transaction/initialize';

exports.fundWallet = async (req, res) => {
    try {
        const { userId } = req.user;
        const user = await userModel.findById(userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const { amount } = req.body;

        const response = await axios.post(
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

        res.status(200).json({
            message: 'Transaction initialization successful',
            data: response.data.data
        });
    } catch (error) {
        console.error('Error initializing transaction:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

exports.callbackUrl = async (req, res) => {
    try {
        // Log incoming request to server logs
        const logStream = fs.createWriteStream('webhook.log', { flags: 'a' });
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
            return res.status(403).json({ error: 'Invalid signature' });
        }

        console.log('Signature is valid');

        // Handle the event based on its type
        if (event === 'charge.success') {
            const userId = data.metadata.user_id;
            const amount = data.amount;

            // Find the user in the database
            const user = await userModel.findById(userId);
            if (!user) {
                return res.status(404).json({ error: 'User not found' });
            }

            // Update user's account balance
            user.acctBalance += amount;
            await user.save();

            // Respond with success status
            res.status(200).json({ message: 'User balance updated successfully' });
        } else {
            // Handle other event types if needed
            res.status(200).json({ message: 'Webhook received but not processed for this event type' });
        }
    } catch (error) {
        console.error('Error processing webhook:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
