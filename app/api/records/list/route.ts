import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get("type")

    let query = supabase.from("records").select("*, players(name)").order("created_at", { ascending: false })

    if (type) {
      query = query.eq("type", type)
    }

    const { data, error } = await query

    if (error) {
      throw error
    }

    const formattedRecords = data.map((record) => ({
      id: record.id,
      name: record.players?.name,
      class: record.class,
      value: record.value,
      type: record.type,
      date: record.created_at,
    }))

    return NextResponse.json(formattedRecords)
  } catch (error) {
    console.error("Erro ao listar registros:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}

