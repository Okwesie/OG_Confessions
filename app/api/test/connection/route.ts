import { NextResponse } from "next/server"
import { ensureTableExists } from "@/lib/database"
import { TelegramService } from "@/lib/telegram"

export async function GET() {
  const results = {
    database: { status: "unknown", message: "" },
    telegram: { status: "unknown", message: "" },
    overall: { status: "unknown", message: "" },
  }

  // Test Database Connection
  try {
    await ensureTableExists()
    results.database = { status: "success", message: "✅ Database connected and table exists" }
  } catch (error) {
    results.database = {
      status: "error",
      message: `❌ Database error: ${error instanceof Error ? error.message : "Unknown error"}`,
    }
  }

  // Test Telegram Connection
  try {
    const telegram = new TelegramService()
    const botInfo = await telegram.getBotInfo()
    results.telegram = {
      status: "success",
      message: `✅ Telegram bot connected: @${botInfo.username}`,
    }
  } catch (error) {
    results.telegram = {
      status: "error",
      message: `❌ Telegram error: ${error instanceof Error ? error.message : "Unknown error"}`,
    }
  }

  // Overall Status
  const allSuccess = results.database.status === "success" && results.telegram.status === "success"
  results.overall = {
    status: allSuccess ? "success" : "partial",
    message: allSuccess
      ? "🎉 All systems operational! Ready to sync content."
      : "⚠️ Some services need configuration. Check individual statuses above.",
  }

  return NextResponse.json(results)
}
