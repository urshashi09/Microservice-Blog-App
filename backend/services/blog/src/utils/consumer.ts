import amqp from "amqplib";
import { redisClient } from "../server.js";
import { sql } from "./db.js";

interface cacheInvalidationMessage {
    action: string;
    keys: string[];
}

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const startCacheConsumer = async () => {
    const maxAttempts = Number(process.env.RABBITMQ_CONNECT_ATTEMPTS) || 10;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        try {
        const connection = await amqp.connect({
            protocol: "amqp",
            hostname: process.env.RABBITMQ_HOST || "localhost",
            port: Number(process.env.RABBITMQ_PORT) || 5672,
            username: process.env.RABBITMQ_USER || "admin",
            password: process.env.RABBITMQ_PASSWORD || "admin123",
        });
        const channel = await connection.createChannel();

        const queueName = "cache-invalidation";

        await channel.assertQueue(queueName, { durable: true });

        console.log("✅ blog service cache consumer started ")

        channel.consume(queueName, async (message) => {
            if (message) {
                try {
                    const content = JSON.parse(message.content.toString()) as cacheInvalidationMessage

                    console.log("📩blog service recived cache invalidation message", content)

                    if (content.action === "invalidate") {
                        for (const pattern of content.keys) {
                            const keys = await redisClient.keys(pattern)

                            if (keys.length > 0) {
                                await redisClient.del(keys)


                                console.log(`✅ cache invalidated for ${keys.length} keys matching ${pattern}`)

                                const searchQuery = ""
                                const category = ""

                                const cacheKey = `blogs:${searchQuery}:${category}`

                                const blogs= await sql`
                                    SELECT * FROM blogs ORDER BY created_at DESC`

                                await redisClient.set(cacheKey, JSON.stringify(blogs), { EX: 3600 })

                                console.log("🔄️ cache rebuilt with keys:", cacheKey)
                            }
                        }
                    }

                    channel.ack(message);
                } catch (error) {
                    console.error("❌ Error processing cache invalidation message:", error);
                    channel.nack(message, false, true);
                }
            }
        })

            return;
        } catch (error) {
            if (attempt === maxAttempts) {
                console.error("Error connecting to RabbitMQ:", error);
                return;
            }

            console.log(`RabbitMQ not ready, retrying cache consumer (${attempt}/${maxAttempts})`);
            await wait(2000);
        }
    }
}
