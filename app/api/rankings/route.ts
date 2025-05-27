import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get("type") || "dps"
    const classFilter = searchParams.get("class") || null
    const monthFilter = searchParams.get("month") || null
    const yearFilter = searchParams.get("year") || null

    console.log(
      `Buscando rankings de ${type}${classFilter ? ` para a classe ${classFilter}` : ""}${
        monthFilter ? ` do mês ${monthFilter}/${yearFilter}` : ""
      }`,
    )

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

    // Construir a consulta base
    let query = supabaseAdmin
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
      .eq("type", type)

    // Aplicar filtro de classe se fornecido
    if (classFilter && classFilter !== "all") {
      console.log(`Aplicando filtro para classe: ${classFilter}`)
      query = query.eq("class", classFilter)
    }

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
    const { data: records, error } = await query.order("value", { ascending: false })

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

    // Verificar a estrutura dos registros para depuração
    console.log("Exemplo de registro:", JSON.stringify(records[0], null, 2))

    // Transformar os registros em um formato mais simples para o frontend
    const processedRecords = records
      .map((record) => {
        // Verificar se o registro tem as propriedades necessárias
        if (!record.player_id) {
          console.log("Registro sem player_id:", record)
          return null
        }

        // Verificar se o jogador existe
        if (!record.players) {
          console.log("Registro sem jogador associado:", record)
          return {
            id: record.id,
            playerId: record.player_id,
            name: "Jogador Desconhecido",
            class: record.class,
            value: record.value,
            date: record.created_at,
            entries: 1,
            averageValue: record.value,
          }
        }

        return {
          id: record.id,
          playerId: record.player_id,
          name: record.players.name,
          class: record.class,
          value: record.value,
          date: record.created_at,
          entries: 1,
          averageValue: record.value,
        }
      })
      .filter(Boolean) // Remover itens nulos

    // Agrupar por jogador e classe para calcular médias e encontrar valores máximos
    const playerClassMap = new Map()

    processedRecords.forEach((record) => {
      const key = `${record.playerId}_${record.class}`

      if (!playerClassMap.has(key)) {
        playerClassMap.set(key, {
          ...record,
          entries: 1,
          totalValue: record.value,
          averageValue: record.value,
        })
      } else {
        const existing = playerClassMap.get(key)
        existing.entries += 1
        existing.totalValue += record.value
        existing.averageValue = Math.round(existing.totalValue / existing.entries)

        // Atualizar o valor máximo se o registro atual for maior
        if (record.value > existing.value) {
          existing.value = record.value
          existing.id = record.id
          existing.date = record.date
        }
      }
    })

    // Converter o mapa de volta para um array
    const finalRankings = Array.from(playerClassMap.values())

    // Ordenar por valor (maior para menor)
    finalRankings.sort((a, b) => b.value - a.value)

    console.log(`Retornando ${finalRankings.length} registros de ranking processados`)
    return NextResponse.json(finalRankings)
  } catch (error) {
    console.error("Erro ao buscar rankings:", error)
    return NextResponse.json(
      {
        error: "Erro interno do servidor: " + (error instanceof Error ? error.message : String(error)),
        stack: error instanceof Error ? error.stack : undefined,
      },
      { status: 500 },
    )
  }
}
