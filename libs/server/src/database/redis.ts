import { RedisClient } from "bun";

export const clientRedis = new RedisClient(process.env.REDIS_URL!)

export const redisInit = async () => {
    await clientRedis.connect()
    console.log('Connected successfully to redis')
}