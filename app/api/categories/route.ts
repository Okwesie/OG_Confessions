import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, supabaseServiceKey)

export async function GET() {
  try {
    console.log("🔍 Fetching dynamic categories from database...")

    // Test database connection first
    const { testDatabaseConnection } = await import("@/lib/database")
    const connectionTest = await testDatabaseConnection()

    if (!connectionTest.success) {
      console.error("❌ Database connection failed:", connectionTest.error)
      return NextResponse.json({
        categories: getFallbackCategories(),
        success: true,
        message: "Using fallback categories due to database connection issue",
        error: connectionTest.error,
      })
    }

    // Get all active affirmations with their categories
    const { data: affirmations, error } = await supabase
      .from("affirmations")
      .select("category, created_at")
      .eq("is_active", true)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("❌ Database query error:", error)
      return NextResponse.json({
        categories: getFallbackCategories(),
        success: true,
        message: "Using fallback categories due to database query error",
        error: error.message,
      })
    }

    if (!affirmations || affirmations.length === 0) {
      console.log("📝 No affirmations found, returning fallback categories")
      return NextResponse.json({
        categories: getFallbackCategories(),
        success: true,
        message: "No affirmations found in database, showing default categories",
      })
    }

    // Count affirmations by category
    const categoryCounts: Record<string, number> = {}
    const categoryLastUpdated: Record<string, string> = {}

    affirmations.forEach((affirmation) => {
      const category = affirmation.category
      if (category) {
        categoryCounts[category] = (categoryCounts[category] || 0) + 1

        // Track most recent update for each category
        if (!categoryLastUpdated[category] || affirmation.created_at > categoryLastUpdated[category]) {
          categoryLastUpdated[category] = affirmation.created_at
        }
      }
    })

    // Create category objects with metadata
    const categories = Object.entries(categoryCounts).map(([name, count]) => ({
      name,
      count,
      last_updated: categoryLastUpdated[name],
      // Add some default descriptions and icons based on category name
      description: getCategoryDescription(name),
      icon: getCategoryIcon(name),
      gradient: getCategoryGradient(name),
      borderColor: getCategoryBorderColor(name),
      preview: getCategoryPreview(name),
    }))

    // Sort by count (most popular first)
    categories.sort((a, b) => b.count - a.count)

    console.log(
      `✅ Found ${categories.length} dynamic categories:`,
      categories.map((c) => `${c.name} (${c.count})`),
    )

    return NextResponse.json({
      categories,
      success: true,
      total_categories: categories.length,
      total_affirmations: affirmations.length,
    })
  } catch (error) {
    console.error("❌ Failed to fetch categories:", error)
    return NextResponse.json({
      categories: [],
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    })
  }
}

// Helper functions for category metadata
function getCategoryDescription(category: string): string {
  const descriptions: Record<string, string> = {
    Faith: "Affirmations to strengthen your faith and spiritual journey",
    Strength: "Affirmations for courage and spiritual strength",
    Wisdom: "Biblical wisdom and guidance for daily living",
    Gratitude: "Expressions of thankfulness and praise",
    Purpose: "Discovering and living your God-given purpose",
    Hope: "Messages of hope and encouragement",
    Love: "Affirmations about God's love and loving others",
    Peace: "Finding peace in God's presence",
    Joy: "Celebrating joy in the Lord",
    Healing: "Prayers and affirmations for healing",
    Prosperity: "Spiritual and material abundance",
    Protection: "God's protection and safety",
    Guidance: "Seeking divine direction",
    Forgiveness: "Grace, mercy, and forgiveness",
    Victory: "Overcoming challenges through faith",
  }

  return descriptions[category] || `Spiritual affirmations about ${category.toLowerCase()}`
}

function getCategoryIcon(category: string): string {
  const icons: Record<string, string> = {
    Faith: "Heart",
    Strength: "TrendingUp",
    Wisdom: "BookOpen",
    Gratitude: "Users",
    Purpose: "Briefcase",
    Hope: "Star",
    Love: "Heart",
    Peace: "Smile",
    Joy: "Sun",
    Healing: "Shield",
    Prosperity: "TrendingUp",
    Protection: "Shield",
    Guidance: "Compass",
    Forgiveness: "Heart",
    Victory: "Trophy",
  }

  return icons[category] || "Heart"
}

