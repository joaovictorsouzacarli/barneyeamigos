import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase"

export async function POST(request: Request) {
  try {
    console.log("🗑️ Iniciando limpeza COMPLETA de dados...")

    // Verificar a conexão com o Supabase
    try {
      const { error: connectionError } = await supabaseAdmin.from("players").select("count")

      if (connectionError) {
        console.error("❌ Erro de conexão com o Supabase:", connectionError)
        return NextResponse.json(
          {
            error: "Erro de conexão com o Supabase: " + connectionError.message,
          },
          { status: 500 },
        )
      }
    } catch (connError) {
      console.error("💥 Exceção ao conectar com o Supabase:", connError)
      return NextResponse.json(
        {
          error:
            "Exceção ao conectar com o Supabase: " +
            (connError instanceof Error ? connError.message : String(connError)),
        },
        { status: 500 },
      )
    }

    // Contar dados antes da limpeza
    let recordsCountBefore = 0
    let playersCountBefore = 0

    try {
      const { data: recordsData } = await supabaseAdmin.from("records").select("id")
      recordsCountBefore = recordsData?.length || 0

      const { data: playersData } = await supabaseAdmin.from("players").select("id")
      playersCountBefore = playersData?.length || 0

      console.log(`📊 Dados antes da limpeza: ${recordsCountBefore} registros, ${playersCountBefore} jogadores`)
    } catch (countError) {
      console.warn("⚠️ Erro ao contar dados:", countError)
    }

    // 1. EXCLUIR TODOS OS REGISTROS (sem condições)
    console.log("🗑️ Excluindo TODOS os registros...")

    let recordsDeleted = 0
    try {
      // Método 1: Tentar excluir todos os registros de uma vez
      const { data: deletedRecords, error: recordsError } = await supabaseAdmin
        .from("records")
        .delete()
        .neq("id", "00000000-0000-0000-0000-000000000000") // Condição que sempre será verdadeira
        .select("id")

      if (recordsError) {
        console.warn("⚠️ Método 1 falhou, tentando método 2...")

        // Método 2: Buscar todos os IDs e excluir um por um
        const { data: allRecords } = await supabaseAdmin.from("records").select("id")

        if (allRecords && allRecords.length > 0) {
          for (const record of allRecords) {
            const { error: deleteError } = await supabaseAdmin.from("records").delete().eq("id", record.id)

            if (!deleteError) {
              recordsDeleted++
            }
          }
        }
      } else {
        recordsDeleted = deletedRecords?.length || 0
      }
    } catch (recordsDeleteError) {
      console.error("❌ Erro ao excluir registros:", recordsDeleteError)
    }

    // 2. EXCLUIR TODOS OS JOGADORES (sem condições)
    console.log("🗑️ Excluindo TODOS os jogadores...")

    let playersDeleted = 0
    try {
      // Método 1: Tentar excluir todos os jogadores de uma vez
      const { data: deletedPlayers, error: playersError } = await supabaseAdmin
        .from("players")
        .delete()
        .neq("id", "00000000-0000-0000-0000-000000000000") // Condição que sempre será verdadeira
        .select("id")

      if (playersError) {
        console.warn("⚠️ Método 1 falhou, tentando método 2...")

        // Método 2: Buscar todos os IDs e excluir um por um
        const { data: allPlayers } = await supabaseAdmin.from("players").select("id")

        if (allPlayers && allPlayers.length > 0) {
          for (const player of allPlayers) {
            const { error: deleteError } = await supabaseAdmin.from("players").delete().eq("id", player.id)

            if (!deleteError) {
              playersDeleted++
            }
          }
        }
      } else {
        playersDeleted = deletedPlayers?.length || 0
      }
    } catch (playersDeleteError) {
      console.error("❌ Erro ao excluir jogadores:", playersDeleteError)
    }

    // 3. Verificar se realmente foi tudo excluído
    console.log("🔍 Verificando limpeza...")

    const { data: remainingRecords } = await supabaseAdmin.from("records").select("id")
    const { data: remainingPlayers } = await supabaseAdmin.from("players").select("id")

    const recordsRemaining = remainingRecords?.length || 0
    const playersRemaining = remainingPlayers?.length || 0

    console.log(`✅ Limpeza concluída!`)
    console.log(`📊 Registros: ${recordsCountBefore} → ${recordsRemaining} (${recordsDeleted} excluídos)`)
    console.log(`👥 Jogadores: ${playersCountBefore} → ${playersRemaining} (${playersDeleted} excluídos)`)

    // 4. Se ainda restaram dados, tentar método mais agressivo
    if (recordsRemaining > 0 || playersRemaining > 0) {
      console.log("⚠️ Ainda restam dados, tentando limpeza mais agressiva...")

      try {
        // Usar SQL direto se possível
        await supabaseAdmin.rpc("delete_all_data")
      } catch (sqlError) {
        console.warn("SQL direto não disponível:", sqlError)
      }
    }

    const isCompletelyClean = recordsRemaining === 0 && playersRemaining === 0

    return NextResponse.json({
      success: true,
      message: isCompletelyClean
        ? "🎉 Todos os dados foram limpos com sucesso! O banco está completamente vazio."
        : `⚠️ Limpeza parcial: ${recordsDeleted} registros e ${playersDeleted} jogadores foram excluídos.`,
      stats: {
        before: {
          records: recordsCountBefore,
          players: playersCountBefore,
        },
        deleted: {
          records: recordsDeleted,
          players: playersDeleted,
        },
        remaining: {
          records: recordsRemaining,
          players: playersRemaining,
        },
        completelyClean: isCompletelyClean,
      },
    })
  } catch (error) {
    console.error("💥 Erro durante a limpeza de dados:", error)
    return NextResponse.json(
      {
        error: "Erro interno do servidor: " + (error instanceof Error ? error.message : String(error)),
        stack: error instanceof Error ? error.stack : undefined,
      },
      { status: 500 },
    )
  }
}
