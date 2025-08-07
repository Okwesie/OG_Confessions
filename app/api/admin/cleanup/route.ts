import { NextResponse } from "next/server"
import { deleteOldConfessions } from "@/lib/database"

/**
 * Manual cleanup endpoint for admin use
 */
export async function POST() {
  try {
    console.log("🧹 Manual cleanup triggered from admin...")
    
    const result = await deleteOldConfessions()
    
    if (result.success) {
      return NextResponse.json({
        success: true,
        message: `Successfully deleted ${result.deletedCount} old confessions`,
        deletedCount: result.deletedCount
      })
    } else {
      return NextResponse.json({
        success: false,
        error: result.error
      }, { status: 500 })
    }
  } catch (error) {
    console.error("❌ Error in cleanup endpoint:", error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 })
  }
}

/**
 * Get cleanup status and info
 */
export async function GET() {
  try {
    // Calculate how many confessions would be deleted
    const twoDaysAgo = new Date()
    twoDaysAgo.setDate(twoDaysAgo.getDate() - 2)
    
    return NextResponse.json({
      success: true,
      cutoffDate: twoDaysAgo.toISOString(),
      message: "Cleanup endpoint ready. Use POST to execute cleanup."
    })
  } catch (error) {
    console.error("❌ Error getting cleanup status:", error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 })
  }
} 