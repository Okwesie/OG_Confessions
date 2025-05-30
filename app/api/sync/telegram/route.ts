import { TelegramService } from "@/lib/telegram"
import { processAffirmation } from "@/lib/content-processor"
import { saveAffirmation, getExistingMessageIds, ensureTableExists } from "@/lib/database"
import { NextResponse } from "next/server"

export async function POST() {
  try {
    console.log("Starting Telegram sync...")

    // Validate environment variables
    if (!process.env.TELEGRAM_BOT_TOKEN) {
      return NextResponse.json({ success: false, error: "TELEGRAM_BOT_TOKEN is not configured" }, { status: 400 })
    }

    if (!process.env.TELEGRAM_CHANNEL_ID) {
      return NextResponse.json({ success: false, error: "TELEGRAM_CHANNEL_ID is not configured" }, { status: 400 })
    }

    if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return NextResponse.json({ success: false, error: "Supabase configuration is missing" }, { status: 400 })
    }

    // Ensure database table exists
    await ensureTableExists()

    // Initialize Telegram service
    const telegram = new TelegramService()

    // Get existing message IDs to avoid duplicates
    console.log("Getting existing message IDs...")
    const existingMessageIds = await getExistingMessageIds("telegram")
    console.log(`Found ${existingMessageIds.length} existing messages in database`)

    // Fetch latest 100 messages from Telegram
    console.log("Fetching messages from Telegram...")
    const messages = await telegram.getChannelMessages(100)
    console.log(`Fetched ${messages.length} messages from Telegram`)

    if (messages.length === 0) {
      return NextResponse.json({
        success: true,
        results: {
          messages_processed: 0,
          new_affirmations: 0,
          duplicates_skipped: 0,
          errors: 0,
          message: "No messages found. Check your bot permissions and channel ID.",
        },
      })
    }

    // Process messages
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

        // Only save if it appears to be an affirmation
        if (!processed.is_affirmation) {
          console.log(`Skipping non-affirmation: ${message.text.substring(0, 50)}...`)
          continue
        }

        // Prepare affirmation record
        const affirmationRecord = {
          text: processed.text,
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

          // Add to sample for response (first 3)
          if (sampleAffirmations.length < 3) {
            sampleAffirmations.push({
              text: processed.text.substring(0, 100) + (processed.text.length > 100 ? "..." : ""),
              category: processed.category,
              tags: processed.tags,
              bible_verse: processed.bible_verse,
            })
          }
        } else {
          if (saveResult.error === "Message already exists") {
            duplicatesSkipped++
          } else {
            errorsCount++
            console.error(`Error saving message ${message.message_id}:`, saveResult.error)
          }
        }
      } catch (error) {
        errorsCount++
        console.error(`Error processing message ${message.message_id}:`, error)
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
    }

    console.log("Sync completed:", results)

    return NextResponse.json({
      success: true,
      results,
    })
  } catch (error: any) {
    console.error("Telegram sync error:", error)

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

export async function GET() {
  // Allow GET requests for testing
  return POST()
}
