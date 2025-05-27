"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"

async function getDiagnostico() {
  // Simulate loading time
  await new Promise((resolve) => setTimeout(resolve, 500))

  const res = await fetch("http://localhost:3000/api/diagnostico", {
    cache: "no-store",
  })

  if (!res.ok) {
    throw new Error("Failed to fetch data")
  }

  return res.json()
}

async function getRankings() {
  // Simulate loading time
  await new Promise((resolve) => setTimeout(resolve, 500))

  const res = await fetch("http://localhost:3000/api/rankings", {
    cache: "no-store",
  })

  if (!res.ok) {
    throw new Error("Failed to fetch data")
  }

  return res.json()
}

export default function DiagnosticoPage() {
  const [diagnostico, setDiagnostico] = useState<any>(null)
  const [rankings, setRankings] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [testandoRankings, setTestandoRankings] = useState(false)
  const [adicionandoTeste, setAdicionandoTeste] = useState(false)
  const [resultadoTeste, setResultadoTeste] = useState<any>(null)

  useEffect(() => {
    executarDiagnostico()
    buscarRankings()
  }, [])

  const executarDiagnostico = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const data = await getDiagnostico()
      setDiagnostico(data)
    } catch (err) {
      console.error("Erro:", err)
      setError(err instanceof Error ? err.message : "Erro desconhecido")
    } finally {
      setIsLoading(false)
    }
  }

  const buscarRankings = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const data = await getRankings()
      setRankings(data)
    } catch (err) {
      console.error("Erro:", err)
      setError(err instanceof Error ? err.message : "Erro desconhecido")
    } finally {
      setIsLoading(false)
    }
  }

  const testarRankings = async () => {
    setTestandoRankings(true)
    setError(null)
    try {
      const response = await fetch("/api/testar-rankings", {
        method: "POST",
      })
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Erro ao testar rankings")
      }

      // Atualizar diagnóstico e rankings
      executarDiagnostico()
      buscarRankings()
    } catch (err) {
      console.error("Erro:", err)
      setError(err instanceof Error ? err.message : "Erro desconhecido")
    } finally {
      setTestandoRankings(false)
    }
  }

  const adicionarTeste = async () => {
    setAdicionandoTeste(true)
    setResultadoTeste(null)

    try {
      const response = await fetch("/api/adicionar-teste", {
        method: "POST",
      })
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Erro ao adicionar teste")
      }

      setResultadoTeste(data)
      // Atualizar diagnóstico e rankings
      executarDiagnostico()
      buscarRankings()
    } catch (err) {
      console.error("Erro:", err)
      setError(err instanceof Error ? err.message : "Erro desconhecido")
    } finally {
      setAdicionandoTeste(false)
    }
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Diagnóstico</h1>

      <div className="flex space-x-4 mb-4">
        <Button onClick={executarDiagnostico} disabled={isLoading}>
          {isLoading ? "Carregando..." : "Executar Diagnóstico"}
        </Button>
        <Button
          onClick={testarRankings}
          className="bg-blue-600 text-white hover:bg-blue-700"
          disabled={testandoRankings}
        >
          {testandoRankings ? "Testando..." : "Testar Rankings"}
        </Button>
        <Button
          onClick={adicionarTeste}
          className="bg-green-600 text-white hover:bg-green-700"
          disabled={adicionandoTeste}
        >
          {adicionandoTeste ? "Adicionando..." : "Adicionar Teste"}
        </Button>
      </div>

      {error && <div className="bg-red-200 text-red-800 p-3 rounded-md mb-4">Erro: {error}</div>}

      {resultadoTeste && (
        <div className="p-4 bg-green-900/20 border border-green-600/50 rounded-md">
          <h3 className="font-bold mb-2">Teste adicionado com sucesso:</h3>
          <div>
            Jogador: <span className="font-bold">{resultadoTeste.player.name}</span>
          </div>
          <div>
            DPS: <span className="font-bold">{resultadoTeste.records.dps.value.toLocaleString()}</span>
          </div>
          <div>
            HPS: <span className="font-bold">{resultadoTeste.records.hps.value.toLocaleString()}</span>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Informações do Personagem</CardTitle>
            <CardDescription>Dados sobre o seu personagem no jogo.</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-4 w-[200px]" />
            ) : diagnostico ? (
              <>
                <p>
                  <strong>Nome:</strong> {diagnostico.character.name}
                </p>
                <p>
                  <strong>Classe:</strong> {diagnostico.character.class}
                </p>
                <p>
                  <strong>Nível:</strong> {diagnostico.character.level}
                </p>
              </>
            ) : (
              <p>Nenhum dado disponível.</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Estatísticas de Combate</CardTitle>
            <CardDescription>Métricas importantes do seu desempenho em combate.</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <>
                <Skeleton className="h-4 w-[200px] mb-2" />
                <Skeleton className="h-4 w-[150px]" />
              </>
            ) : diagnostico ? (
              <>
                <p>
                  <strong>Dano por Segundo (DPS):</strong> {diagnostico.records.dps.value.toLocaleString()}
                </p>
                <p>
                  <strong>Cura por Segundo (HPS):</strong> {diagnostico.records.hps.value.toLocaleString()}
                </p>
              </>
            ) : (
              <p>Nenhum dado disponível.</p>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="mt-8">
        <h2 className="text-xl font-bold mb-4">Rankings</h2>
        <Separator className="mb-4" />
        {isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-4 w-[250px]" />
            <Skeleton className="h-4 w-[200px]" />
            <Skeleton className="h-4 w-[150px]" />
          </div>
        ) : rankings ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Top DPS</CardTitle>
                <CardDescription>Os jogadores com o maior dano por segundo.</CardDescription>
              </CardHeader>
              <CardContent>
                <ol className="list-decimal list-inside">
                  {rankings.dps.map((player: any) => (
                    <li key={player.id} className="mb-1">
                      {player.name} - {player.value.toLocaleString()}{" "}
                      <Badge variant="secondary">
                        {player.percentageChange > 0 ? "+" : ""}
                        {player.percentageChange.toFixed(2)}%
                      </Badge>
                    </li>
                  ))}
                </ol>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Top HPS</CardTitle>
                <CardDescription>Os jogadores com a maior cura por segundo.</CardDescription>
              </CardHeader>
              <CardContent>
                <ol className="list-decimal list-inside">
                  {rankings.hps.map((player: any) => (
                    <li key={player.id} className="mb-1">
                      {player.name} - {player.value.toLocaleString()}{" "}
                      <Badge variant="secondary">
                        {player.percentageChange > 0 ? "+" : ""}
                        {player.percentageChange.toFixed(2)}%
                      </Badge>
                    </li>
                  ))}
                </ol>
              </CardContent>
            </Card>
          </div>
        ) : (
          <p>Nenhum ranking disponível.</p>
        )}
      </div>
    </div>
  )
}
