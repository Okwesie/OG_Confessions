import { TelegramService } from "@/lib/telegram"
import { processAffirmation } from "@/lib/content-processor"
import { saveAffirmation, getExistingMessageIds, ensureTableExists } from "@/lib/database"
import { NextResponse } from "next/server"

export async function POST() {
  try {
    console.log("🚀 Starting Telegram sync from admin dashboard...")

    // Validate environment variables
    if (!process.env.TELEGRAM_BOT_TOKEN) {
      throw new Error("TELEGRAM_BOT_TOKEN is not configured. Please check your environment variables.")
    }

    if (!process.env.TELEGRAM_CHANNEL_ID) {
      throw new Error("TELEGRAM_CHANNEL_ID is not configured. Please check your environment variables.")
    }

    if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error("Supabase configuration is missing. Please check your environment variables.")
    }

    // Ensure database table exists
    await ensureTableExists()
    console.log("✅ Database connection verified")

    const telegram = new TelegramService()

    // Test bot connection
    const botInfo = await telegram.getBotInfo()
    console.log(`✅ Bot connected: @${botInfo.username}`)

    // Get existing message IDs to avoid duplicates
    console.log("📋 Getting existing message IDs...")
    const existingMessageIds = await getExistingMessageIds("telegram")
    console.log(`📊 Found ${existingMessageIds.length} existing messages in database`)

    // Fetch latest messages from Telegram
    console.log("📥 Fetching messages from Telegram...")
    const messages = await telegram.getChannelMessages(100) // Get more messages
    console.log(`📨 Fetched ${messages.length} messages from Telegram`)

    if (messages.length === 0) {
      return NextResponse.json({
        success: true,
        results: {
          messages_processed: 0,
          new_affirmations: 0,
          duplicates_skipped: 0,
          errors: 0,
          last_sync: new Date().toISOString(),
          message: "No messages found. Check your bot permissions and channel ID.",
        },
      })
    }

    // Process messages - SAVE EVERYTHING FROM YOUR CHANNEL
    let processedCount = 0
    let savedCount = 0
    let duplicatesSkipped = 0
    let errorsCount = 0
    const sampleAffirmations: any[] = []

    for (const message of messages) {
      try {
        processedCount++

        // Skip if message already exists
        if (existingMessageIds.includes(message.message_id.toString())) {
          duplicatesSkipped++
          continue
        }

        // Process the message text
        const processed = processAffirmation(message.text)

        console.log(`📝 Processing message ${message.message_id}:`, {
          text_length: message.text.length,
          category: processed.category,
          is_affirmation: processed.is_affirmation,
          first_50_chars: message.text.substring(0, 50) + "...",
        })

        // CHANGED: Save ALL messages from your channel (removed is_affirmation check)
        // Prepare affirmation record
        const affirmationRecord = {
          text: processed.text, // FULL TEXT
          category: processed.category,
          source_platform: "telegram",
          source_message_id: message.message_id.toString(),
          tags: processed.tags,
          bible_verse: processed.bible_verse,
          is_active: true,
        }

        // Save to database
        const saveResult = await saveAffirmation(affirmationRecord)

        if (saveResult.success) {
          savedCount++
          console.log(`✅ Saved message ${message.message_id}: ${processed.category} (${message.text.length} chars)`)

          // Add to sample for response (first 3)
          if (sampleAffirmations.length < 3) {
            sampleAffirmations.push({
              text: processed.text.substring(0, 150) + (processed.text.length > 150 ? "..." : ""),
              category: processed.category,
              tags: processed.tags,
              bible_verse: processed.bible_verse,
              message_id: message.message_id,
              full_length: processed.text.length,
            })
          }
        } else {
          if (saveResult.error === "Message already exists") {
            duplicatesSkipped++
          } else {
            errorsCount++
            console.error(`❌ Error saving message ${message.message_id}:`, saveResult.error)
          }
        }
      } catch (error) {
        errorsCount++
        console.error(`❌ Error processing message ${message.message_id}:`, error)
      }
    }

    // Prepare response
    const results = {
      messages_processed: processedCount,
      new_affirmations: savedCount,
      duplicates_skipped: duplicatesSkipped,
      errors: errorsCount,
      last_sync: new Date().toISOString(),
      sample_affirmations: sampleAffirmations,
      bot_info: {
        username: botInfo.username,
        first_name: botInfo.first_name,
      },
      note: "🎉 Now saving ALL content from your channel regardless of length or format!",
    }

    console.log("🎉 Telegram sync completed:", results)

    return NextResponse.json({
      success: true,
      results,
    })
  } catch (error: any) {
    console.error("❌ Telegram sync error:", error)

    return NextResponse.json(
      {
        success: false,
        error: error.message,
        details: process.env.NODE_ENV === "development" ? error.stack : undefined,
      },
      { status: 500 },
    )
  }
}
