// Environment variable validation and type safety

export const env = {
  // Database
  DATABASE_URL: process.env.DATABASE_URL,
  SUPABASE_URL: process.env.SUPABASE_URL,
  SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY,
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,

  // Telegram
  TELEGRAM_BOT_TOKEN: process.env.TELEGRAM_BOT_TOKEN,
  TELEGRAM_CHANNEL_ID: process.env.TELEGRAM_CHANNEL_ID,
  TELEGRAM_API_ID: process.env.TELEGRAM_API_ID,
  TELEGRAM_API_HASH: process.env.TELEGRAM_API_HASH,
  TELEGRAM_PHONE_NUMBER: process.env.TELEGRAM_PHONE_NUMBER,

  // Admin
  ADMIN_SECRET_KEY: process.env.ADMIN_SECRET_KEY || "admin123",

  // AI
  OPENAI_API_KEY: process.env.OPENAI_API_KEY,

  // Auth
  NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
  NEXTAUTH_URL: process.env.NEXTAUTH_URL,

  // Analytics
  SENTRY_DSN: process.env.SENTRY_DSN,

  // Redis
  UPSTASH_REDIS_REST_URL: process.env.UPSTASH_REDIS_REST_URL,
  UPSTASH_REDIS_REST_TOKEN: process.env.UPSTASH_REDIS_REST_TOKEN,

  // Environment
  NODE_ENV: process.env.NODE_ENV || "development",
  IS_PRODUCTION: process.env.NODE_ENV === "production",
  IS_DEVELOPMENT: process.env.NODE_ENV === "development",
}

// Validation functions
export function validateRequiredEnvVars() {
  const required = ["TELEGRAM_BOT_TOKEN", "TELEGRAM_CHANNEL_ID"]

  const missing = required.filter((key) => !process.env[key])

  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(", ")}`)
  }
}

export function validateDatabaseConfig() {
  const hasSupabase = env.SUPABASE_URL && env.SUPABASE_ANON_KEY && env.SUPABASE_SERVICE_ROLE_KEY
  const hasPostgres = env.DATABASE_URL

  if (!hasSupabase && !hasPostgres) {
    throw new Error("Either Supabase configuration or DATABASE_URL must be provided")
  }

  return hasSupabase ? "supabase" : "postgres"
}

// Helper to check if feature is enabled
export function isFeatureEnabled(feature: string): boolean {
  switch (feature) {
    case "ai_categorization":
      return !!env.OPENAI_API_KEY
    case "analytics":
      return !!env.SENTRY_DSN
    case "redis_cache":
      return !!(env.UPSTASH_REDIS_REST_URL && env.UPSTASH_REDIS_REST_TOKEN)
    case "user_auth":
      return !!(env.NEXTAUTH_SECRET && env.NEXTAUTH_URL)
    default:
      return false
  }
}

// Test Telegram connection
export async function testTelegramConnection() {
  try {
    if (!env.TELEGRAM_BOT_TOKEN || !env.TELEGRAM_CHANNEL_ID) {
      return {
        success: false,
        error: "Telegram credentials not configured",
      }
    }

    const { TelegramService } = await import("./telegram")
    const telegram = new TelegramService()

    const botInfo = await telegram.getBotInfo()

    return {
      success: true,
      bot_info: botInfo,
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}
