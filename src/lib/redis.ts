import { Redis } from "@upstash/redis"

// Create Redis client lazily to ensure env vars are loaded
// Get credentials from: https://console.upstash.com/

let redisInstance: Redis | null = null

function getRedis(): Redis {
    if (!redisInstance) {
        const url = process.env.UPSTASH_REDIS_REST_URL
        const token = process.env.UPSTASH_REDIS_REST_TOKEN

        if (!url || !token) {
            console.error("[Redis] Missing environment variables:", {
                hasUrl: !!url,
                hasToken: !!token,
            })
            throw new Error("Redis credentials not configured")
        }

        redisInstance = new Redis({ url, token })
    }
    return redisInstance
}

export const redis = {
    async get<T>(key: string): Promise<T | null> {
        return getRedis().get<T>(key)
    },
    async set(key: string, value: unknown): Promise<string> {
        return getRedis().set(key, value)
    },
    async incr(key: string): Promise<number> {
        return getRedis().incr(key)
    },
    async decr(key: string): Promise<number> {
        return getRedis().decr(key)
    },
    async lpush<T>(key: string, ...values: T[]): Promise<number> {
        return getRedis().lpush(key, ...values)
    },
    async lrange<T>(key: string, start: number, end: number): Promise<T[]> {
        return getRedis().lrange(key, start, end)
    },
}
