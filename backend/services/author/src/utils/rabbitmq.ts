import amqp from "amqplib";

let channel: amqp.Channel;

export const connectRabbitmq = async () => {
    try {
        const connection = await amqp.connect({
            protocol: "amqp", 
            hostname: "localhost",
            port: 5672,
            username: "admin", 
            password: "admin123",
        }); 
        channel = await connection.createChannel();
        
        console.log("Connected to RabbitMQ");
    } catch (error) {
        console.error("Error connecting to RabbitMQ:", error);
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