import { NextResponse } from "next/server"
import { getAffirmationsByCategory } from "@/lib/database"

export async function GET(request: Request, { params }: { params: { category: string } }) {
  try {
    const category = params.category

    // Validate category
    const validCategories = ["Faith", "Strength", "Wisdom", "Gratitude", "Purpose"]
    if (!validCategories.includes(category)) {
      return NextResponse.json({ error: "Invalid category" }, { status: 400 })
    }

    console.log(`Fetching affirmations for category: ${category}`)

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
      message: "No affirmations found for this category",
    })
  }
}
