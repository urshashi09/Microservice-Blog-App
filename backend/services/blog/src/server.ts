import express from 'express';
import dotenv from 'dotenv'
import blogRoutes from './routes/blog.js';
import {createClient} from 'redis'
import { startCacheConsumer } from './utils/consumer.js';
import cors from 'cors'

dotenv.config();

const app = express();

app.use(express.json());

app.use(cors())

const PORT = process.env.PORT || 7000;

startCacheConsumer()

export const redisClient= createClient({
    url: process.env.REDIS_URI as string
})

redisClient.connect().then(() => {
    console.log("Connected to Redis");
}).catch((error) => {
    console.error("Error connecting to Redis:", error);
});

app.use('/api/v1', blogRoutes);

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});