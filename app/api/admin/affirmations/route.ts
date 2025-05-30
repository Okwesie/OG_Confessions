import { NextResponse } from "next/server"

// Mock database - replace with actual database integration
const mockAffirmations = [
  {
    id: "1",
    text: "My faith is my anchor in the storms of life. I will trust in the Lord with all my heart and lean not on my own understanding. In all my ways I acknowledge Him, and He shall direct my paths.",
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
  {
    id: "2",
    text: "I can do all things through Christ who strengthens me. When I am weak, then I am strong, for His power is made perfect in my weakness.",
    category: "Strength",
    source_platform: "telegram",
    source_message_id: "msg_002",
    created_at: "2024-01-14T15:45:00Z",
    updated_at: "2024-01-14T15:45:00Z",
    is_active: true,
    bible_verse: "Philippians 4:13",
    tags: ["strength", "power", "christ"],
    view_count: 234,
    favorite_count: 45,
  },
  {
    id: "3",
    text: "The wisdom that comes from heaven is first of all pure; then peace-loving, considerate, submissive, full of mercy and good fruit.",
    category: "Wisdom",
    source_platform: "manual",
    created_at: "2024-01-13T09:20:00Z",
    updated_at: "2024-01-13T09:20:00Z",
    is_active: true,
    bible_verse: "James 3:17",
    tags: ["wisdom", "heaven", "peace"],
    view_count: 89,
    favorite_count: 12,
  },
]

export async function GET() {
  try {
    return NextResponse.json({
      affirmations: mockAffirmations,
      success: true,
    })
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch affirmations" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json()

    const newAffirmation = {
      id: Date.now().toString(),
      ...data,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      view_count: 0,
      favorite_count: 0,
      source_platform: data.source_platform || "manual",
    }

    mockAffirmations.unshift(newAffirmation)

    return NextResponse.json({
      affirmation: newAffirmation,
      success: true,
    })
  } catch (error) {
    return NextResponse.json({ error: "Failed to create affirmation" }, { status: 500 })
  }
}
