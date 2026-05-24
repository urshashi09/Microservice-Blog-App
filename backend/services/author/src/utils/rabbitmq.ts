import amqp from "amqplib";

let channel: amqp.Channel;

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const connectRabbitmq = async () => {
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
            channel = await connection.createChannel();
            
            console.log("Connected to RabbitMQ");
            return;
        } catch (error) {
            if (attempt === maxAttempts) {
                console.error("Error connecting to RabbitMQ:", error);
                return;
            }

            console.log(`RabbitMQ not ready, retrying publisher (${attempt}/${maxAttempts})`);
            await wait(2000);
        }
    }
    
};



export const publishToQueue= async (queueName: string, message: any) => {
    if(!channel){
        console.error("RabbitMQ channel is not initialized");
        return
    }

    await channel.assertQueue(queueName, { durable: true });

    channel.sendToQueue(queueName, Buffer.from(JSON.stringify(message)), { persistent: true });
    
};


export const invalidateCacheJob= async (cacheKeys:string[]) => {
    try{
        const message= {
            action: "invalidate",
            keys: cacheKeys
        }

        await publishToQueue("cache-invalidation", message)

        console.log("✅ cache invalidation job published") 
        
    } catch (error) {
        console.error("❌ Error publishing cache invalidation job:", error);
    }
}
