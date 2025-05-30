import { NextResponse } from "next/server"
import { getAnalytics } from "@/lib/database"

export async function GET() {
  try {
    console.log("Fetching real-time stats...")

    const analytics = await getAnalytics()

    const stats = {
      total_affirmations: analytics.total_affirmations,
      total_views: analytics.total_views,
      total_favorites: analytics.total_favorites,
      categories: 5,
      last_updated: new Date().toISOString(),
      category_breakdown: analytics.category_stats,
    }

    console.log("✅ Stats fetched:", stats)

    return NextResponse.json({
      stats,
      success: true,
    })
  } catch (error) {
    console.error("❌ Failed to fetch stats:", error)

    // Return fallback stats if database fails
    return NextResponse.json({
      stats: {
        total_affirmations: 0,
        total_views: 0,
        total_favorites: 0,
        categories: 5,
        last_updated: new Date().toISOString(),
        category_breakdown: {
          Faith: 0,
          Strength: 0,
          Wisdom: 0,
          Gratitude: 0,
          Purpose: 0,
        },
      },
      success: true,
      message: "Using fallback stats",
    })
  }
}