function getCategoryGradient(category: string): string {
  const gradients: Record<string, string> = {
    Faith: "from-blue-500/20 to-indigo-600/20",
    Strength: "from-purple-500/20 to-violet-600/20",
    Wisdom: "from-amber-500/20 to-yellow-600/20",
    Gratitude: "from-green-500/20 to-emerald-600/20",
    Purpose: "from-pink-500/20 to-rose-600/20",
    Hope: "from-cyan-500/20 to-blue-600/20",
    Love: "from-red-500/20 to-pink-600/20",
    Peace: "from-teal-500/20 to-green-600/20",
    Joy: "from-yellow-500/20 to-orange-600/20",
    Healing: "from-emerald-500/20 to-teal-600/20",
    Prosperity: "from-violet-500/20 to-purple-600/20",
    Protection: "from-slate-500/20 to-gray-600/20",
    Guidance: "from-indigo-500/20 to-blue-600/20",
    Forgiveness: "from-rose-500/20 to-red-600/20",
    Victory: "from-orange-500/20 to-yellow-600/20",
  }

  return gradients[category] || "from-blue-500/20 to-purple-600/20"
}

function getCategoryBorderColor(category: string): string {
  const borderColors: Record<string, string> = {
    Faith: "border-blue-500/30 hover:border-blue-400/50",
    Strength: "border-purple-500/30 hover:border-purple-400/50",
    Wisdom: "border-amber-500/30 hover:border-amber-400/50",
    Gratitude: "border-green-500/30 hover:border-green-400/50",
    Purpose: "border-pink-500/30 hover:border-pink-400/50",
    Hope: "border-cyan-500/30 hover:border-cyan-400/50",
    Love: "border-red-500/30 hover:border-red-400/50",
    Peace: "border-teal-500/30 hover:border-teal-400/50",
    Joy: "border-yellow-500/30 hover:border-yellow-400/50",
    Healing: "border-emerald-500/30 hover:border-emerald-400/50",
    Prosperity: "border-violet-500/30 hover:border-violet-400/50",
    Protection: "border-slate-500/30 hover:border-slate-400/50",
    Guidance: "border-indigo-500/30 hover:border-indigo-400/50",
    Forgiveness: "border-rose-500/30 hover:border-rose-400/50",
    Victory: "border-orange-500/30 hover:border-orange-400/50",
  }

  return borderColors[category] || "border-blue-500/30 hover:border-blue-400/50"
}

function getCategoryPreview(category: string): string {
  const previews: Record<string, string> = {
    Faith: "My faith is my anchor in the storms of life...",
    Strength: "I am strong because God is my strength...",
    Wisdom: "The wisdom of God guides my every decision...",
    Gratitude: "I am grateful for God's endless blessings in my life...",
    Purpose: "I was created with divine purpose and meaning...",
    Hope: "My hope is built on nothing less than Jesus...",
    Love: "God's love surrounds me and fills my heart...",
    Peace: "The peace of God guards my heart and mind...",
    Joy: "The joy of the Lord is my strength...",
    Healing: "By His stripes I am healed and made whole...",
    Prosperity: "God desires to prosper me in all things...",
    Protection: "God is my refuge and fortress...",
    Guidance: "The Lord directs my steps and guides my path...",
    Forgiveness: "I am forgiven and set free by God's grace...",
    Victory: "In Christ, I am more than a conqueror...",
  }

  return previews[category] || `God blesses me with ${category.toLowerCase()}...`
}

// Fallback categories when database is not available
function getFallbackCategories() {
  return [
    {
      name: "Faith",
      count: 0,
      last_updated: new Date().toISOString(),
      description: "Affirmations to strengthen your faith and spiritual journey",
      icon: "Heart",
      gradient: "from-blue-500/20 to-indigo-600/20",
      borderColor: "border-blue-500/30 hover:border-blue-400/50",
      preview: "My faith is my anchor in the storms of life...",
    },
    {
      name: "Strength",
      count: 0,
      last_updated: new Date().toISOString(),
      description: "Affirmations for courage and spiritual strength",
      icon: "TrendingUp",
      gradient: "from-purple-500/20 to-violet-600/20",
      borderColor: "border-purple-500/30 hover:border-purple-400/50",
      preview: "I am strong because God is my strength...",
    },
    {
      name: "Wisdom",
      count: 0,
      last_updated: new Date().toISOString(),
      description: "Biblical wisdom and guidance for daily living",
      icon: "BookOpen",
      gradient: "from-amber-500/20 to-yellow-600/20",
      borderColor: "border-amber-500/30 hover:border-amber-400/50",
      preview: "The wisdom of God guides my every decision...",
    },
    {
      name: "Gratitude",
      count: 0,
      last_updated: new Date().toISOString(),
      description: "Expressions of thankfulness and praise",
      icon: "Users",
      gradient: "from-green-500/20 to-emerald-600/20",
      borderColor: "border-green-500/30 hover:border-green-400/50",
      preview: "I am grateful for God's endless blessings in my life...",
    },
    {
      name: "Purpose",
      count: 0,
      last_updated: new Date().toISOString(),
      description: "Discovering and living your God-given purpose",
      icon: "Briefcase",
      gradient: "from-pink-500/20 to-rose-600/20",
      borderColor: "border-pink-500/30 hover:border-pink-400/50",
      preview: "I was created with divine purpose and meaning...",
    },
  ]
}
