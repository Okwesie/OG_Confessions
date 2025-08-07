import { NextResponse } from "next/server"
import { getAffirmationsByCategory } from "@/lib/database"

export async function GET(request: Request, { params }: { params: Promise<{ category: string }> }) {
  try {
    const { category } = await params

    // Validate category
    const validCategories = ["Faith", "Strength", "Wisdom", "Gratitude", "Purpose"]
    if (!validCategories.includes(category)) {
      return NextResponse.json({ error: "Invalid category" }, { status: 400 })
    }

    console.log(`🔍 Fetching affirmations for category: ${category}`)

    // Get affirmations from database
    const affirmations = await getAffirmationsByCategory(category)

    console.log(`✅ Found ${affirmations.length} affirmations for ${category}`)

    return NextResponse.json({
      success: true,
      affirmations,
      category,
    })
  } catch (error) {
    console.error(`❌ Error fetching affirmations for category:`, error)
    return NextResponse.json(
      {
        error: "Failed to fetch affirmations",
        success: false,
        affirmations: [],
      },
      { status: 500 },
    )
  }
}
