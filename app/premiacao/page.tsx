"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Award, Flame, Heart, Trophy, User, Users } from "lucide-react"
import { PlayerDetailsDialog } from "@/components/player-details-dialog"

// Lista de classes DPS disponíveis para sorteio
const DPS_CLASSES = [
  "FULGURANTE",
  "FURA-BRUMA",
  "ÁGUIA",
  "CHAMA SOMBRA",
  "ADAGAS",
  "FROST",
  "ENDEMONIADO",
  "QUEBRA REINO",
  "REPETIDOR",
]

// Lista de classes HPS disponíveis para sorteio
const HPS_CLASSES = ["QUEDA SANTA"]

export default function PremiacaoPage() {
  const [selectedMonth, setSelectedMonth] = useState("")
  const [selectedYear, setSelectedYear] = useState("")
  const [selectedClass, setSelectedClass] = useState("")
  const [selectedType, setSelectedType] = useState("dps")
  const [loading, setLoading] = useState(false)
  const [winner, setWinner] = useState(null)
  const [detailsOpen, setDetailsOpen] = useState(false)
  const [selectedPlayer, setSelectedPlayer] = useState(null)

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

  // Definir mês e ano atual como padrão
  useEffect(() => {
    const currentDate = new Date()
    setSelectedMonth(String(currentDate.getMonth() + 1))
    setSelectedYear(String(currentDate.getFullYear()))
  }, [])

  // Função para buscar o vencedor
  const fetchWinner = async () => {
    if (!selectedMonth || !selectedYear) {
      alert("Por favor, selecione mês e ano para buscar o vencedor.")
      return
    }

    if (selectedType !== "participacao" && !selectedClass) {
      alert("Por favor, selecione uma classe para buscar o vencedor.")
      return
    }

    setLoading(true)
    setWinner(null)

    try {
      // Construir a URL com os parâmetros de filtro
      let url = ""

      if (selectedType === "participacao") {
        url = `/api/participacao?month=${encodeURIComponent(selectedMonth)}&year=${encodeURIComponent(selectedYear)}`
      } else {
        url = `/api/rankings?type=${selectedType}&class=${encodeURIComponent(selectedClass)}&month=${encodeURIComponent(
          selectedMonth,
        )}&year=${encodeURIComponent(selectedYear)}`
      }

      const response = await fetch(url)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Erro ao buscar rankings")
      }

      if (data.length > 0) {
        // O primeiro jogador é o vencedor (maior valor)
        setWinner(data[0])
      } else {
        alert(
          selectedType === "participacao"
            ? `Nenhum registro encontrado para o mês de ${months.find((m) => m.value === selectedMonth)?.label}/${selectedYear}`
            : `Nenhum registro encontrado para ${selectedClass} em ${months.find((m) => m.value === selectedMonth)?.label}/${selectedYear}`,
        )
      }
    } catch (error) {
      console.error("Erro:", error)
      alert("Erro ao buscar o vencedor: " + (error instanceof Error ? error.message : "Erro desconhecido"))
    } finally {
      setLoading(false)
    }
  }

  // Função para determinar a cor da classe
  const getClassColor = (className) => {
    const colors = {
      FULGURANTE: "bg-red-500",
      "FURA-BRUMA": "bg-purple-500",
      ÁGUIA: "bg-blue-500",
      "CHAMA SOMBRA": "bg-orange-500",
      ADAGAS: "bg-green-500",
      FROST: "bg-cyan-500",
      ENDEMONIADO: "bg-pink-500",
      "QUEBRA REINO": "bg-yellow-500",
      REPETIDOR: "bg-indigo-500",
      "QUEDA SANTA": "bg-green-600",
    }
    return colors[className] || "bg-gray-500"
  }

  const handleOpenDetails = (playerName) => {
    setSelectedPlayer(playerName)
    setDetailsOpen(true)
  }

  // Função para sortear uma classe aleatória
  const sortearClasse = () => {
    const classes = selectedType === "dps" ? DPS_CLASSES : HPS_CLASSES
    const randomIndex = Math.floor(Math.random() * classes.length)
    setSelectedClass(classes[randomIndex])
  }

  return (
    <main className="min-h-screen bg-black text-[#00c8ff]">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-center mb-8">Premiação Mensal</h1>

        <Card className="border-blue-900/50 bg-black/50 backdrop-blur-sm mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-6 w-6 text-yellow-500" />
              Sistema de Premiação
            </CardTitle>
            <CardDescription>Selecione o mês, ano e categoria para encontrar o jogador destaque</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium mb-2">Mês</label>
                <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                  <SelectTrigger className="bg-black/50 border-blue-900/50">
                    <SelectValue placeholder="Selecione o mês" />
                  </SelectTrigger>
                  <SelectContent className="bg-black border-blue-900/50">
                    {months.map((month) => (
                      <SelectItem key={month.value} value={month.value}>
                        {month.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Ano</label>
                <Select value={selectedYear} onValueChange={setSelectedYear}>
                  <SelectTrigger className="bg-black/50 border-blue-900/50">
                    <SelectValue placeholder="Selecione o ano" />
                  </SelectTrigger>
                  <SelectContent className="bg-black border-blue-900/50">
                    {years.map((year) => (
                      <SelectItem key={year} value={String(year)}>
                        {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Tipo</label>
                <Select
                  value={selectedType}
                  onValueChange={(value) => {
                    setSelectedType(value)
                    if (value === "participacao") {
                      setSelectedClass("")
                    }
                  }}
                >
                  <SelectTrigger className="bg-black/50 border-blue-900/50">
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent className="bg-black border-blue-900/50">
                    <SelectItem value="dps">
                      <div className="flex items-center gap-2">
                        <Flame className="h-4 w-4 text-[#00c8ff]" />
                        DPS
                      </div>
                    </SelectItem>
                    <SelectItem value="hps">
                      <div className="flex items-center gap-2">
                        <Heart className="h-4 w-4 text-[#00c8ff]" />
                        HPS
                      </div>
                    </SelectItem>
                    <SelectItem value="participacao">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-[#00c8ff]" />
                        Participação
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {selectedType !== "participacao" && (
                <div>
                  <label className="block text-sm font-medium mb-2">Classe</label>
                  <div className="flex gap-2">
                    <Select value={selectedClass} onValueChange={setSelectedClass} className="flex-1">
                      <SelectTrigger className="bg-black/50 border-blue-900/50">
                        <SelectValue placeholder="Selecione a classe" />
                      </SelectTrigger>
                      <SelectContent className="bg-black border-blue-900/50">
                        {(selectedType === "dps" ? DPS_CLASSES : HPS_CLASSES).map((className) => (
                          <SelectItem key={className} value={className}>
                            <div className="flex items-center gap-2">
                              <span className={`w-3 h-3 rounded-full ${getClassColor(className)}`}></span>
                              {className}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button
                      onClick={sortearClasse}
                      variant="outline"
                      className="border-blue-900/50 hover:bg-blue-900/20"
                    >
                      Sortear
                    </Button>
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-center">
              <Button
                onClick={fetchWinner}
                disabled={
                  loading || !selectedMonth || !selectedYear || (selectedType !== "participacao" && !selectedClass)
                }
                className="bg-[#00c8ff] text-black hover:bg-[#00c8ff]/80"
                size="lg"
              >
                {loading ? "Buscando..." : "Encontrar Destaque do Mês"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {winner && (
          <Card className="border-yellow-500/30 bg-black/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-6 w-6 text-yellow-500" />
                Destaque do Mês: {months.find((m) => m.value === selectedMonth)?.label}/{selectedYear}
              </CardTitle>
              <CardDescription>
                {selectedType === "participacao"
                  ? "Jogador com maior número de participações"
                  : `Jogador com melhor desempenho na classe ${selectedClass}`}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row items-center justify-between gap-6 p-6 border border-yellow-500/30 rounded-lg bg-yellow-500/5">
                <div className="flex items-center gap-4">
                  <div className="flex items-center justify-center h-20 w-20 rounded-full bg-black border-4 border-yellow-500 text-yellow-500">
                    <User className="h-10 w-10" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">{winner.name}</h2>
                    <div className="flex items-center gap-2 mt-1">
                      {selectedType !== "participacao" && (
                        <Badge className={`${getClassColor(winner.class)} text-white`}>{winner.class}</Badge>
                      )}
                      <span className="text-sm text-[#00c8ff]/70">
                        {selectedType === "participacao"
                          ? `${winner.numeroClasses} classes utilizadas`
                          : `${winner.entries} caçadas registradas`}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="hover:bg-[#00c8ff]/10"
                        onClick={() => handleOpenDetails(winner.name)}
                      >
                        Ver detalhes
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="text-center">
                  <div className="text-sm text-[#00c8ff]/70">
                    {selectedType === "participacao"
                      ? "Total de Participações"
                      : `Melhor ${selectedType.toUpperCase()}`}
                  </div>
                  <div className="flex items-center justify-center gap-2 text-3xl font-bold text-yellow-500">
                    {selectedType === "dps" ? (
                      <Flame className="h-8 w-8 text-yellow-500" />
                    ) : selectedType === "hps" ? (
                      <Heart className="h-8 w-8 text-yellow-500" />
                    ) : (
                      <Users className="h-8 w-8 text-yellow-500" />
                    )}
                    {selectedType === "participacao"
                      ? `${winner.participacoes} caçadas`
                      : winner.value.toLocaleString("pt-BR")}
                  </div>
                  {selectedType !== "participacao" && (
                    <div className="text-sm text-[#00c8ff]/70 mt-1">
                      Média: {winner.averageValue.toLocaleString("pt-BR")}
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}
        <div className="mt-8"></div>
      </div>
      <Footer />

      {selectedPlayer && (
        <PlayerDetailsDialog playerName={selectedPlayer} open={detailsOpen} onOpenChange={setDetailsOpen} />
      )}
    </main>
  )
}
