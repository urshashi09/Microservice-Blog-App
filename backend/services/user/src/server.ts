import express from 'express';
import dotenv from 'dotenv'
import connectDB from './utils/db.js';
import userRoutes from './routes/user.js'
import {v2 as cloudinary} from 'cloudinary'
import cors from 'cors'

dotenv.config();

cloudinary.config({
    cloud_name: process.env.CLOUD_NAME as string,
    api_key: process.env.CLOUDINARY_API_KEY as string,
    api_secret: process.env.CLOUDINARY_API_SECRET as string,
})

const app = express();
app.use(cors())

app.use(express.json());

connectDB();

app.use('/api/user', userRoutes);

const PORT = process.env.PORT || 6001;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});      
