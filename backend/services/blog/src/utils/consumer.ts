import amqp from "amqplib";
import { redisClient } from "../server.js";
import { sql } from "./db.js";

interface cacheInvalidationMessage {
    action: string;
    keys: string[];
}

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const startCacheConsumer = async () => {
    let attempt = 1;
    while (true) {
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

            console.log("✅ blog service cache consumer started");

            channel.consume(queueName, async (message) => {
                if (message) {
                    try {
                        const content = JSON.parse(message.content.toString()) as cacheInvalidationMessage;

                        console.log("📩 blog service received cache invalidation message:", content);

                        if (content.action === "invalidate") {
                            for (const pattern of content.keys) {
                                const keys = await redisClient.keys(pattern);

                                if (keys.length > 0) {
                                    await redisClient.del(keys);
                                    console.log(`✅ cache invalidated for ${keys.length} keys matching ${pattern}`);

                                    const searchQuery = "";
                                    const category = "";
                                    const cacheKey = `blogs:${searchQuery}:${category}`;

                                    const blogs = await sql`
                                        SELECT * FROM blogs ORDER BY created_at DESC`;

                                    await redisClient.set(cacheKey, JSON.stringify(blogs), { EX: 3600 });
                                    console.log("🔄 cache rebuilt with keys:", cacheKey);
                                }
                            }
                        }

                        channel.ack(message);
                    } catch (error) {
                        console.error("❌ Error processing cache invalidation message:", error);
                        channel.nack(message, false, true);
                    }
                }
            });

            // Set up connection handlers for automatic reconnection
            connection.on("error", (err) => {
                console.error("❌ RabbitMQ connection error in consumer:", err);
                reconnect();
            });
            connection.on("close", () => {
                console.warn("⚠️ RabbitMQ connection closed in consumer, attempting reconnect...");
                reconnect();
            });

            return;
        } catch (error) {
            console.log(`⏳ RabbitMQ not ready, retrying cache consumer (attempt ${attempt}). Error: ${error instanceof Error ? error.message : error}`);
            attempt++;
            await wait(3000);
        }
    }
};

let reconnecting = false;
const reconnect = async () => {
    if (reconnecting) return;
    reconnecting = true;
    await startCacheConsumer();
    reconnecting = false;
};
