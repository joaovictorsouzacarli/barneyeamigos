import { NextResponse } from "next/server"
import { supabase, supabaseAdmin } from "@/lib/supabase"

export async function GET() {
  try {
    console.log("Testando conexão com o Supabase...")

    // Verificar variáveis de ambiente
    const envStatus = {
      NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL ? "Configurado" : "Não configurado",
      NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? "Configurado" : "Não configurado",
      SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY ? "Configurado" : "Não configurado",
    }

    // Testar cliente anônimo
    let anonStatus = "Erro"
    let anonError = null
    try {
      const { data: anonData, error: anonTestError } = await supabase.from("players").select("count")

      if (anonTestError) {
        anonStatus = "Erro"
        anonError = anonTestError.message
      } else {
        anonStatus = "Conectado"
      }
    } catch (error) {
      anonStatus = "Exceção"
      anonError = error instanceof Error ? error.message : "Erro desconhecido"
    }

    // Testar cliente admin
    let adminStatus = "Erro"
    let adminError = null
    try {
      const { data: adminData, error: adminTestError } = await supabaseAdmin.from("players").select("count")

      if (adminTestError) {
        adminStatus = "Erro"
        adminError = adminTestError.message
      } else {
        adminStatus = "Conectado"
      }
    } catch (error) {
      adminStatus = "Exceção"
      adminError = error instanceof Error ? error.message : "Erro desconhecido"
    }

    return NextResponse.json({
      timestamp: new Date().toISOString(),
      environment: envStatus,
      clients: {
        anon: {
          status: anonStatus,
          error: anonError,
        },
        admin: {
          status: adminStatus,
          error: adminError,
        },
      },
    })
  } catch (error) {
    console.error("Erro ao testar conexão:", error)
    return NextResponse.json(
      {
        error: "Erro ao testar conexão",
        details: error instanceof Error ? error.message : "Erro desconhecido",
      },
      { status: 500 },
    )
  }
}
