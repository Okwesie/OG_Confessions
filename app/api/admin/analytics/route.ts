import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { getAnalytics } from "@/lib/database"

// Safely get environment variables
const supabaseUrl = process.env.SUPABASE_URL || process.env.SUPABASE_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SUPABASE_SERVICE_ROLE_KEY

let supabase: any = null

function getSupabaseClient() {
  if (!supabase && supabaseUrl && supabaseServiceKey) {
    try {
      supabase = createClient(supabaseUrl, supabaseServiceKey)
    } catch (error) {
      console.error("Failed to initialize Supabase:", error)
      return null
    }
  }
  return supabase
}

export async function GET() {
  try {
    console.log("Fetching analytics from database...")

    const analytics = await getAnalytics()

    console.log("✅ Successfully fetched analytics:", {
      total_affirmations: analytics.total_affirmations,
      total_views: analytics.total_views,
      total_favorites: analytics.total_favorites,
    })

    return NextResponse.json({
      analytics,
      success: true,
    })
  } catch (error) {
    console.error("❌ Failed to fetch analytics:", error)

    // Return basic fallback analytics
    const fallbackAnalytics = {
      total_affirmations: 0,
      total_views: 0,
      total_favorites: 0,
      category_stats: {
        Faith: 0,
        Strength: 0,
        Wisdom: 0,
        Gratitude: 0,
        Purpose: 0,
      },
      recent_activity: [],
    }

    return NextResponse.json({
      analytics: fallbackAnalytics,
      success: true,
      message: "Using fallback analytics data",
    })
  }
}
