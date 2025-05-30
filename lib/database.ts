// lib/database.ts
import { createClient } from "@supabase/supabase-js"

// Use the correct Supabase environment variables
const supabaseUrl = process.env.SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error("Missing Supabase environment variables. Please check SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY")
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

export interface AffirmationRecord {
  id?: string
  text: string
  category: "Faith" | "Strength" | "Wisdom" | "Gratitude" | "Purpose"
  source_platform: string
  source_message_id: string
  tags: string[]
  bible_verse?: string
  created_at?: string
  updated_at?: string
  is_active?: boolean
  view_count?: number
  favorite_count?: number
}

/**
 * Check if a message already exists in the database
 */
export async function messageExists(sourceMessageId: string, sourcePlatform = "telegram"): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from("affirmations")
      .select("id")
      .eq("source_message_id", sourceMessageId)
      .eq("source_platform", sourcePlatform)
      .single()

    if (error && error.code !== "PGRST116") {
      // PGRST116 = no rows returned
      console.error("Error checking message existence:", error)
      return false
    }

    return !!data
  } catch (error) {
    console.error("Error in messageExists:", error)
    return false
  }
}

/**
 * Save a new affirmation to the database
 * UPDATED: Remove length restrictions and save everything
 */
export async function saveAffirmation(
  affirmation: AffirmationRecord,
): Promise<{ success: boolean; id?: string; error?: string }> {
  try {
    // Check if message already exists
    const exists = await messageExists(affirmation.source_message_id, affirmation.source_platform)

    if (exists) {
      return { success: false, error: "Message already exists" }
    }

    // REMOVED: No length restrictions - save everything
    const { data, error } = await supabase
      .from("affirmations")
      .insert([
        {
          text: affirmation.text, // FULL TEXT - no truncation
          category: affirmation.category,
          source_platform: affirmation.source_platform,
          source_message_id: affirmation.source_message_id,
          tags: affirmation.tags,
          bible_verse: affirmation.bible_verse,
          is_active: affirmation.is_active ?? true,
          view_count: 0,
          favorite_count: 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ])
      .select()
      .single()

    if (error) {
      console.error("Error saving affirmation:", error)
      return { success: false, error: error.message }
    }

    console.log(`✅ Successfully saved affirmation: ${affirmation.text.substring(0, 50)}...`)
    return { success: true, id: data.id }
  } catch (error) {
    console.error("Error in saveAffirmation:", error)
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" }
  }
}

/**
 * Get existing message IDs to check for duplicates
 */
export async function getExistingMessageIds(sourcePlatform = "telegram"): Promise<string[]> {
  try {
    const { data, error } = await supabase
      .from("affirmations")
      .select("source_message_id")
      .eq("source_platform", sourcePlatform)

    if (error) {
      console.error("Error getting existing message IDs:", error)
      return []
    }

    return data.map((row) => row.source_message_id)
  } catch (error) {
    console.error("Error in getExistingMessageIds:", error)
    return []
  }
}

/**
 * Get affirmations by category
 * UPDATED: Return complete text without truncation
 */
export async function getAffirmationsByCategory(category: string): Promise<any[]> {
  try {
    const { data, error } = await supabase
      .from("affirmations")
      .select("id, text, category, created_at, bible_verse, tags") // Include more fields
      .eq("category", category)
      .eq("is_active", true)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Database error:", error)
      return []
    }

    return data.map((item) => ({
      id: item.id,
      text: item.text, // COMPLETE TEXT
      category: item.category,
      timestamp: item.created_at,
      bible_verse: item.bible_verse,
      tags: item.tags || [],
    }))
  } catch (error) {
    console.error("Error getting affirmations by category:", error)
    return []
  }
}

/**
 * Get all affirmations
 */
export async function getAllAffirmations(): Promise<any[]> {
  try {
    const { data, error } = await supabase.from("affirmations").select("*").order("created_at", { ascending: false })

    if (error) {
      console.error("Database error:", error)
      return []
    }

    return data
  } catch (error) {
    console.error("Error getting all affirmations:", error)
    return []
  }
}

/**
 * Update affirmation analytics
 */
export async function updateAffirmationAnalytics(
  affirmationId: string,
  eventType: "view" | "favorite",
): Promise<boolean> {
  try {
    const field = eventType === "view" ? "view_count" : "favorite_count"

    const { data: current, error: fetchError } = await supabase
      .from("affirmations")
      .select(field)
      .eq("id", affirmationId)
      .single()

    if (fetchError) {
      console.error("Error fetching current count:", fetchError)
      return false
    }

    const newCount = (current[field] || 0) + 1
    const { error: updateError } = await supabase
      .from("affirmations")
      .update({ [field]: newCount })
      .eq("id", affirmationId)

    if (updateError) {
      console.error("Error updating analytics:", updateError)
      return false
    }

    return true
  } catch (error) {
    console.error("Error in updateAffirmationAnalytics:", error)
    return false
  }
}

/**
 * Get analytics data
 */
export async function getAnalytics() {
  try {
    // Get total count
    const { count: totalAffirmations, error: countError } = await supabase
      .from("affirmations")
      .select("*", { count: "exact", head: true })

    if (countError) throw countError

    // Get all affirmations for calculations
    const { data: allAffirmations, error: dataError } = await supabase
      .from("affirmations")
      .select("category, view_count, favorite_count, text, id")
      .eq("is_active", true)

    if (dataError) throw dataError

    // Calculate category stats
    const categoryStats: Record<string, number> = {
      Faith: 0,
      Strength: 0,
      Wisdom: 0,
      Gratitude: 0,
      Purpose: 0,
    }

    let totalViews = 0
    let totalFavorites = 0

    allAffirmations.forEach((item) => {
      if (item.category in categoryStats) {
        categoryStats[item.category]++
      }
      totalViews += item.view_count || 0
      totalFavorites += item.favorite_count || 0
    })

    // Get recent activity (top viewed/favorited)
    const recentActivity = allAffirmations
      .sort((a, b) => b.view_count + b.favorite_count - (a.view_count + a.favorite_count))
      .slice(0, 10)
      .map((item) => ({
        affirmation_id: item.id,
        affirmation_text: item.text.substring(0, 100) + (item.text.length > 100 ? "..." : ""),
        event_type: item.view_count > item.favorite_count ? "view" : "favorite",
        count: Math.max(item.view_count || 0, item.favorite_count || 0),
      }))

    return {
      total_affirmations: totalAffirmations || 0,
      total_views: totalViews,
      total_favorites: totalFavorites,
      category_stats: categoryStats,
      recent_activity: recentActivity,
    }
  } catch (error) {
    console.error("Error getting analytics:", error)
    throw error
  }
}

/**
 * Create the affirmations table if it doesn't exist
 */
export async function ensureTableExists(): Promise<void> {
  try {
    const { data, error } = await supabase.from("affirmations").select("count").limit(1)

    if (error) {
      console.error("Affirmations table may not exist:", error.message)
      throw new Error("Please create the affirmations table in your Supabase database")
    }

    console.log("✅ Affirmations table exists and is accessible")
  } catch (error) {
    console.error("Error checking table existence:", error)
    throw error
  }
}
