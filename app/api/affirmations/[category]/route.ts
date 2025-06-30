import { NextResponse } from "next/server"
import { getAffirmationsByCategory } from "@/lib/database"

export async function GET(request: Request, { params }: { params: { category: string } }) {
  try {
    const category = params.category

    // Validate category
    const validCategories = ["Faith", "Strength", "Wisdom", "Gratitude", "Purpose"]
    if (!validCategories.includes(category)) {
      return NextResponse.json(
        {
          error: "Invalid category",
          affirmations: [],
          success: false,
        },
        { status: 400 },
      )
    }

    console.log(`🔍 Fetching affirmations for category: ${category}`)

    // Test database connection first
    const { testDatabaseConnection } = await import("@/lib/database")
    const connectionTest = await testDatabaseConnection()

    if (!connectionTest.success) {
      console.error("❌ Database connection failed:", connectionTest.error)
      return NextResponse.json({
        affirmations: [],
        success: true,
        message: `Database connection failed. Please try syncing content first.`,
        error: connectionTest.error,
      })
    }

    const affirmations = await getAffirmationsByCategory(category)

    console.log(`✅ Found ${affirmations.length} affirmations for ${category}`)

    // Transform data to match the expected format for the confession viewer
    const transformedAffirmations = affirmations.map((affirmation) => ({
      id: affirmation.id,
      text: affirmation.text,
      category: affirmation.category,
      timestamp: affirmation.timestamp || affirmation.created_at,
      bible_verse: affirmation.bible_verse,
      tags: affirmation.tags || [],
      isFavorited: false, // Default to false, can be enhanced later with user preferences
    }))

    return NextResponse.json({
      affirmations: transformedAffirmations,
      success: true,
    })
  } catch (error) {
    console.error(`❌ Failed to fetch affirmations for category:`, error)

    return NextResponse.json({
      affirmations: [],
      success: true,
      message: "Failed to load affirmations. Please try again or sync content first.",
      error: error instanceof Error ? error.message : "Unknown error",
    })
  }
}
