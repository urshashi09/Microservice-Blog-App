import express from 'express';
import dotenv from 'dotenv'
import blogRoutes from './routes/blog.js';
import {createClient} from 'redis'
import { startCacheConsumer } from './utils/consumer.js';
import cors from 'cors'
import { sql } from './utils/db.js';

dotenv.config();

const app = express();

app.use(express.json());

app.use(cors())

const PORT = process.env.PORT || 7000;

async function initDB() {
    try {
        await sql`
            CREATE TABLE IF NOT EXISTS comments (
                id SERIAL PRIMARY KEY,
                comment VARCHAR(255) NOT NULL,
                userid VARCHAR(255) NOT NULL,
                username VARCHAR(255) NOT NULL,
                blogid VARCHAR(255) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `

        await sql`
            CREATE TABLE IF NOT EXISTS savedblogs (
                id SERIAL PRIMARY KEY,
                userid VARCHAR(255) NOT NULL,
                blogid VARCHAR(255) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `

        console.log("Blog service database initialized successfully");
    } catch (error) {
        console.error("Error initializing blog service database:", error);
    }
}

export const redisClient= createClient({
    url: process.env.REDIS_URI as string
})

redisClient.connect().then(() => {
    console.log("Connected to Redis");
    startCacheConsumer()
}).catch((error) => {
    console.error("Error connecting to Redis:", error);
});

app.use('/api/v1', blogRoutes);

initDB().then(() => {
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
});
