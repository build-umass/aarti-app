// apps/backend/db.ts
import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: "../../.env" });

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/aarti-app';

export async function connectToDatabase() {
    try {
        console.log(MONGODB_URI)
        await mongoose.connect(MONGODB_URI);
        console.log('Connected to MongoDB');
    } catch (error) {
        console.error('MongoDB connection error:', error);
        throw error;
    }
}