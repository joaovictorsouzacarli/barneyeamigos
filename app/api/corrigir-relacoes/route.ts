import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase"

export async function POST(request: Request) {
  try {
    console.log("Iniciando correção de relações...")

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

    // 1. Buscar todos os registros
    const { data: records, error: recordsError } = await supabaseAdmin.from("records").select("*")

    if (recordsError) {
      console.error("Erro ao buscar registros:", recordsError)
      return NextResponse.json({ error: "Erro ao buscar registros: " + recordsError.message }, { status: 500 })
    }

    if (!records) {
      return NextResponse.json({ error: "Nenhum registro encontrado ou resposta inválida" }, { status: 500 })
    }

    console.log(`Encontrados ${records.length} registros para verificação`)

    // 2. Buscar todos os jogadores
    const { data: players, error: playersError } = await supabaseAdmin.from("players").select("*")

    if (playersError) {
      console.error("Erro ao buscar jogadores:", playersError)
      return NextResponse.json({ error: "Erro ao buscar jogadores: " + playersError.message }, { status: 500 })
    }

    if (!players) {
      return NextResponse.json({ error: "Nenhum jogador encontrado ou resposta inválida" }, { status: 500 })
    }

    console.log(`Encontrados ${players.length} jogadores para verificação`)

    // 3. Criar um mapa de jogadores por ID
    const playerMap = new Map()
    players.forEach((player) => {
      playerMap.set(player.id, player)
    })

    // 4. Identificar registros com problemas de relação
    const orphanedRecords = records.filter((record) => !playerMap.has(record.player_id))

    console.log(`Encontrados ${orphanedRecords.length} registros órfãos`)

    // 5. Tentar corrigir registros órfãos
    const corrections = []
    const failures = []

    for (const record of orphanedRecords) {
      try {
        // Buscar o jogador pelo ID (pode ter sido excluído)
        const { data: playerData, error: playerError } = await supabaseAdmin
          .from("players")
          .select("*")
          .eq("id", record.player_id)
          .single()

        if (playerError) {
          console.log(`Jogador com ID ${record.player_id} não encontrado, criando um novo jogador`)

          // Criar um novo jogador com nome temporário
          const { data: newPlayer, error: createError } = await supabaseAdmin
            .from("players")
            .insert({ name: `Jogador_${record.player_id.substring(0, 8)}` })
            .select()
            .single()

          if (createError) {
            console.error("Erro ao criar jogador:", createError)
            failures.push({
              record,
              error: createError.message,
            })
            continue
          }

          // Atualizar o registro com o novo player_id
          const { data: updatedRecord, error: updateError } = await supabaseAdmin
            .from("records")
            .update({ player_id: newPlayer.id })
            .eq("id", record.id)
            .select()
            .single()

          if (updateError) {
            console.error("Erro ao atualizar registro:", updateError)
            failures.push({
              record,
              error: updateError.message,
            })
            continue
          }

          corrections.push({
            record,
            action: "created_player",
            newPlayerId: newPlayer.id,
          })
        } else {
          // Jogador existe, mas pode haver um problema de relação
          corrections.push({
            record,
            action: "player_exists",
            playerId: playerData.id,
          })
        }
      } catch (error) {
        console.error(`Erro ao processar registro ${record.id}:`, error)
        failures.push({
          record,
          error: error instanceof Error ? error.message : "Erro desconhecido",
        })
      }
    }

    return NextResponse.json({
      success: true,
      stats: {
        totalRecords: records.length,
        totalPlayers: players.length,
        orphanedRecords: orphanedRecords.length,
        corrected: corrections.length,
        failed: failures.length,
      },
      corrections,
      failures,
    })
  } catch (error) {
    console.error("Erro durante a correção de relações:", error)
    return NextResponse.json(
      {
        error: "Erro interno do servidor: " + (error instanceof Error ? error.message : String(error)),
        stack: error instanceof Error ? error.stack : undefined,
      },
      { status: 500 },
    )
  }
}
