import { NextResponse } from "next/server"
import { getAllAffirmations, saveAffirmation } from "@/lib/database"

export async function GET() {
  try {
    console.log("Fetching affirmations from database...")

    const affirmations = await getAllAffirmations()

    console.log(`✅ Successfully fetched ${affirmations.length} affirmations`)

    return NextResponse.json({
      affirmations,
      success: true,
      database_type: "supabase",
    })
  } catch (error) {
    console.error("❌ Failed to fetch affirmations:", error)
    return NextResponse.json(
      {
        error: "Failed to fetch affirmations",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json()

    const affirmationRecord = {
      text: data.text,
      category: data.category,
      source_platform: "manual",
      source_message_id: `manual_${Date.now()}`,
      tags: data.tags || [],
      bible_verse: data.bible_verse,
      is_active: data.is_active !== undefined ? data.is_active : true,
    }

    const result = await saveAffirmation(affirmationRecord)

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 })
    }

    return NextResponse.json({
      affirmation: { id: result.id, ...affirmationRecord },
      success: true,
    })
  } catch (error) {
    console.error("Failed to create affirmation:", error)
    return NextResponse.json({ error: "Failed to create affirmation" }, { status: 500 })
  }
}
