import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase"

export async function POST(request: Request) {
  try {
    // Criar um jogador de teste
    const playerName = `Teste_${Date.now()}`

    // Verificar se o jogador já existe
    const { data: existingPlayer, error: playerCheckError } = await supabaseAdmin
      .from("players")
      .select("*")
      .eq("name", playerName)
      .single()

    let playerId

    if (playerCheckError) {
      // Jogador não existe, criar novo
      const { data: newPlayer, error: createPlayerError } = await supabaseAdmin
        .from("players")
        .insert({ name: playerName })
        .select()
        .single()

      if (createPlayerError) {
        console.error("Erro ao criar jogador de teste:", createPlayerError)
        return NextResponse.json({ error: "Erro ao criar jogador de teste" }, { status: 500 })
      }

      playerId = newPlayer.id
    } else {
      playerId = existingPlayer.id
    }

    // Criar um registro de DPS
    const { data: dpsRecord, error: dpsError } = await supabaseAdmin
      .from("records")
      .insert({
        player_id: playerId,
        class: "FULGURANTE",
        value: Math.floor(Math.random() * 10000) + 5000,
        type: "dps",
      })
      .select()
      .single()

    if (dpsError) {
      console.error("Erro ao criar registro de DPS:", dpsError)
      return NextResponse.json({ error: "Erro ao criar registro de DPS" }, { status: 500 })
    }

    // Criar um registro de HPS
    const { data: hpsRecord, error: hpsError } = await supabaseAdmin
      .from("records")
      .insert({
        player_id: playerId,
        class: "QUEDA SANTA",
        value: Math.floor(Math.random() * 5000) + 2000,
        type: "hps",
      })
      .select()
      .single()

    if (hpsError) {
      console.error("Erro ao criar registro de HPS:", hpsError)
      return NextResponse.json({ error: "Erro ao criar registro de HPS" }, { status: 500 })
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
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
