import amqp from "amqplib";
import { redisClient } from "../server.js";
import { sql } from "./db.js";

interface cacheInvalidationMessage {
    action: string;
    keys: string[];
}

export const startCacheConsumer = async () => {
    try {
        const connection = await amqp.connect({
            protocol: "amqp",
            hostname: "localhost",
            port: 5672,
            username: "admin",
            password: "admin123",
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

    } catch (error) {
        console.error("Error connecting to RabbitMQ:", error);
    }
}