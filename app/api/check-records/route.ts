import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase"

export async function GET(request: Request) {
  try {
    // Verificar se há registros na tabela records
    const { data: recordsCount, error: recordsError } = await supabaseAdmin.from("records").select("count")

    if (recordsError) {
      console.error("Erro ao contar registros:", recordsError)
      return NextResponse.json({ error: recordsError.message }, { status: 500 })
    }

    // Verificar se há jogadores na tabela players
    const { data: playersCount, error: playersError } = await supabaseAdmin.from("players").select("count")

    if (playersError) {
      console.error("Erro ao contar jogadores:", playersError)
      return NextResponse.json({ error: playersError.message }, { status: 500 })
    }

    // Buscar alguns registros para verificar a estrutura
    const { data: sampleRecords, error: sampleError } = await supabaseAdmin
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
      .limit(5)

    if (sampleError) {
      console.error("Erro ao buscar amostra de registros:", sampleError)
      return NextResponse.json({ error: sampleError.message }, { status: 500 })
    }

    return NextResponse.json({
      recordsCount: recordsCount[0].count,
      playersCount: playersCount[0].count,
      sampleRecords: sampleRecords,
    })
  } catch (error) {
    console.error("Erro ao verificar registros:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
