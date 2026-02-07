import { Redis } from "@upstash/redis"

// Create Redis client
// Get credentials from: https://console.upstash.com/

const url = process.env.UPSTASH_REDIS_REST_URL
const token = process.env.UPSTASH_REDIS_REST_TOKEN

if (!url || !token) {
    console.error("[Redis] Missing environment variables:", {
        hasUrl: !!url,
        hasToken: !!token,
    })
}

export const redis = new Redis({
    url: url || "",
    token: token || "",
})
