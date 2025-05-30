import { NextResponse } from "next/server"

// Mock data organized by category for the main app
const mockAffirmationsByCategory = {
  Faith: [
    {
      id: "f1",
      text: "My faith is my anchor in the storms of life. I will trust in the Lord with all my heart and lean not on my own understanding. In all my ways I acknowledge Him, and He shall direct my paths.",
      category: "Faith",
      timestamp: "2024-01-15T10:30:00Z",
    },
    {
      id: "f2",
      text: "I am a child of God, fearfully and wonderfully made. His perfect love casts out all fear. I will not be shaken, for He is always with me, guiding my steps and lighting my path.",
      category: "Faith",
      timestamp: "2024-01-14T08:15:00Z",
    },
  ],
  Strength: [
    {
      id: "s1",
      text: "I can do all things through Christ who strengthens me. When I am weak, then I am strong, for His power is made perfect in my weakness. I will not rely on my own strength but on God's unlimited power.",
      category: "Strength",
      timestamp: "2024-01-14T15:45:00Z",
    },
  ],
  Wisdom: [
    {
      id: "w1",
      text: "The wisdom that comes from heaven is first of all pure; then peace-loving, considerate, submissive, full of mercy and good fruit, impartial and sincere. I seek this wisdom above all earthly knowledge.",
      category: "Wisdom",
      timestamp: "2024-01-13T09:20:00Z",
    },
  ],
  Gratitude: [
    {
      id: "g1",
      text: "I will give thanks to the Lord with my whole heart. I will recount all of His wonderful deeds. Every good and perfect gift comes from above. Even in trials, I find reasons to be thankful for His unfailing love.",
      category: "Gratitude",
      timestamp: "2024-01-12T20:15:00Z",
    },
  ],
  Purpose: [
    {
      id: "p1",
      text: "I am God's workmanship, created in Christ Jesus for good works, which God prepared beforehand that I should walk in them. My life has divine purpose and eternal significance.",
      category: "Purpose",
      timestamp: "2024-01-11T14:30:00Z",
    },
  ],
}

export async function GET(request: Request, { params }: { params: { category: string } }) {
  try {
    const category = params.category as keyof typeof mockAffirmationsByCategory
    const affirmations = mockAffirmationsByCategory[category] || []

    return NextResponse.json({
      affirmations,
      success: true,
    })
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch affirmations" }, { status: 500 })
  }
}
