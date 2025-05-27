import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase"

export async function POST(request: Request) {
  try {
    console.log("Iniciando sincronização de dados...")

    // Verificar a conexão com o Supabase
    console.log("Verificando conexão com o Supabase...")
    try {
      const { data: connectionTest, error: connectionError } = await supabaseAdmin.from("players").select("count")

      if (connectionError) {
        console.error("Erro de conexão com o Supabase:", connectionError)
        return NextResponse.json(
          {
            error: "Erro de conexão com o Supabase: " + connectionError.message,
            details: connectionError,
          },
          { status: 500 },
        )
      }

      console.log("Conexão com o Supabase estabelecida com sucesso")
    } catch (connError) {
      console.error("Exceção ao conectar com o Supabase:", connError)
      return NextResponse.json(
        {
          error:
            "Exceção ao conectar com o Supabase: " +
            (connError instanceof Error ? connError.message : String(connError)),
        },
        { status: 500 },
      )
    }

    // 1. Verificar jogadores existentes
    console.log("Buscando jogadores existentes...")
    const { data: players, error: playersError } = await supabaseAdmin.from("players").select("*")

    if (playersError) {
      console.error("Erro ao buscar jogadores:", playersError)
      return NextResponse.json({ error: "Erro ao buscar jogadores: " + playersError.message }, { status: 500 })
    }

    if (!players) {
      console.warn("Nenhum jogador encontrado ou resposta inválida")
      return NextResponse.json({ error: "Nenhum jogador encontrado ou resposta inválida" }, { status: 500 })
    }

    console.log(`Encontrados ${players.length} jogadores no banco de dados`)

    // 2. Verificar registros existentes
    console.log("Buscando registros existentes...")
    const { data: records, error: recordsError } = await supabaseAdmin.from("records").select(`
        id,
        player_id,
        class,
        value,
        type,
        created_at
      `)

    if (recordsError) {
      console.error("Erro ao buscar registros:", recordsError)
      return NextResponse.json({ error: "Erro ao buscar registros: " + recordsError.message }, { status: 500 })
    }

    if (!records) {
      console.warn("Nenhum registro encontrado ou resposta inválida")
      return NextResponse.json({ error: "Nenhum registro encontrado ou resposta inválida" }, { status: 500 })
    }

    console.log(`Encontrados ${records.length} registros no banco de dados`)

    // 3. Verificar relações entre jogadores e registros
    console.log("Verificando relações entre jogadores e registros...")

    // Mapear jogadores por ID para verificação rápida
    const playerMap = new Map()
    players.forEach((player) => {
      playerMap.set(player.id, player)
    })

    // Verificar registros sem jogador associado
    const orphanedRecords = records.filter((record) => !playerMap.has(record.player_id))

    if (orphanedRecords.length > 0) {
      console.warn(`Encontrados ${orphanedRecords.length} registros sem jogador associado`)
      console.log("Exemplos de registros órfãos:", orphanedRecords.slice(0, 3))
    }

    // 4. Verificar registros de DPS e HPS
    const dpsRecords = records.filter((record) => record.type === "dps")
    const hpsRecords = records.filter((record) => record.type === "hps")

    console.log(`Registros de DPS: ${dpsRecords.length}`)
    console.log(`Registros de HPS: ${hpsRecords.length}`)

    // 5. Verificar jogadores sem registros
    const playersWithoutRecords = players.filter((player) => {
      return !records.some((record) => record.player_id === player.id)
    })

    if (playersWithoutRecords.length > 0) {
      console.warn(`Encontrados ${playersWithoutRecords.length} jogadores sem registros`)
      console.log("Exemplos de jogadores sem registros:", playersWithoutRecords.slice(0, 3))
    }

    // 6. Testar a consulta de ranking para garantir que está funcionando
    console.log("Testando consulta de ranking...")

    // Consulta para DPS
    const { data: dpsRanking, error: dpsRankingError } = await supabaseAdmin
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
      .eq("type", "dps")
      .order("value", { ascending: false })
      .limit(10)

    if (dpsRankingError) {
      console.error("Erro ao testar ranking de DPS:", dpsRankingError)
      return NextResponse.json({ error: "Erro ao testar ranking de DPS: " + dpsRankingError.message }, { status: 500 })
    }

    // Verificar se os jogadores estão sendo incluídos corretamente na consulta
    const dpsRankingWithMissingPlayers = dpsRanking ? dpsRanking.filter((record) => !record.players) : []

    if (dpsRankingWithMissingPlayers.length > 0) {
      console.warn(
        `Encontrados ${dpsRankingWithMissingPlayers.length} registros de DPS sem jogador associado na consulta`,
      )
      console.log("Exemplos:", dpsRankingWithMissingPlayers.slice(0, 3))
    }

    return NextResponse.json({
      success: true,
      stats: {
        players: players.length,
        records: records.length,
        dpsRecords: dpsRecords.length,
        hpsRecords: hpsRecords.length,
        orphanedRecords: orphanedRecords.length,
        playersWithoutRecords: playersWithoutRecords.length,
        dpsRankingTest: {
          count: dpsRanking ? dpsRanking.length : 0,
          missingPlayers: dpsRankingWithMissingPlayers.length,
          samples: dpsRanking ? dpsRanking.slice(0, 3) : [],
        },
      },
    })
  } catch (error) {
    console.error("Erro durante a sincronização:", error)
    return NextResponse.json(
      {
        error: "Erro interno do servidor: " + (error instanceof Error ? error.message : String(error)),
        stack: error instanceof Error ? error.stack : undefined,
      },
      { status: 500 },
    )
  }
}
