// Configuração do cliente Supabase

import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ""

// Verificar se as variáveis de ambiente estão configuradas
if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Variáveis de ambiente do Supabase não configuradas!")
  console.log("NEXT_PUBLIC_SUPABASE_URL:", supabaseUrl ? "Configurado" : "Não configurado")
  console.log("NEXT_PUBLIC_SUPABASE_ANON_KEY:", supabaseAnonKey ? "Configurado" : "Não configurado")
  console.log(
    "SUPABASE_SERVICE_ROLE_KEY:",
    supabaseServiceKey ? "Configurado" : "Não configurado (necessário para operações administrativas)",
  )
}

// Verificar se as URLs e chaves parecem válidas
if (supabaseUrl && !supabaseUrl.startsWith("http://") && !supabaseUrl.startsWith("https://")) {
  console.error("NEXT_PUBLIC_SUPABASE_URL não parece ser uma URL válida:", supabaseUrl)
}

if (supabaseAnonKey && supabaseAnonKey.length < 10) {
  console.error("NEXT_PUBLIC_SUPABASE_ANON_KEY parece ser muito curta ou inválida")
}

if (supabaseServiceKey && supabaseServiceKey.length < 10) {
  console.error("SUPABASE_SERVICE_ROLE_KEY parece ser muito curta ou inválida")
}

// Criar clientes com tratamento de erro
let supabase
let supabaseAdmin

try {
  // Cliente anônimo (para uso no cliente)
  supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
  })
  console.log("Cliente Supabase anônimo criado com sucesso")
} catch (error) {
  console.error("Erro ao criar cliente Supabase anônimo:", error)
  // Criar um cliente vazio para evitar erros de undefined
  supabase = {
    from: () => {
      console.error("Cliente Supabase não inicializado corretamente")
      return {
        select: () => Promise.resolve({ data: null, error: new Error("Cliente Supabase não inicializado") }),
        insert: () => Promise.resolve({ data: null, error: new Error("Cliente Supabase não inicializado") }),
        update: () => Promise.resolve({ data: null, error: new Error("Cliente Supabase não inicializado") }),
        delete: () => Promise.resolve({ data: null, error: new Error("Cliente Supabase não inicializado") }),
      }
    },
  } as any
}

try {
  // Cliente de serviço (para uso no servidor, ignora RLS)
  if (supabaseServiceKey) {
    supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: true,
      },
    })
    console.log("Cliente Supabase Admin criado com sucesso")
  } else {
    console.warn("SUPABASE_SERVICE_ROLE_KEY não configurada, usando cliente anônimo como fallback")
    supabaseAdmin = supabase
  }
} catch (error) {
  console.error("Erro ao criar cliente Supabase Admin:", error)
  // Usar o cliente anônimo como fallback
  supabaseAdmin = supabase
}

export { supabase, supabaseAdmin }
