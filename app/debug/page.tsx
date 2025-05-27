"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { supabase } from "@/lib/supabase"

export default function DebugPage() {
  const [dbStatus, setDbStatus] = useState<"loading" | "connected" | "error">("loading")
  const [recordsCount, setRecordsCount] = useState<number | null>(null)
  const [playersCount, setPlayersCount] = useState<number | null>(null)
  const [latestRecords, setLatestRecords] = useState<any[]>([])
  const [error, setError] = useState<string | null>(null)

  const checkDatabase = async () => {
    setDbStatus("loading")
    setError(null)

    try {
      // Verificar conexão com o Supabase
      const { data: healthCheck, error: healthError } = await supabase.from("players").select("count")

      if (healthError) {
        throw healthError
      }

      // Contar jogadores
      const { data: players, error: playersError } = await supabase.from("players").select("count")

      if (playersError) {
        throw playersError
      }

      setPlayersCount(players[0].count)

      // Contar registros
      const { data: records, error: recordsError } = await supabase.from("records").select("count")

      if (recordsError) {
        throw recordsError
      }

      setRecordsCount(records[0].count)

      // Buscar últimos registros
      const { data: latestRecs, error: latestError } = await supabase
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
        .order("created_at", { ascending: false })
        .limit(5)

      if (latestError) {
        throw latestError
      }

      setLatestRecords(latestRecs)
      setDbStatus("connected")
    } catch (err) {
      console.error("Erro de diagnóstico:", err)
      setDbStatus("error")
      setError(err instanceof Error ? err.message : "Erro desconhecido")
    }
  }

  useEffect(() => {
    checkDatabase()
  }, [])

  return (
    <div className="min-h-screen bg-black text-[#00c8ff] p-4">
      <div className="container mx-auto max-w-4xl">
        <h1 className="text-3xl font-bold mb-6">Página de Diagnóstico</h1>

        <Card className="border-blue-900/50 bg-black/50 backdrop-blur-sm mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">Status da Conexão com o Banco de Dados</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div
                  className={`w-4 h-4 rounded-full ${
                    dbStatus === "connected" ? "bg-green-500" : dbStatus === "error" ? "bg-red-500" : "bg-yellow-500"
                  }`}
                />
                <span>
                  {dbStatus === "connected"
                    ? "Conectado ao Supabase"
                    : dbStatus === "error"
                      ? "Erro na conexão"
                      : "Verificando conexão..."}
                </span>
              </div>

              {error && (
                <div className="p-4 bg-red-900/20 border border-red-900/50 rounded-md text-red-400">{error}</div>
              )}

              {dbStatus === "connected" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-blue-900/20 border border-blue-900/50 rounded-md">
                    <div className="text-2xl font-bold">{playersCount}</div>
                    <div className="text-sm text-[#00c8ff]/70">Jogadores cadastrados</div>
                  </div>
                  <div className="p-4 bg-blue-900/20 border border-blue-900/50 rounded-md">
                    <div className="text-2xl font-bold">{recordsCount}</div>
                    <div className="text-sm text-[#00c8ff]/70">Registros de DPS/HPS</div>
                  </div>
                </div>
              )}

              <Button onClick={checkDatabase} className="bg-[#00c8ff] text-black hover:bg-[#00c8ff]/80">
                Verificar Novamente
              </Button>
            </div>
          </CardContent>
        </Card>

        {latestRecords.length > 0 && (
          <Card className="border-blue-900/50 bg-black/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle>Últimos Registros</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b border-blue-900/50">
                      <th className="text-left p-2">Jogador</th>
                      <th className="text-left p-2">Classe</th>
                      <th className="text-left p-2">Tipo</th>
                      <th className="text-right p-2">Valor</th>
                      <th className="text-right p-2">Data</th>
                    </tr>
                  </thead>
                  <tbody>
                    {latestRecords.map((record) => (
                      <tr key={record.id} className="border-b border-blue-900/30">
                        <td className="p-2">{record.players?.name || "Desconhecido"}</td>
                        <td className="p-2">{record.class}</td>
                        <td className="p-2">{record.type.toUpperCase()}</td>
                        <td className="p-2 text-right">{record.value.toLocaleString()}</td>
                        <td className="p-2 text-right">{new Date(record.created_at).toLocaleString("pt-BR")}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
