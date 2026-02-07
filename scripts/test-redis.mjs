// Test Redis connection
// Run with: node scripts/test-redis.mjs

import { config } from "dotenv"
config({ path: ".env.local" })

const url = process.env.UPSTASH_REDIS_REST_URL
const token = process.env.UPSTASH_REDIS_REST_TOKEN

console.log("Testing Redis connection...")
console.log("URL:", url ? url.substring(0, 30) + "..." : "MISSING")
console.log("Token:", token ? token.substring(0, 10) + "..." : "MISSING")

if (!url || !token) {
    console.error("❌ Missing environment variables!")
    process.exit(1)
}

// Test with fetch directly
try {
    const response = await fetch(`${url}/set/test-key/test-value`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    })
    const data = await response.json()
    console.log("SET response:", data)

    const getResponse = await fetch(`${url}/get/test-key`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    })
    const getData = await getResponse.json()
    console.log("GET response:", getData)

    if (getData.result === "test-value") {
        console.log("✅ Redis connection successful!")
    } else {
        console.log("❌ Unexpected response")
    }
} catch (error) {
    console.error("❌ Error:", error.message)
}
