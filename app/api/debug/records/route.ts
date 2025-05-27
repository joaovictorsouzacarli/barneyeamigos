import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase"

export async function GET(request: Request) {
  try {
    const { data: records, error } = await supabaseAdmin
      .from("records")
      .select(`
        id,
        player_id,
        class,
        value,
        type,
        created_at,
        players (
          id,
          name
        )
      `)
      .order("created_at", { ascending: false })
      .limit(100)

    if (error) {
      console.error("Erro ao buscar registros:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      count: records.length,
      records: records,
    })
  } catch (error) {
    console.error("Erro ao buscar registros:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
