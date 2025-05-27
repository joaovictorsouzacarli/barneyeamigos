import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const monthFilter = searchParams.get("month") || null
    const yearFilter = searchParams.get("year") || null

    console.log(`Buscando ranking de participação${monthFilter ? ` do mês ${monthFilter}/${yearFilter}` : ""}`)

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

    // Construir a consulta base para buscar todos os registros
    let query = supabaseAdmin.from("records").select(`
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

    // Aplicar filtro de mês/ano se fornecido
    if (monthFilter && yearFilter && monthFilter !== "all" && yearFilter !== "all") {
      const month = Number.parseInt(monthFilter)
      const year = Number.parseInt(yearFilter)

      if (!isNaN(month) && !isNaN(year) && month >= 1 && month <= 12) {
        console.log(`Aplicando filtro para mês: ${month}/${year}`)

        // Criar datas de início e fim do mês com fuso horário UTC
        const startDate = new Date(Date.UTC(year, month - 1, 1, 0, 0, 0, 0)).toISOString()

        // Último dia do mês (usando o primeiro dia do próximo mês e subtraindo 1 milissegundo)
        const endDate = new Date(Date.UTC(year, month, 0, 23, 59, 59, 999)).toISOString()

        console.log(`Período: ${startDate} até ${endDate}`)

        // Filtrar por período
        query = query.gte("created_at", startDate).lte("created_at", endDate)
      }
    }

    // Executar a consulta
    const { data: records, error } = await query.order("created_at", { ascending: false })

    if (error) {
      console.error("Erro ao buscar registros:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    console.log(`Encontrados ${records?.length || 0} registros brutos`)

    // Se não houver registros, retornar array vazio
    if (!records || records.length === 0) {
      console.log("Nenhum registro encontrado")
      return NextResponse.json([])
    }

    // Agrupar registros por jogador para contar participações
    const playerMap = new Map()

    records.forEach((record) => {
      if (!record.player_id || !record.players) return

      const playerId = record.player_id
      const playerName = record.players.name

      if (!playerMap.has(playerId)) {
        playerMap.set(playerId, {
          id: playerId,
          name: playerName,
          participacoes: 1,
          classes: new Set([record.class]),
          ultimaParticipacao: record.created_at,
        })
      } else {
        const player = playerMap.get(playerId)
        player.participacoes += 1
        player.classes.add(record.class)

        // Atualizar a data da última participação se for mais recente
        if (new Date(record.created_at) > new Date(player.ultimaParticipacao)) {
          player.ultimaParticipacao = record.created_at
        }
      }
    })

    // Converter o mapa para um array e processar os dados
    const participacaoRanking = Array.from(playerMap.values()).map((player) => ({
      id: player.id,
      name: player.name,
      participacoes: player.participacoes,
      classesUtilizadas: Array.from(player.classes),
      numeroClasses: player.classes.size,
      ultimaParticipacao: player.ultimaParticipacao,
    }))

    // Ordenar por número de participações (maior para menor)
    participacaoRanking.sort((a, b) => b.participacoes - a.participacoes)

    console.log(`Retornando ${participacaoRanking.length} jogadores no ranking de participação`)
    return NextResponse.json(participacaoRanking)
  } catch (error) {
    console.error("Erro ao buscar ranking de participação:", error)
    return NextResponse.json(
      {
        error: "Erro interno do servidor: " + (error instanceof Error ? error.message : String(error)),
        stack: error instanceof Error ? error.stack : undefined,
      },
      { status: 500 },
    )
  }
}
