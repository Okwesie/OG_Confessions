import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

// Initialize Supabase client with error handling
const supabaseUrl = process.env.SUPABASE_URL || 'https://rpszhmtkopabgbsrzqmx.supabase.co'
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY // Change from SUPABASE_KEY
if (!supabaseKey) {
  throw new Error('SUPABASE_SERVICE_ROLE_KEY is not set')
}
const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { persistSession: false }
})

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const data = await request.json()
    const { id } = await params

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
      .single()

    if (error) {
      console.error("Error updating affirmation:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      affirmation: updatedData,
    })
  } catch (error) {
    console.error("Error in PUT /api/admin/affirmations/[id]:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    )
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params

    // Delete from database
    const { error } = await supabase.from("affirmations").delete().eq("id", id)

    if (error) {
      console.error("Error deleting affirmation:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: "Affirmation deleted successfully",
    })
  } catch (error) {
    console.error("Error in DELETE /api/admin/affirmations/[id]:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    )
  }
}
