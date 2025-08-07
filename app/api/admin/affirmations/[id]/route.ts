import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

// Initialize Supabase client
const supabaseUrl = 'https://rpszhmtkopabgbsrzqmx.supabase.co'
const supabaseKey = process.env.SUPABASE_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const data = await request.json()
    const id = params.id

    // Update in database
    const { data: updatedData, error } = await supabase
      .from("affirmations")
      .update({
        text: data.text,
        category: data.category,
        bible_verse: data.bible_verse,
        tags: data.tags,
        is_active: data.is_active,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()

    if (error) {
      console.error("Failed to update affirmation:", error)
      return NextResponse.json({ error: "Failed to update affirmation" }, { status: 500 })
    }

    if (updatedData.length === 0) {
      return NextResponse.json({ error: "Affirmation not found" }, { status: 404 })
    }

    return NextResponse.json({
      affirmation: updatedData[0],
      success: true,
    })
  } catch (error) {
    console.error("Failed to update affirmation:", error)
    return NextResponse.json({ error: "Failed to update affirmation" }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id

    // Delete from database
    const { error } = await supabase.from("affirmations").delete().eq("id", id)

    if (error) {
      console.error("Failed to delete affirmation:", error)
      return NextResponse.json({ error: "Failed to delete affirmation" }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
    })
  } catch (error) {
    console.error("Failed to delete affirmation:", error)
    return NextResponse.json({ error: "Failed to delete affirmation" }, { status: 500 })
  }
}
