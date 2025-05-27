import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase"

export async function GET() {
  try {
    console.log("🔍 Iniciando teste de conexão com o Supabase...")

    // Verificar variáveis de ambiente primeiro
    const envStatus = {
      NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL ? "Configurado" : "Não configurado",
      NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? "Configurado" : "Não configurado",
      SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY ? "Configurado" : "Não configurado",
    }

    console.log("📋 Status das variáveis de ambiente:", envStatus)

    // Verificar se as variáveis essenciais estão configuradas
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      return NextResponse.json({
        success: false,
        error: "Variáveis de ambiente do Supabase não configuradas",
        envStatus,
        needsConfiguration: true,
        missingVars: [
          !process.env.NEXT_PUBLIC_SUPABASE_URL ? "NEXT_PUBLIC_SUPABASE_URL" : null,
          !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? "NEXT_PUBLIC_SUPABASE_ANON_KEY" : null,
        ].filter(Boolean),
      })
    }

    // Testar conexão básica com timeout
    console.log("🔗 Testando conexão básica...")

    const connectionPromise = supabaseAdmin.from("players").select("count")
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error("Timeout: Conexão demorou mais de 10 segundos")), 10000),
    )

    const { data: connectionTest, error: connectionError } = (await Promise.race([
      connectionPromise,
      timeoutPromise,
    ])) as any

    if (connectionError) {
      console.error("❌ Erro de conexão:", connectionError)

      return NextResponse.json({
        success: false,
        error: connectionError.message,
        code: connectionError.code,
        details: connectionError.details,
        hint: connectionError.hint,
        envStatus,
        needsSetup: connectionError.code === "42P01", // Tabela não existe
        supabaseError: true,
      })
    }

    console.log("✅ Conexão básica estabelecida")

    // Testar tabelas individualmente
    console.log("🗃️ Testando tabelas...")

    const tablesStatus = {}

    // Testar tabela players
    try {
      const { data: playersData, error: playersError } = await supabaseAdmin.from("players").select("*").limit(5)

      tablesStatus.players = {
        exists: !playersError,
        count: playersData?.length || 0,
        error: playersError?.message,
        sample: playersData?.slice(0, 2) || [],
      }
    } catch (err) {
      tablesStatus.players = {
        exists: false,
        count: 0,
        error: err instanceof Error ? err.message : "Erro desconhecido",
        sample: [],
      }
    }

    // Testar tabela records
    try {
      const { data: recordsData, error: recordsError } = await supabaseAdmin.from("records").select("*").limit(5)

      tablesStatus.records = {
        exists: !recordsError,
        count: recordsData?.length || 0,
        error: recordsError?.message,
        sample: recordsData?.slice(0, 2) || [],
      }
    } catch (err) {
      tablesStatus.records = {
        exists: false,
        count: 0,
        error: err instanceof Error ? err.message : "Erro desconhecido",
        sample: [],
      }
    }

    console.log("📊 Status das tabelas:", tablesStatus)

    return NextResponse.json({
      success: true,
      message: "Conexão estabelecida com sucesso!",
      timestamp: new Date().toISOString(),
      envStatus,
      tables: tablesStatus,
      connectionTest: {
        status: "ok",
        latency: "< 10s",
      },
    })
  } catch (error) {
    console.error("💥 Erro geral no teste de conexão:", error)

    return NextResponse.json(
      {
        success: false,
        error: "Erro interno: " + (error instanceof Error ? error.message : String(error)),
        stack: error instanceof Error ? error.stack : undefined,
        timestamp: new Date().toISOString(),
        envStatus: {
          NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL ? "Configurado" : "Não configurado",
          NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? "Configurado" : "Não configurado",
          SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY ? "Configurado" : "Não configurado",
        },
      },
      { status: 500 },
    )
  }
}
