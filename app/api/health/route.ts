import { NextResponse } from "next/server"

export async function GET() {
  try {
    // Verificação básica de saúde da aplicação
    const timestamp = new Date().toISOString()

    // Verificar variáveis de ambiente
    const envCheck = {
      NEXT_PUBLIC_SUPABASE_URL: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      NEXT_PUBLIC_SUPABASE_ANON_KEY: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      SUPABASE_SERVICE_ROLE_KEY: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
    }

    const allEnvConfigured = Object.values(envCheck).every(Boolean)

    return NextResponse.json({
      status: "ok",
      timestamp,
      environment: {
        variables: envCheck,
        allConfigured: allEnvConfigured,
        nodeVersion: process.version,
        platform: process.platform,
      },
      api: {
        working: true,
        route: "/api/health",
      },
    })
  } catch (error) {
    return NextResponse.json(
      {
        status: "error",
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : "Erro desconhecido",
        api: {
          working: false,
          route: "/api/health",
        },
      },
      { status: 500 },
    )
  }
}
