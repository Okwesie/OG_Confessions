import { NextResponse } from "next/server"
import { ensureTableExists, saveAffirmation, getAllAffirmations, getAnalytics } from "@/lib/database"
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

  // Test 1: Database Connection
  try {
    await ensureTableExists()
    addTest("Database Connection", "pass", "✅ Successfully connected to Supabase database")
  } catch (error) {
    addTest("Database Connection", "fail", `❌ Database connection failed: ${error}`)
  }

  // Test 2: Telegram Bot Connection
  try {
    const telegram = new TelegramService()
    const botInfo = await telegram.getBotInfo()
    addTest("Telegram Bot", "pass", `✅ Bot connected: @${botInfo.username}`, {
      bot_username: botInfo.username,
      bot_name: botInfo.first_name,
    })
  } catch (error) {
    addTest("Telegram Bot", "fail", `❌ Telegram bot connection failed: ${error}`)
  }

  // Test 3: Telegram Channel Access
  try {
    const telegram = new TelegramService()
    const chatInfo = await telegram.getChatInfo()
    addTest("Telegram Channel", "pass", `✅ Channel accessible: ${chatInfo.title || chatInfo.username}`, {
      channel_title: chatInfo.title,
      channel_username: chatInfo.username,
      channel_type: chatInfo.type,
    })
  } catch (error) {
    addTest("Telegram Channel", "fail", `❌ Channel access failed: ${error}`)
  }

  // Test 4: Fetch Messages from Telegram
  try {
    const telegram = new TelegramService()
    const messages = await telegram.getChannelMessages(5)
    addTest("Telegram Messages", "pass", `✅ Fetched ${messages.length} messages from channel`, {
      message_count: messages.length,
      sample_message: messages[0]?.text?.substring(0, 100) + "..." || "No messages",
    })
  } catch (error) {
    addTest("Telegram Messages", "fail", `❌ Failed to fetch messages: ${error}`)
  }

  // Test 5: Content Processing
  try {
    const sampleText =
      "I am blessed and highly favored by God. His love surrounds me and His grace sustains me through every challenge."
    const processed = processAffirmation(sampleText)
    addTest("Content Processing", "pass", `✅ Content processing works`, {
      original_text: sampleText,
      processed_category: processed.category,
      is_affirmation: processed.is_affirmation,
      tags: processed.tags,
    })
  } catch (error) {
    addTest("Content Processing", "fail", `❌ Content processing failed: ${error}`)
  }

  // Test 6: Database Write (Save Test Affirmation)
  try {
    const testAffirmation = {
      text: "This is a test affirmation created by the system test. God's love never fails.",
      category: "Faith" as const,
      source_platform: "system_test",
      source_message_id: `test_${Date.now()}`,
      tags: ["test", "faith", "love"],
      bible_verse: "1 Corinthians 13:8",
      is_active: true,
    }

    const result = await saveAffirmation(testAffirmation)
    if (result.success) {
      addTest("Database Write", "pass", `✅ Successfully saved test affirmation`, {
        affirmation_id: result.id,
      })
    } else {
      addTest("Database Write", "fail", `❌ Failed to save affirmation: ${result.error}`)
    }
  } catch (error) {
    addTest("Database Write", "fail", `❌ Database write failed: ${error}`)
  }

  // Test 7: Database Read
  try {
    const affirmations = await getAllAffirmations()
    addTest("Database Read", "pass", `✅ Successfully read ${affirmations.length} affirmations from database`, {
      total_affirmations: affirmations.length,
    })
  } catch (error) {
    addTest("Database Read", "fail", `❌ Database read failed: ${error}`)
  }

  // Test 8: Analytics
  try {
    const analytics = await getAnalytics()
    addTest("Analytics", "pass", `✅ Analytics working`, {
      total_affirmations: analytics.total_affirmations,
      total_views: analytics.total_views,
      categories: Object.keys(analytics.category_stats),
    })
  } catch (error) {
    addTest("Analytics", "fail", `❌ Analytics failed: ${error}`)
  }

  // Test 9: Environment Variables
  const envVars = {
    SUPABASE_URL: !!process.env.SUPABASE_URL,
    SUPABASE_SERVICE_ROLE_KEY: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
    TELEGRAM_BOT_TOKEN: !!process.env.TELEGRAM_BOT_TOKEN,
    TELEGRAM_CHANNEL_ID: !!process.env.TELEGRAM_CHANNEL_ID,
    ADMIN_SECRET_KEY: !!process.env.ADMIN_SECRET_KEY,
  }

  const missingEnvVars = Object.entries(envVars)
    .filter(([key, value]) => !value)
    .map(([key]) => key)

  if (missingEnvVars.length === 0) {
    addTest("Environment Variables", "pass", "✅ All required environment variables are set", envVars)
  } else {
    addTest("Environment Variables", "fail", `❌ Missing environment variables: ${missingEnvVars.join(", ")}`, envVars)
  }

  // Final Summary
  const isFullyFunctional = testResults.summary.failed === 0
  const status = isFullyFunctional ? "FULLY_FUNCTIONAL" : "NEEDS_ATTENTION"

  return NextResponse.json({
    status,
    message: isFullyFunctional
      ? "🎉 OG_Confessions is fully functional! All systems operational."
      : `⚠️ ${testResults.summary.failed} tests failed. Check details below.`,
    ...testResults,
  })
}

export async function POST() {
  // Run a quick sync test
  try {
    const telegram = new TelegramService()
    const messages = await telegram.getChannelMessages(3)

    if (messages.length === 0) {
      return NextResponse.json({
        success: false,
        message: "No messages found in channel. Check bot permissions.",
      })
    }

    let savedCount = 0
    const results = []

    for (const message of messages) {
      const processed = processAffirmation(message.text)

      if (processed.is_affirmation) {
        const affirmationRecord = {
          text: processed.text,
          category: processed.category,
          source_platform: "telegram",
          source_message_id: message.message_id.toString(),
          tags: processed.tags,
          bible_verse: processed.bible_verse,
          is_active: true,
        }

        const result = await saveAffirmation(affirmationRecord)
        if (result.success) {
          savedCount++
          results.push({
            message_id: message.message_id,
            category: processed.category,
            saved: true,
          })
        } else {
          results.push({
            message_id: message.message_id,
            category: processed.category,
            saved: false,
            error: result.error,
          })
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: `✅ Test sync completed: ${savedCount} affirmations saved`,
      results,
    })
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    })
  }
}
