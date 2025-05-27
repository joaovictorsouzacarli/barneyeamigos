import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase"

export async function POST(request: Request) {
  try {
    console.log("Adicionando registro de teste...")

    // Verificar a conexão com o Supabase
    try {
      const { error: connectionError } = await supabaseAdmin.from("players").select("count")

      if (connectionError) {
        console.error("Erro de conexão com o Supabase:", connectionError)
        return NextResponse.json(
          {
            error: "Erro de conexão com o Supabase: " + connectionError.message,
          },
          { status: 500 },
        )
      }
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

    // Buscar um jogador existente
    const { data: existingPlayers, error: playersError } = await supabaseAdmin.from("players").select("*").limit(1)

    if (playersError) {
      console.error("Erro ao buscar jogadores:", playersError)
      return NextResponse.json({ error: "Erro ao buscar jogadores: " + playersError.message }, { status: 500 })
    }

    let playerId
    let playerName

    if (!existingPlayers || existingPlayers.length === 0) {
      // Criar um novo jogador
      const testPlayerName = `Teste_${Date.now()}`
      const { data: newPlayer, error: createPlayerError } = await supabaseAdmin
        .from("players")
        .insert({ name: testPlayerName })
        .select()
        .single()

      if (createPlayerError) {
        console.error("Erro ao criar jogador de teste:", createPlayerError)
        return NextResponse.json(
          { error: "Erro ao criar jogador de teste: " + createPlayerError.message },
          { status: 500 },
        )
      }

      playerId = newPlayer.id
      playerName = newPlayer.name
    } else {
      playerId = existingPlayers[0].id
      playerName = existingPlayers[0].name
    }

    // Criar um registro de DPS
    const dpsValue = Math.floor(Math.random() * 10000) + 5000
    const { data: dpsRecord, error: dpsError } = await supabaseAdmin
      .from("records")
      .insert({
        player_id: playerId,
        class: "FULGURANTE",
        value: dpsValue,
        type: "dps",
      })
      .select()
      .single()

    if (dpsError) {
      console.error("Erro ao criar registro de DPS:", dpsError)
      return NextResponse.json({ error: "Erro ao criar registro de DPS: " + dpsError.message }, { status: 500 })
    }

    // Criar um registro de HPS
    const hpsValue = Math.floor(Math.random() * 5000) + 2000
    const { data: hpsRecord, error: hpsError } = await supabaseAdmin
      .from("records")
      .insert({
        player_id: playerId,
        class: "QUEDA SANTA",
        value: hpsValue,
        type: "hps",
      })
      .select()
      .single()

    if (hpsError) {
      console.error("Erro ao criar registro de HPS:", hpsError)
      return NextResponse.json({ error: "Erro ao criar registro de HPS: " + hpsError.message }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      player: {
        id: playerId,
        name: playerName,
      },
      records: {
        dps: dpsRecord,
        hps: hpsRecord,
      },
    })
  } catch (error) {
    console.error("Erro ao adicionar registros de teste:", error)
    return NextResponse.json(
      {
        error: "Erro interno do servidor: " + (error instanceof Error ? error.message : String(error)),
        stack: error instanceof Error ? error.stack : undefined,
      },
      { status: 500 },
    )
  }
}
