import express from 'express';
import dotenv from 'dotenv'
import { sql } from './utils/db.js';
import blogRoutes from './routes/blog.js';
import {v2 as cloudinary} from 'cloudinary'
import { connectRabbitmq } from './utils/rabbitmq.js';
import cors from 'cors'

dotenv.config();

cloudinary.config({
    cloud_name: process.env.CLOUD_NAME as string,
    api_key: process.env.CLOUDINARY_API_KEY as string,
    api_secret: process.env.CLOUDINARY_API_SECRET as string,
})


const app = express();

app.use(express.json());

app.use(cors())

const PORT = process.env.PORT || 5000;


async function initDB() {
    try {
        await sql`
            CREATE TABLE IF NOT EXISTS blogs (
            id SERIAL PRIMARY KEY,
            title VARCHAR(255) NOT NULL,
            description VARCHAR(255) NOT NULL,
            blogcontent TEXT NOT NULL,
            image TEXT NOT NULL,
            category VARCHAR(255) NOT NULL,
            author VARCHAR(255) NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )`;
        await sql`
            CREATE TABLE IF NOT EXISTS comments (
            id SERIAL PRIMARY KEY,
            comment VARCHAR(255) NOT NULL,
            userid VARCHAR(255) NOT NULL,
            username VARCHAR(255) NOT NULL,
            blogid VARCHAR(255) NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )`;
        await sql`
            CREATE TABLE IF NOT EXISTS savedblogs (
            id SERIAL PRIMARY KEY,
            userid VARCHAR(255) NOT NULL,
            blogid VARCHAR(255) NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )`;

        console.log("database initialized successfully");

    } catch (error) {
        console.error("Error connecting to db:", error);
    }
}

app.use('/api/v1', blogRoutes);

Promise.all([connectRabbitmq(), initDB()]).then(() => {
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
});


