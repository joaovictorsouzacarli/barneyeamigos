import { NextResponse } from "next/server"

export async function GET() {
  try {
    // Coletar variáveis de ambiente relacionadas ao Supabase
    const envVars = {
      NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL || "",
      NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "",
      SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY ? "Configurado" : "",
    }

    return NextResponse.json(envVars)
  } catch (error) {
    console.error("Erro ao verificar variáveis de ambiente:", error)
    return NextResponse.json({ error: "Erro ao verificar variáveis de ambiente" }, { status: 500 })
  }
}
