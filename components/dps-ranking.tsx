"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Flame, Swords, Trophy, Info, Filter, X, Bug, Award, Calendar } from "lucide-react"
import { PlayerDetailsDialog } from "@/components/player-details-dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

// Lista de classes DPS disponíveis para filtro
const DPS_CLASSES = ["FULGURANTE", "FURA-BRUMA", "ÁGUIA", "CHAMA SOMBRA", "FROST", "ENDEMONIADO", "REPETIDOR"]

export function DpsRanking() {
  const [players, setPlayers] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedPlayer, setSelectedPlayer] = useState(null)
  const [detailsOpen, setDetailsOpen] = useState(false)
  const [classFilter, setClassFilter] = useState(null)
  const [monthFilter, setMonthFilter] = useState(null)
  const [yearFilter, setYearFilter] = useState(null)
  const [debugInfo, setDebugInfo] = useState(null)
  const [showDebug, setShowDebug] = useState(false)

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

  // Função para buscar os rankings com base nos filtros
  const fetchRankings = async () => {
    setLoading(true)
    setDebugInfo(null)

    try {
      // Construir a URL com os parâmetros de filtro
      let url = "/api/rankings?type=dps"
      if (classFilter) {
        url += `&class=${encodeURIComponent(classFilter)}`
      }
      if (monthFilter && yearFilter) {
        url += `&month=${encodeURIComponent(monthFilter)}&year=${encodeURIComponent(yearFilter)}`
      }

      console.log("Buscando rankings de DPS:", url)

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
        throw new Error(data.error || "Erro ao buscar rankings")
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

  // Efeito para buscar rankings quando os filtros mudam
  useEffect(() => {
    fetchRankings()
  }, [classFilter, monthFilter, yearFilter])

  // Função para determinar a cor da classe
  const getClassColor = (className) => {
    const colors = {
      FULGURANTE: "bg-red-500",
      "FURA-BRUMA": "bg-purple-500",
      ÁGUIA: "bg-blue-500",
      "CHAMA SOMBRA": "bg-orange-500",
      FROST: "bg-cyan-500",
      ENDEMONIADO: "bg-pink-500",
      REPETIDOR: "bg-indigo-500",
    }
    return colors[className] || "bg-gray-500"
  }

  const handleOpenDetails = (playerName) => {
    setSelectedPlayer(playerName)
    setDetailsOpen(true)
  }

  const handleClassFilterChange = (value) => {
    setClassFilter(value === "all" ? null : value)
  }

  const handleMonthChange = (value) => {
    setMonthFilter(value === "all" ? null : value)
  }

  const handleYearChange = (value) => {
    setYearFilter(value === "all" ? null : value)
  }

  const clearClassFilter = () => {
    setClassFilter(null)
  }

  const clearMonthFilter = () => {
    setMonthFilter(null)
    setYearFilter(null)
  }

  const toggleDebug = () => {
    setShowDebug((prev) => !prev)
  }

  // Determinar se o primeiro jogador é o destaque do mês
  const hasMonthlyHighlight = monthFilter && yearFilter && players.length > 0

  return (
    <>
      <Card className="border-gray-600/50 bg-[#2a2a2e]/50 backdrop-blur-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-2xl flex items-center gap-2 primary-text">
            <Swords className="h-6 w-6 text-[#8B5CF6]" />
            Ranking de DPS
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 rounded-full hover:bg-[#8B5CF6]/10"
              onClick={toggleDebug}
            >
              <Bug className="h-4 w-4" />
              <span className="sr-only">Debug</span>
            </Button>
          </CardTitle>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
            {/* Filtro de Classe */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Filter className="h-4 w-4 text-[#8B5CF6]/70" />
                <span className="text-sm secondary-text">Filtrar por Classe:</span>
              </div>
              <div className="flex gap-2">
                <Select value={classFilter || "all"} onValueChange={handleClassFilterChange} className="flex-1">
                  <SelectTrigger className="bg-[#1f1f23]/50 border-gray-600/50">
                    <SelectValue placeholder="Selecione a classe" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#2a2a2e] border-gray-600/50">
                    <SelectItem value="all">Todas as classes</SelectItem>
                    {DPS_CLASSES.map((className) => (
                      <SelectItem key={className} value={className}>
                        <div className="flex items-center gap-2">
                          <span className={`w-3 h-3 rounded-full ${getClassColor(className)}`}></span>
                          {className}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {classFilter && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={clearClassFilter}
                    className="h-10 w-10 rounded-full hover:bg-[#8B5CF6]/10"
                  >
                    <X className="h-4 w-4" />
                    <span className="sr-only">Limpar filtro de classe</span>
                  </Button>
                )}
              </div>
            </div>

            {/* Filtro de Mês */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="h-4 w-4 text-[#8B5CF6]/70" />
                <span className="text-sm secondary-text">Filtrar por Mês:</span>
              </div>
              <div className="flex gap-2">
                <div className="grid grid-cols-2 gap-2 flex-1">
                  <Select value={monthFilter || "all"} onValueChange={handleMonthChange}>
                    <SelectTrigger className="bg-[#1f1f23]/50 border-gray-600/50">
                      <SelectValue placeholder="Mês" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#2a2a2e] border-gray-600/50">
                      <SelectItem value="all">Todos os meses</SelectItem>
                      {months.map((month) => (
                        <SelectItem key={month.value} value={month.value}>
                          {month.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select value={yearFilter || "all"} onValueChange={handleYearChange}>
                    <SelectTrigger className="bg-[#1f1f23]/50 border-gray-600/50">
                      <SelectValue placeholder="Ano" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#2a2a2e] border-gray-600/50">
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
                    className="h-10 w-10 rounded-full hover:bg-[#8B5CF6]/10"
                  >
                    <X className="h-4 w-4" />
                    <span className="sr-only">Limpar filtro de mês</span>
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Exibir filtros ativos */}
          {(classFilter || monthFilter) && (
            <div className="flex flex-wrap items-center gap-2 mt-4 p-2 bg-[#8B5CF6]/10 rounded-md">
              <span className="text-sm secondary-text">Filtros ativos:</span>
              {classFilter && <Badge className={`${getClassColor(classFilter)} text-white`}>{classFilter}</Badge>}
              {monthFilter && yearFilter && (
                <Badge className="bg-blue-500 text-white">
                  {months.find((m) => m.value === monthFilter)?.label}/{yearFilter}
                </Badge>
              )}
            </div>
          )}
        </CardHeader>
        <CardContent>
          {showDebug && debugInfo && (
            <div className="mb-4 p-4 border border-gray-600/50 rounded-md bg-[#1f1f23]/50 text-xs overflow-auto">
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
                    <h4 className="text-xl font-bold player-name">{players[0].name}</h4>
                    <Badge className={`${getClassColor(players[0].class)} text-white`}>{players[0].class}</Badge>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 rounded-full hover:bg-[#8B5CF6]/10"
                      onClick={() => handleOpenDetails(players[0].name)}
                    >
                      <Info className="h-4 w-4" />
                      <span className="sr-only">Detalhes de {players[0].name}</span>
                    </Button>
                  </div>
                  <div className="text-sm secondary-text">
                    Média: {players[0].averageValue.toLocaleString("pt-BR")} DPS ({players[0].entries} caçadas)
                  </div>
                </div>
                <div className="flex items-center gap-1 text-2xl font-bold text-yellow-500">
                  <Flame className="h-6 w-6 text-yellow-500" />
                  {players[0].value.toLocaleString("pt-BR")}
                </div>
              </div>
            </div>
          )}

          {loading ? (
            // Esqueleto de carregamento
            Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4 mb-4 p-4 border border-gray-600/30 rounded-lg">
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
                <div className="text-center py-8 secondary-text">
                  {classFilter && monthFilter
                    ? `Nenhum registro de DPS encontrado para a classe ${classFilter} no período de ${
                        months.find((m) => m.value === monthFilter)?.label
                      }/${yearFilter}`
                    : classFilter
                      ? `Nenhum registro de DPS encontrado para a classe ${classFilter}`
                      : monthFilter
                        ? `Nenhum registro de DPS encontrado no período de ${
                            months.find((m) => m.value === monthFilter)?.label
                          }/${yearFilter}`
                        : "Nenhum registro de DPS encontrado"}
                </div>
              ) : (
                players.map((player, index) => (
                  <div
                    key={player.id}
                    className={`flex items-center gap-4 p-4 border border-gray-600/30 rounded-lg ${
                      index === 0 ? "bg-[#8B5CF6]/10" : ""
                    }`}
                  >
                    <div className="flex items-center justify-center h-12 w-12 rounded-full bg-[#1f1f23] border-2 border-[#8B5CF6] text-[#8B5CF6] font-bold">
                      {index === 0 ? <Trophy className="h-6 w-6" /> : <span>{index + 1}</span>}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-lg player-name">{player.name}</h3>
                        <Badge className={`${getClassColor(player.class)} text-white`}>{player.class}</Badge>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 rounded-full hover:bg-[#8B5CF6]/10"
                          onClick={() => handleOpenDetails(player.name)}
                        >
                          <Info className="h-4 w-4" />
                          <span className="sr-only">Detalhes de {player.name}</span>
                        </Button>
                      </div>
                      <div className="text-sm secondary-text">
                        Média: {player.averageValue.toLocaleString("pt-BR")} DPS ({player.entries} caçadas)
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-xl font-bold primary-text">
                      <Flame className="h-5 w-5 text-[#8B5CF6]" />
                      {player.value.toLocaleString("pt-BR")}
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
