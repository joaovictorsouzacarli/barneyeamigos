import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"
import type { PlayerDetails, Record } from "@/types"

export async function GET(request: Request, { params }: { params: { name: string } }) {
  try {
    const playerName = decodeURIComponent(params.name)

    // Buscar o jogador pelo nome
    const { data: player, error: playerError } = await supabase
      .from("players")
      .select("*")
      .eq("name", playerName)
      .single()

    if (playerError || !player) {
      return NextResponse.json({ error: "Jogador não encontrado" }, { status: 404 })
    }

    // Buscar todos os registros do jogador
    const { data: records, error: recordsError } = await supabase
      .from("records")
      .select("*")
      .eq("player_id", player.id)
      .order("created_at", { ascending: false })

    if (recordsError) {
      throw recordsError
    }

    const formattedRecords = records as Record[]

    // Agrupar registros por classe e tipo
    const classSummary = formattedRecords.reduce(
      (acc, record) => {
        const key = `${record.class}-${record.type}`

        if (!acc[key]) {
          acc[key] = {
            class: record.class,
            type: record.type,
            records: [],
            highestValue: 0,
            totalValue: 0,
            count: 0,
          }
        }

        acc[key].records.push({
          id: record.id,
          value: record.value,
          date: record.created_at,
        })

        acc[key].totalValue += record.value
        acc[key].count += 1

        if (record.value > acc[key].highestValue) {
          acc[key].highestValue = record.value
        }

        return acc
      },
      {} as Record<string, any>,
    )

    // Converter para array e calcular médias
    const classSummaryArray = Object.values(classSummary).map((summary) => ({
      ...summary,
      averageValue: Math.round(summary.totalValue / summary.count),
    }))

    // Ordenar por tipo (dps/hps) e depois por valor mais alto
    classSummaryArray.sort((a, b) => {
      if (a.type !== b.type) {
        return a.type === "dps" ? -1 : 1
      }
      return b.highestValue - a.highestValue
    })

    const playerDetails: PlayerDetails = {
      player: {
        id: player.id,
        name: player.name,
      },
      classSummary: classSummaryArray,
      allRecords: formattedRecords,
    }

    return NextResponse.json(playerDetails)
  } catch (error) {
    console.error("Erro ao buscar detalhes do jogador:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}

