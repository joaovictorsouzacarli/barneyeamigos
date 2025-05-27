import { NextResponse } from "next/server"

export async function GET() {
  try {
    console.log("🔍 Iniciando teste do Supabase...")

    // Verificar variáveis de ambiente primeiro
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    const envStatus = {
      NEXT_PUBLIC_SUPABASE_URL: !!supabaseUrl,
      NEXT_PUBLIC_SUPABASE_ANON_KEY: !!supabaseAnonKey,
      SUPABASE_SERVICE_ROLE_KEY: !!supabaseServiceKey,
    }

    console.log("📋 Status das variáveis:", envStatus)

    // Se não tiver as variáveis básicas, retornar erro de configuração
    if (!supabaseUrl || !supabaseAnonKey) {
      return NextResponse.json({
        success: false,
        error: "Variáveis de ambiente do Supabase não configuradas",
        envStatus,
        needsConfiguration: true,
        missingVars: [
          !supabaseUrl ? "NEXT_PUBLIC_SUPABASE_URL" : null,
          !supabaseAnonKey ? "NEXT_PUBLIC_SUPABASE_ANON_KEY" : null,
        ].filter(Boolean),
      })
    }

    // Tentar importar e usar o Supabase
    try {
      const { createClient } = await import("@supabase/supabase-js")

      // Criar cliente temporário para teste
      const testClient = createClient(supabaseUrl, supabaseServiceKey || supabaseAnonKey, {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        },
      })

      console.log("🔗 Cliente Supabase criado, testando conexão...")

      // Teste simples de conexão
      const { data, error } = await testClient.from("players").select("count").limit(1)

      if (error) {
        console.error("❌ Erro do Supabase:", error)

        return NextResponse.json({
          success: false,
          error: error.message,
          code: error.code,
          details: error.details,
          hint: error.hint,
          envStatus,
          needsSetup: error.code === "42P01", // Tabela não existe
          supabaseError: true,
        })
      }

      console.log("✅ Conexão com Supabase estabelecida")

      // Testar tabelas
      const tablesTest = {}

      // Testar players
      try {
        const { data: playersData, error: playersError } = await testClient.from("players").select("*").limit(3)

        tablesTest.players = {
          exists: !playersError,
          count: playersData?.length || 0,
          error: playersError?.message,
        }
      } catch (err) {
        tablesTest.players = {
          exists: false,
          count: 0,
          error: err instanceof Error ? err.message : "Erro desconhecido",
        }
      }

      // Testar records
      try {
        const { data: recordsData, error: recordsError } = await testClient.from("records").select("*").limit(3)

        tablesTest.records = {
          exists: !recordsError,
          count: recordsData?.length || 0,
          error: recordsError?.message,
        }
      } catch (err) {
        tablesTest.records = {
          exists: false,
          count: 0,
          error: err instanceof Error ? err.message : "Erro desconhecido",
        }
      }

      return NextResponse.json({
        success: true,
        message: "Conexão com Supabase estabelecida com sucesso!",
        timestamp: new Date().toISOString(),
        envStatus,
        tables: tablesTest,
        supabaseUrl: supabaseUrl.substring(0, 30) + "...", // Mostrar apenas parte da URL
      })
    } catch (supabaseError) {
      console.error("💥 Erro ao criar cliente Supabase:", supabaseError)

      return NextResponse.json({
        success: false,
        error:
          "Erro ao conectar com Supabase: " +
          (supabaseError instanceof Error ? supabaseError.message : String(supabaseError)),
        envStatus,
        supabaseError: true,
      })
    }
  } catch (error) {
    console.error("💥 Erro geral:", error)

    return NextResponse.json(
      {
        success: false,
        error: "Erro interno: " + (error instanceof Error ? error.message : String(error)),
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}
