import { NextResponse } from "next/server"
import { TelegramService } from "@/lib/telegram"

type TestStatus = "unknown" | "success" | "error" | "partial"

export async function GET() {
  const results = {
    botInfo: { status: "unknown" as TestStatus, message: "", data: null as any },
    chatInfo: { status: "unknown" as TestStatus, message: "", data: null as any },
    permissions: { status: "unknown" as TestStatus, message: "", data: null as any },
    messageTest: { status: "unknown" as TestStatus, message: "", data: null as any },
    overall: { status: "unknown" as TestStatus, message: "" },
  }

  try {
    // Test 1: Bot Info
    try {
      const telegram = new TelegramService()
      const botInfo = await telegram.getBotInfo()
      results.botInfo = {
        status: "success",
        message: `✅ Bot connected: @${botInfo.username}`,
        data: {
          username: botInfo.username,
          first_name: botInfo.first_name,
          id: botInfo.id,
        },
      }
    } catch (error) {
      results.botInfo = {
        status: "error",
        message: `❌ Bot connection failed: ${error instanceof Error ? error.message : "Unknown error"}`,
        data: null,
      }
    }

    // Test 2: Chat Info
    try {
      const telegram = new TelegramService()
      const chatInfo = await telegram.getChatInfo()
      results.chatInfo = {
        status: "success",
        message: `✅ Channel accessible: ${chatInfo.title || chatInfo.username}`,
        data: {
          title: chatInfo.title,
          username: chatInfo.username,
          type: chatInfo.type,
          id: chatInfo.id,
        },
      }
    } catch (error) {
      results.chatInfo = {
        status: "error",
        message: `❌ Channel access failed: ${error instanceof Error ? error.message : "Unknown error"}`,
        data: null,
      }
    }

    // Test 3: Permissions Check
    try {
      const telegram = new TelegramService()
      // Try to get a single message to test permissions
      const messages = await telegram.getChannelMessages(1)
      results.permissions = {
        status: "success",
        message: `✅ Bot has read permissions. Found ${messages.length} messages`,
        data: {
          messageCount: messages.length,
          canRead: true,
        },
      }
    } catch (error) {
      results.permissions = {
        status: "error",
        message: `❌ Permission check failed: ${error instanceof Error ? error.message : "Unknown error"}`,
        data: {
          canRead: false,
          error: error instanceof Error ? error.message : "Unknown error",
        },
      }
    }

    // Test 4: Message Fetch Test
    try {
      const telegram = new TelegramService()
      const messages = await telegram.getChannelMessages(5)
      results.messageTest = {
        status: "success",
        message: `✅ Successfully fetched ${messages.length} messages`,
        data: {
          messageCount: messages.length,
          sampleMessages: messages.slice(0, 2).map(m => ({
            id: m.message_id,
            text: m.text.substring(0, 50) + "...",
            date: new Date(m.date * 1000).toISOString(),
          })),
        },
      }
    } catch (error) {
      results.messageTest = {
        status: "error",
        message: `❌ Message fetch failed: ${error instanceof Error ? error.message : "Unknown error"}`,
        data: null,
      }
    }

    // Overall Status
    const allSuccess = Object.values(results).every(r => r.status === "success")
    const hasPartialSuccess = Object.values(results).some(r => r.status === "success")

    results.overall = {
      status: allSuccess ? "success" : hasPartialSuccess ? "partial" : "error",
      message: allSuccess
        ? "🎉 All Telegram tests passed! Bot is fully functional."
        : hasPartialSuccess
          ? "⚠️ Some Telegram features work, but there are issues to resolve."
          : "❌ All Telegram tests failed. Check bot configuration and permissions.",
    }

    return NextResponse.json(results)
  } catch (error) {
    console.error("Error in Telegram diagnostic:", error)
    return NextResponse.json(
      {
        error: "Telegram diagnostic failed",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
