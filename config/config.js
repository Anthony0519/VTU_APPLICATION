import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

export const connectDB = async () => {
    try {
        const db = process.env.DBLink;
        await mongoose.connect(db)
        console.log('Database connection established')
    } catch (error) {
        console.error('Database connection error:', error.message)
    }
};
