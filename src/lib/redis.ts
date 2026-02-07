import { Redis } from "@upstash/redis"

// Create Redis client
// You'll need to add UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN to your environment variables
// Get these from: https://console.upstash.com/ (free tier available)
export const redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL!,
    token: process.env.UPSTASH_REDIS_REST_TOKEN!,
})
