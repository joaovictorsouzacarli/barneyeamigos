"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AlertCircle, CheckCircle } from "lucide-react"

export default function VerificarEnvPage() {
  const [envVars, setEnvVars] = useState<{ [key: string]: string }>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function checkEnv() {
      try {
        const response = await fetch("/api/verificar-env")
        const data = await response.json()
        setEnvVars(data)
      } catch (error) {
        console.error("Erro ao verificar variáveis de ambiente:", error)
      } finally {
        setLoading(false)
      }
    }

    checkEnv()
  }, [])

  // Função para mascarar valores sensíveis
  const maskValue = (value: string) => {
    if (!value) return "Não configurado"
    if (value.length <= 8) return "***" + value.slice(-2)
    return value.slice(0, 3) + "..." + value.slice(-3)
  }

  // Função para verificar se uma variável parece válida
  const isValidValue = (key: string, value: string) => {
    if (!value) return false

    if (key.includes("URL")) {
      return value.startsWith("http://") || value.startsWith("https://")
    }

    if (key.includes("KEY")) {
      return value.length > 10
    }

    return true
  }

  return (
    <div className="min-h-screen bg-black text-[#00c8ff]">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Verificação de Variáveis de Ambiente</h1>

        <Card className="border-blue-900/50 bg-black/50 backdrop-blur-sm mb-6">
          <CardHeader>
            <CardTitle>Variáveis de Ambiente do Supabase</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p>Carregando...</p>
            ) : (
              <div className="space-y-4">
                {Object.entries(envVars).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between p-3 border border-blue-900/30 rounded-md">
                    <div>
                      <span className="font-mono">{key}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {isValidValue(key, value) ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : (
                        <AlertCircle className="h-4 w-4 text-red-500" />
                      )}
                      <span className="font-mono">{maskValue(value)}</span>
                    </div>
                  </div>
                ))}

                <div className="mt-6 p-4 bg-blue-900/20 border border-blue-900/50 rounded-md">
                  <h3 className="font-bold mb-2">Instruções:</h3>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Certifique-se de que todas as variáveis de ambiente estão configuradas no Vercel</li>
                    <li>NEXT_PUBLIC_SUPABASE_URL deve ser a URL completa do seu projeto Supabase</li>
                    <li>NEXT_PUBLIC_SUPABASE_ANON_KEY deve ser a chave anônima (pública) do Supabase</li>
                    <li>SUPABASE_SERVICE_ROLE_KEY deve ser a chave de serviço (privada) do Supabase</li>
                    <li>Após configurar as variáveis, reimplante o projeto no Vercel</li>
                  </ul>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="flex justify-center">
          <Button
            onClick={() => (window.location.href = "/diagnostico-supabase")}
            className="bg-[#00c8ff] text-black hover:bg-[#00c8ff]/80"
          >
            Voltar para Diagnóstico
          </Button>
        </div>
      </div>
    </div>
  )
}
