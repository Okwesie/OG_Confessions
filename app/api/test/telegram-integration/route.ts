import { NextResponse } from "next/server"
import { TelegramService } from "@/lib/telegram"
import { processAffirmation } from "@/lib/content-processor"

export async function GET() {
  const testResults = {
    timestamp: new Date().toISOString(),
    tests: [] as any[],
    summary: { passed: 0, failed: 0, total: 0 },
  }

  function addTest(name: string, status: "pass" | "fail", message: string, data?: any) {
    testResults.tests.push({ name, status, message, data })
    testResults.summary.total++
    if (status === "pass") testResults.summary.passed++
    else testResults.summary.failed++
  }

  // Test 1: Environment Variables
  const requiredEnvVars = {
    TELEGRAM_BOT_TOKEN: process.env.TELEGRAM_BOT_TOKEN,
    TELEGRAM_CHANNEL_ID: process.env.TELEGRAM_CHANNEL_ID,
  }

  const missingVars = Object.entries(requiredEnvVars)
    .filter(([key, value]) => !value)
    .map(([key]) => key)

  if (missingVars.length === 0) {
    addTest("Environment Variables", "pass", "✅ All Telegram environment variables are set", {
      bot_token_length: process.env.TELEGRAM_BOT_TOKEN?.length,
      channel_id: process.env.TELEGRAM_CHANNEL_ID,
    })
  } else {
    addTest("Environment Variables", "fail", `❌ Missing: ${missingVars.join(", ")}`, {
      missing: missingVars,
      help: "Add these to your .env.local file",
    })
    return NextResponse.json(testResults)
  }

  // Test 2: Bot Token Validation
  try {
    const telegram = new TelegramService()
    const botInfo = await telegram.getBotInfo()

    addTest("Bot Authentication", "pass", `✅ Bot authenticated successfully`, {
      bot_username: botInfo.username,
      bot_name: botInfo.first_name,
      is_bot: botInfo.is_bot,
      can_join_groups: botInfo.can_join_groups,
      can_read_all_group_messages: botInfo.can_read_all_group_messages,
    })
  } catch (error) {
    addTest("Bot Authentication", "fail", `❌ Bot authentication failed: ${error}`, {
      error_details: error instanceof Error ? error.message : "Unknown error",
      help: "Check your TELEGRAM_BOT_TOKEN in .env.local",
    })
  }

  // Test 3: Channel Access
  try {
    const telegram = new TelegramService()
    const chatInfo = await telegram.getChatInfo()

    addTest("Channel Access", "pass", `✅ Channel accessible`, {
      channel_title: chatInfo.title,
      channel_username: chatInfo.username,
      channel_type: chatInfo.type,
      channel_id: chatInfo.id,
    })
  } catch (error) {
    addTest("Channel Access", "fail", `❌ Cannot access channel: ${error}`, {
      channel_id: process.env.TELEGRAM_CHANNEL_ID,
      error_details: error instanceof Error ? error.message : "Unknown error",
      help: "Make sure your bot is added to the channel as an admin",
    })
  }

  // Test 4: Message Fetching
  try {
    const telegram = new TelegramService()
    const messages = await telegram.getChannelMessages(10)

    if (messages.length > 0) {
      addTest("Message Fetching", "pass", `✅ Successfully fetched ${messages.length} messages`, {
        message_count: messages.length,
        latest_message: {
          text: messages[0]?.text?.substring(0, 100) + "...",
          date: new Date(messages[0]?.date * 1000).toISOString(),
          from: messages[0]?.from,
        },
        oldest_message: {
          text: messages[messages.length - 1]?.text?.substring(0, 100) + "...",
          date: new Date(messages[messages.length - 1]?.date * 1000).toISOString(),
        },
      })
    } else {
      addTest("Message Fetching", "fail", "❌ No messages found in channel", {
        help: "Check if the channel has messages and bot has proper permissions",
      })
    }
  } catch (error) {
    addTest("Message Fetching", "fail", `❌ Failed to fetch messages: ${error}`, {
      error_details: error instanceof Error ? error.message : "Unknown error",
    })
  }

  // Test 5: Content Processing
  try {
    const telegram = new TelegramService()
    const messages = await telegram.getChannelMessages(5)

    if (messages.length > 0) {
      const sampleMessage = messages[0]
      const processed = processAffirmation(sampleMessage.text)

      addTest("Content Processing", "pass", `✅ Content processing works`, {
        original_text: sampleMessage.text.substring(0, 150) + "...",
        processed: {
          category: processed.category,
          is_affirmation: processed.is_affirmation,
          tags: processed.tags,
          bible_verse: processed.bible_verse,
          cleaned_text_length: processed.text.length,
        },
      })
    } else {
      addTest("Content Processing", "fail", "❌ No messages to process")
    }
  } catch (error) {
    addTest("Content Processing", "fail", `❌ Content processing failed: ${error}`)
  }

  // Test 6: API Endpoint Test
  try {
    const response = await fetch(`${process.env.NEXTAUTH_URL || "http://localhost:3000"}/api/sync/telegram`, {
      method: "POST",
    })

    if (response.ok) {
      const data = await response.json()
      addTest("Sync Endpoint", "pass", "✅ Sync endpoint is working", {
        endpoint_status: response.status,
        response_success: data.success,
      })
    } else {
      addTest("Sync Endpoint", "fail", `❌ Sync endpoint returned ${response.status}`)
    }
  } catch (error) {
    addTest("Sync Endpoint", "fail", `❌ Sync endpoint test failed: ${error}`)
  }

  // Final Assessment
  const isFullyFunctional = testResults.summary.failed === 0
  const status = isFullyFunctional ? "FULLY_FUNCTIONAL" : "NEEDS_ATTENTION"

  return NextResponse.json({
    status,
    message: isFullyFunctional
      ? "🎉 Telegram integration is fully functional!"
      : `⚠️ ${testResults.summary.failed} issues found. Check details below.`,
    recommendations: isFullyFunctional
      ? [
          "✅ Ready to sync content from Telegram",
          "✅ Try running a manual sync from the admin dashboard",
          "✅ All systems operational",
        ]
      : [
          "🔧 Fix the failed tests above",
          "📝 Check your .env.local file",
          "🤖 Ensure bot is added to channel as admin",
          "🔄 Try the sync again after fixes",
        ],
    ...testResults,
  })
}
