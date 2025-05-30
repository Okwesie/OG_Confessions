import { TelegramService } from "@/lib/telegram"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    console.log("Testing Telegram connection...")

    // Check environment variables
    if (!process.env.TELEGRAM_BOT_TOKEN) {
      return NextResponse.json(
        {
          success: false,
          error: "TELEGRAM_BOT_TOKEN not found in environment variables",
          help: "Add TELEGRAM_BOT_TOKEN to your .env.local file",
        },
        { status: 400 },
      )
    }

    if (!process.env.TELEGRAM_CHANNEL_ID) {
      return NextResponse.json(
        {
          success: false,
          error: "TELEGRAM_CHANNEL_ID not found in environment variables",
          help: "Add TELEGRAM_CHANNEL_ID to your .env.local file (e.g., @your_channel)",
        },
        { status: 400 },
      )
    }

    const telegram = new TelegramService()

    // Test bot connection
    console.log("Getting bot info...")
    const botInfo = await telegram.getBotInfo()

    // Test channel access
    console.log("Testing channel access...")
    let chatInfo
    try {
      chatInfo = await telegram.getChatInfo()
    } catch (error) {
      return NextResponse.json(
        {
          success: false,
          error: "Cannot access channel. Make sure your bot is added to the channel as an admin.",
          bot_info: botInfo,
          channel_id: process.env.TELEGRAM_CHANNEL_ID,
          details: error instanceof Error ? error.message : "Unknown error",
        },
        { status: 403 },
      )
    }

    // Test message fetching
    console.log("Testing message fetching...")
    const messages = await telegram.getChannelMessages(5)

    return NextResponse.json({
      success: true,
      message: "Telegram connection successful!",
      bot_info: {
        username: botInfo.username,
        first_name: botInfo.first_name,
        is_bot: botInfo.is_bot,
      },
      channel_info: {
        title: chatInfo.title || chatInfo.username,
        type: chatInfo.type,
        username: chatInfo.username,
      },
      messages_found: messages.length,
      sample_messages: messages.slice(0, 2).map((msg) => ({
        text: msg.text.substring(0, 100) + (msg.text.length > 100 ? "..." : ""),
        date: new Date(msg.date * 1000).toISOString(),
        from: msg.from,
      })),
    })
  } catch (error: any) {
    console.error("Telegram test error:", error)

    return NextResponse.json(
      {
        success: false,
        error: error.message,
        help: "Check your TELEGRAM_BOT_TOKEN and TELEGRAM_CHANNEL_ID in .env.local",
        details: process.env.NODE_ENV === "development" ? error.stack : undefined,
      },
      { status: 500 },
    )
  }
}
