"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Trophy, Info, Bug, Calendar, X, Award, Users, Clock } from "lucide-react"
import { PlayerDetailsDialog } from "@/components/player-details-dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export function ParticipacaoRanking() {
  const [players, setPlayers] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedPlayer, setSelectedPlayer] = useState(null)
  const [detailsOpen, setDetailsOpen] = useState(false)
  const [debugInfo, setDebugInfo] = useState(null)
  const [showDebug, setShowDebug] = useState(false)
  const [monthFilter, setMonthFilter] = useState(null)
  const [yearFilter, setYearFilter] = useState(null)

  // Gerar anos (atual e 2 anos anteriores)
  const currentYear = new Date().getFullYear()
  const years = [currentYear, currentYear - 1, currentYear - 2]

  // Lista de meses
  const months = [
    { value: "1", label: "Janeiro" },
    { value: "2", label: "Fevereiro" },
    { value: "3", label: "Março" },
    { value: "4", label: "Abril" },
    { value: "5", label: "Maio" },
    { value: "6", label: "Junho" },
    { value: "7", label: "Julho" },
    { value: "8", label: "Agosto" },
    { value: "9", label: "Setembro" },
    { value: "10", label: "Outubro" },
    { value: "11", label: "Novembro" },
    { value: "12", label: "Dezembro" },
  ]

  // Função para buscar os rankings com base no filtro de mês
  const fetchRankings = async () => {
    setLoading(true)
    setDebugInfo(null)

    try {
      // Construir a URL com os parâmetros de filtro
      let url = "/api/participacao"
      if (monthFilter && yearFilter) {
        url += `?month=${encodeURIComponent(monthFilter)}&year=${encodeURIComponent(yearFilter)}`
      }

      console.log("Buscando ranking de participação:", url)

      const response = await fetch(url, {
        cache: "no-store", // Importante: não usar cache para sempre obter dados atualizados
      })

      const responseText = await response.text() // Obter o texto bruto da resposta

      let data
      try {
        data = JSON.parse(responseText)
      } catch (parseError) {
        console.error("Erro ao analisar resposta JSON:", parseError)
        console.log("Resposta bruta:", responseText)
        throw new Error("Resposta inválida do servidor")
      }

      console.log("Dados recebidos:", data)
      setDebugInfo({
        url,
        status: response.status,
        data: data,
        responseText: responseText.length > 1000 ? responseText.substring(0, 1000) + "..." : responseText,
      })

      if (!response.ok) {
        throw new Error(data.error || "Erro ao buscar ranking de participação")
      }

      if (!Array.isArray(data)) {
        console.error("Resposta não é um array:", data)
        throw new Error("Formato de resposta inválido")
      }

      setPlayers(data)
    } catch (error) {
      console.error("Erro:", error)
      setDebugInfo((prev) => ({
        ...prev,
        error: error instanceof Error ? error.message : "Erro desconhecido",
      }))
    } finally {
      setLoading(false)
    }
  }

  // Efeito para buscar rankings quando o componente é montado ou o filtro muda
  useEffect(() => {
    fetchRankings()
  }, [monthFilter, yearFilter])

  const handleOpenDetails = (playerName) => {
    setSelectedPlayer(playerName)
    setDetailsOpen(true)
  }

  const handleMonthChange = (value) => {
    setMonthFilter(value === "all" ? null : value)
  }

  const handleYearChange = (value) => {
    setYearFilter(value === "all" ? null : value)
  }

  const clearMonthFilter = () => {
    setMonthFilter(null)
    setYearFilter(null)
  }

  const toggleDebug = () => {
    setShowDebug((prev) => !prev)
  }

  // Formatar data
  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    })
  }

  // Determinar se o primeiro jogador é o destaque do mês
  const hasMonthlyHighlight = monthFilter && yearFilter && players.length > 0

  return (
    <>
      <Card className="border-blue-900/50 bg-black/50 backdrop-blur-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-2xl flex items-center gap-2">
            <Users className="h-6 w-6 text-[#00c8ff]" />
            Ranking de Participação
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 rounded-full hover:bg-[#00c8ff]/10"
              onClick={toggleDebug}
            >
              <Bug className="h-4 w-4" />
              <span className="sr-only">Debug</span>
            </Button>
          </CardTitle>

          <div className="mt-4">
            {/* Filtro de Mês */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="h-4 w-4 text-[#00c8ff]/70" />
                <span className="text-sm text-[#00c8ff]/70">Filtrar por Mês:</span>
              </div>
              <div className="flex gap-2">
                <div className="grid grid-cols-2 gap-2 flex-1">
                  <Select value={monthFilter || "all"} onValueChange={handleMonthChange}>
                    <SelectTrigger className="bg-black/50 border-blue-900/50">
                      <SelectValue placeholder="Mês" />
                    </SelectTrigger>
                    <SelectContent className="bg-black border-blue-900/50">
                      <SelectItem value="all">Todos os meses</SelectItem>
                      {months.map((month) => (
                        <SelectItem key={month.value} value={month.value}>
                          {month.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select value={yearFilter || "all"} onValueChange={handleYearChange}>
                    <SelectTrigger className="bg-black/50 border-blue-900/50">
                      <SelectValue placeholder="Ano" />
                    </SelectTrigger>
                    <SelectContent className="bg-black border-blue-900/50">
                      <SelectItem value="all">Todos os anos</SelectItem>
                      {years.map((year) => (
                        <SelectItem key={year} value={String(year)}>
                          {year}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {(monthFilter || yearFilter) && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={clearMonthFilter}
                    className="h-10 w-10 rounded-full hover:bg-[#00c8ff]/10"
                  >
                    <X className="h-4 w-4" />
                    <span className="sr-only">Limpar filtro de mês</span>
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Exibir filtros ativos */}
          {monthFilter && yearFilter && (
            <div className="flex flex-wrap items-center gap-2 mt-4 p-2 bg-blue-900/10 rounded-md">
              <span className="text-sm text-[#00c8ff]/70">Filtros ativos:</span>
              <Badge className="bg-blue-500 text-white">
                {months.find((m) => m.value === monthFilter)?.label}/{yearFilter}
              </Badge>
            </div>
          )}
        </CardHeader>
        <CardContent>
          {showDebug && debugInfo && (
            <div className="mb-4 p-4 border border-blue-900/50 rounded-md bg-black/50 text-xs overflow-auto">
              <h3 className="font-bold mb-2">Informações de Depuração:</h3>
              <pre>{JSON.stringify(debugInfo, null, 2)}</pre>
            </div>
          )}

          {hasMonthlyHighlight && players.length > 0 && (
            <div className="mb-6 p-4 border border-yellow-500/30 rounded-lg bg-yellow-500/5">
              <div className="flex items-center gap-3 mb-2">
                <Award className="h-6 w-6 text-yellow-500" />
                <h3 className="text-lg font-bold text-yellow-500">Destaque do Mês</h3>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-xl font-bold">{players[0].name}</h4>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 rounded-full hover:bg-[#00c8ff]/10"
                      onClick={() => handleOpenDetails(players[0].name)}
                    >
                      <Info className="h-4 w-4" />
                      <span className="sr-only">Detalhes de {players[0].name}</span>
                    </Button>
                  </div>
                  <div className="text-sm text-[#00c8ff]/70">
                    Utilizou {players[0].numeroClasses} classes diferentes
                  </div>
                </div>
                <div className="flex items-center gap-1 text-2xl font-bold text-yellow-500">
                  <Users className="h-6 w-6 text-yellow-500" />
                  {players[0].participacoes} caçadas
                </div>
              </div>
            </div>
          )}

          {loading ? (
            // Esqueleto de carregamento
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4 mb-4 p-4 border border-blue-900/30 rounded-lg">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-[250px]" />
                  <Skeleton className="h-4 w-[200px]" />
                </div>
                <Skeleton className="h-10 w-20" />
              </div>
            ))
          ) : (
            <div className="space-y-4">
              {players.length === 0 ? (
                <div className="text-center py-8 text-[#00c8ff]/70">
                  {monthFilter
                    ? `Nenhum registro de participação encontrado no período de ${
                        months.find((m) => m.value === monthFilter)?.label
                      }/${yearFilter}`
                    : "Nenhum registro de participação encontrado"}
                </div>
              ) : (
                players.map((player, index) => (
                  <div
                    key={player.id}
                    className={`flex items-center gap-4 p-4 border border-blue-900/30 rounded-lg ${
                      index === 0 ? "bg-[#00c8ff]/10" : ""
                    }`}
                  >
                    <div className="flex items-center justify-center h-12 w-12 rounded-full bg-black border-2 border-[#00c8ff] text-[#00c8ff] font-bold">
                      {index === 0 ? <Trophy className="h-6 w-6" /> : <span>{index + 1}</span>}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-lg">{player.name}</h3>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 rounded-full hover:bg-[#00c8ff]/10"
                          onClick={() => handleOpenDetails(player.name)}
                        >
                          <Info className="h-4 w-4" />
                          <span className="sr-only">Detalhes de {player.name}</span>
                        </Button>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-[#00c8ff]/70">
                        <span>{player.numeroClasses} classes utilizadas</span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          Última: {formatDate(player.ultimaParticipacao)}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-xl font-bold">
                      <Users className="h-5 w-5 text-[#00c8ff]" />
                      {player.participacoes} caçadas
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {selectedPlayer && (
        <PlayerDetailsDialog playerName={selectedPlayer} open={detailsOpen} onOpenChange={setDetailsOpen} />
      )}
    </>
  )
}
