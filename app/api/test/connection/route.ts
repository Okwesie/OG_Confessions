import { NextResponse } from "next/server"
import { TelegramService } from "@/lib/telegram"

export async function GET() {
  const results = {
    database: { status: "unknown", message: "" },
    telegram: { status: "unknown", message: "" },
    overall: { status: "unknown", message: "" },
  }

  // Test Database Connection
  try {
    const { testDatabaseConnection } = await import("@/lib/database")
    const dbTest = await testDatabaseConnection()

    if (dbTest.success) {
      results.database = { status: "success", message: "✅ Database connected and accessible" }
    } else {
      results.database = {
        status: "error",
        message: `❌ Database error: ${dbTest.error}`,
      }
    }
  } catch (error) {
    results.database = {
      status: "error",
      message: `❌ Database connection failed: ${error instanceof Error ? error.message : "Unknown error"}`,
    }
  }

  // Test Telegram Connection
  try {
    if (!process.env.TELEGRAM_BOT_TOKEN || !process.env.TELEGRAM_CHANNEL_ID) {
      results.telegram = {
        status: "error",
        message: "❌ Telegram credentials not configured in environment variables",
      }
    } else {
      const telegram = new TelegramService()
      const botInfo = await telegram.getBotInfo()
      results.telegram = {
        status: "success",
        message: `✅ Telegram bot connected: @${botInfo.username}`,
      }
    }
  } catch (error) {
    results.telegram = {
      status: "error",
      message: `❌ Telegram error: ${error instanceof Error ? error.message : "Unknown error"}`,
    }
  }

  // Overall Status
  const allSuccess = results.database.status === "success" && results.telegram.status === "success"
  const hasPartialSuccess = results.database.status === "success" || results.telegram.status === "success"

  results.overall = {
    status: allSuccess ? "success" : hasPartialSuccess ? "partial" : "error",
    message: allSuccess
      ? "🎉 All systems operational! Ready to sync content."
      : hasPartialSuccess
        ? "⚠️ Some services need configuration. Check individual statuses above."
        : "❌ Critical services are down. Check configuration and try again.",
  }

  return NextResponse.json(results)
}
