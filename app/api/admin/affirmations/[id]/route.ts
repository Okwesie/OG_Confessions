import { NextResponse } from "next/server"

// Mock database - replace with actual database integration
const mockAffirmations = [
  {
    id: "1",
    text: "My faith is my anchor in the storms of life. I will trust in the Lord with all my heart and lean not on my own understanding.",
    category: "Faith",
    source_platform: "telegram",
    source_message_id: "msg_001",
    created_at: "2024-01-15T10:30:00Z",
    updated_at: "2024-01-15T10:30:00Z",
    is_active: true,
    bible_verse: "Proverbs 3:5-6",
    tags: ["faith", "trust", "guidance"],
    view_count: 156,
    favorite_count: 23,
  },
]

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const data = await request.json()
    const affirmationIndex = mockAffirmations.findIndex((a) => a.id === params.id)

    if (affirmationIndex === -1) {
      return NextResponse.json({ error: "Affirmation not found" }, { status: 404 })
    }

    mockAffirmations[affirmationIndex] = {
      ...mockAffirmations[affirmationIndex],
      ...data,
      updated_at: new Date().toISOString(),
    }

    return NextResponse.json({
      affirmation: mockAffirmations[affirmationIndex],
      success: true,
    })
  } catch (error) {
    return NextResponse.json({ error: "Failed to update affirmation" }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const affirmationIndex = mockAffirmations.findIndex((a) => a.id === params.id)

    if (affirmationIndex === -1) {
      return NextResponse.json({ error: "Affirmation not found" }, { status: 404 })
    }

    mockAffirmations.splice(affirmationIndex, 1)

    return NextResponse.json({
      success: true,
    })
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete affirmation" }, { status: 500 })
  }
}
