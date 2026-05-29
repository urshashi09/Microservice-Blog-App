import amqp from "amqplib";

let channel: amqp.Channel;

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const connectRabbitmq = async () => {
    let attempt = 1;
    while (true) {
        try {
            const connection = await amqp.connect(
                process.env.RABBITMQ_URL!
            );;

            channel = await connection.createChannel();

            // Set up connection handlers for automatic reconnection
            connection.on("error", (err) => {
                console.error("❌ RabbitMQ connection error:", err);
                reconnect();
            });
            connection.on("close", () => {
                console.warn("⚠️ RabbitMQ connection closed, attempting reconnect...");
                reconnect();
            });

            console.log("✅ Connected to RabbitMQ");
            return;
        } catch (error) {
            console.log(`⏳ RabbitMQ not ready, retrying publisher (attempt ${attempt}). Error: ${error instanceof Error ? error.message : error}`);
            attempt++;
            await wait(3000);
        }
    }
};

let reconnecting = false;
const reconnect = async () => {
    if (reconnecting) return;
    reconnecting = true;
    channel = undefined as any;
    await connectRabbitmq();
    reconnecting = false;
};

export const publishToQueue = async (queueName: string, message: any): Promise<boolean> => {
    if (!channel) {
        console.error("❌ RabbitMQ channel is not initialized");
        return false;
    }

    try {
        await channel.assertQueue(queueName, { durable: true });
        channel.sendToQueue(queueName, Buffer.from(JSON.stringify(message)), { persistent: true });
        return true;
    } catch (error) {
        console.error("❌ Error publishing to queue:", error);
        return false;
    }
};

export const invalidateCacheJob = async (cacheKeys: string[]) => {
    try {
        const message = {
            action: "invalidate",
            keys: cacheKeys
        };

        const success = await publishToQueue("cache-invalidation", message);
        if (success) {
            console.log("✅ Cache invalidation job published successfully");
        } else {
            console.error("❌ Failed to publish cache invalidation job (RabbitMQ uninitialized or down)");
        }
    } catch (error) {
        console.error("❌ Error publishing cache invalidation job:", error);
    }
};
