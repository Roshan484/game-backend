import { createClient } from "redis";

const redis = createClient();

redis.on("error", (err) => console.error("Redis Error:", err));

await redis.connect();

export { redis };
