import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase"

export async function GET(request: Request) {
  try {
    // 1. Verificar conexão com o Supabase
    console.log("Verificando conexão com o Supabase...")
    const { data: connectionTest, error: connectionError } = await supabaseAdmin.from("players").select("count")

    if (connectionError) {
      console.error("Erro de conexão com o Supabase:", connectionError)
      return NextResponse.json({ error: "Erro de conexão com o Supabase", details: connectionError }, { status: 500 })
    }

    // 2. Contar jogadores
    console.log("Contando jogadores...")
    const { data: playersCount, error: playersError } = await supabaseAdmin.from("players").select("count")

    if (playersError) {
      console.error("Erro ao contar jogadores:", playersError)
      return NextResponse.json({ error: "Erro ao contar jogadores", details: playersError }, { status: 500 })
    }

    // 3. Listar todos os jogadores
    console.log("Listando jogadores...")
    const { data: players, error: playersListError } = await supabaseAdmin.from("players").select("*")

    if (playersListError) {
      console.error("Erro ao listar jogadores:", playersListError)
      return NextResponse.json({ error: "Erro ao listar jogadores", details: playersListError }, { status: 500 })
    }

    // 4. Contar registros
    console.log("Contando registros...")
    const { data: recordsCount, error: recordsError } = await supabaseAdmin.from("records").select("count")

    if (recordsError) {
      console.error("Erro ao contar registros:", recordsError)
      return NextResponse.json({ error: "Erro ao contar registros", details: recordsError }, { status: 500 })
    }

    // 5. Verificar registros de DPS
    console.log("Verificando registros de DPS...")
    const { data: dpsRecords, error: dpsError } = await supabaseAdmin.from("records").select("*").eq("type", "dps")

    if (dpsError) {
      console.error("Erro ao verificar registros de DPS:", dpsError)
      return NextResponse.json({ error: "Erro ao verificar registros de DPS", details: dpsError }, { status: 500 })
    }

    // 6. Verificar registros de HPS
    console.log("Verificando registros de HPS...")
    const { data: hpsRecords, error: hpsError } = await supabaseAdmin.from("records").select("*").eq("type", "hps")

    if (hpsError) {
      console.error("Erro ao verificar registros de HPS:", hpsError)
      return NextResponse.json({ error: "Erro ao verificar registros de HPS", details: hpsError }, { status: 500 })
    }

    // 7. Verificar relação entre players e records
    console.log("Verificando relação entre players e records...")
    const { data: joinTest, error: joinError } = await supabaseAdmin
      .from("records")
      .select(`
        id,
        player_id,
        class,
        value,
        type,
        players (
          id,
          name
        )
      `)
      .limit(5)

    if (joinError) {
      console.error("Erro ao verificar relação entre tabelas:", joinError)
      return NextResponse.json(
        { error: "Erro ao verificar relação entre tabelas", details: joinError },
        { status: 500 },
      )
    }

    // Retornar todos os dados de diagnóstico
    return NextResponse.json({
      connection: "ok",
      players: {
        count: playersCount[0].count,
        list: players,
      },
      records: {
        count: recordsCount[0].count,
        dps: {
          count: dpsRecords.length,
          samples: dpsRecords.slice(0, 3),
        },
        hps: {
          count: hpsRecords.length,
          samples: hpsRecords.slice(0, 3),
        },
      },
      joins: {
        samples: joinTest,
      },
    })
  } catch (error) {
    console.error("Erro geral no diagnóstico:", error)
    return NextResponse.json({ error: "Erro geral no diagnóstico", details: error }, { status: 500 })
  }
}
