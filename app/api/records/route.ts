import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { playerName, class: className, value, type } = body

    console.log("Recebendo requisição para adicionar registro:", body)

    if (!playerName || !className || !value || !type) {
      console.error("Dados incompletos:", body)
      return NextResponse.json({ error: "Dados incompletos. Todos os campos são obrigatórios." }, { status: 400 })
    }

    // Verificar se o jogador já existe
    console.log("Verificando se o jogador existe:", playerName)
    let { data: player, error: playerError } = await supabase
      .from("players")
      .select("*")
      .eq("name", playerName)
      .single()

    // Se não existir, criar um novo jogador
    if (playerError) {
      console.log("Jogador não encontrado, criando novo jogador:", playerName)
      const { data: newPlayer, error: createError } = await supabase
        .from("players")
        .insert({ name: playerName })
        .select()
        .single()

      if (createError) {
        console.error("Erro ao criar jogador:", createError)
        return NextResponse.json({ error: `Erro ao criar jogador: ${createError.message}` }, { status: 500 })
      }

      player = newPlayer
      console.log("Jogador criado com sucesso:", player)
    } else {
      console.log("Jogador encontrado:", player)
    }

    // Criar o registro
    console.log("Criando registro para o jogador:", {
      player_id: player.id,
      class: className,
      value: Number.parseInt(value),
      type,
    })

    const { data: record, error: recordError } = await supabase
      .from("records")
      .insert({
        player_id: player.id,
        class: className,
        value: Number.parseInt(value),
        type,
      })
      .select()
      .single()

    if (recordError) {
      console.error("Erro ao criar registro:", recordError)
      return NextResponse.json({ error: `Erro ao criar registro: ${recordError.message}` }, { status: 500 })
    }

    console.log("Registro criado com sucesso:", record)
    return NextResponse.json(record)
  } catch (error) {
    console.error("Erro ao adicionar registro:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}

