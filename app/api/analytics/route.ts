import { NextResponse } from "next/server"
import { updateAffirmationAnalytics } from "@/lib/database"

export async function POST(request: Request) {
  try {
    const { affirmation_id, event_type, user_session } = await request.json()

    if (!affirmation_id || !event_type) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    if (!["view", "favorite"].includes(event_type)) {
      return NextResponse.json({ error: "Invalid event type" }, { status: 400 })
    }

    console.log(`📊 Tracking ${event_type} for affirmation ${affirmation_id}`)

    const success = await updateAffirmationAnalytics(affirmation_id, event_type)

    if (!success) {
      return NextResponse.json({ error: "Failed to update analytics" }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
    })
  } catch (error) {
    console.error("❌ Failed to track analytics:", error)
    return NextResponse.json({ error: "Failed to track analytics" }, { status: 500 })
  }
}
