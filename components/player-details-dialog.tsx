"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Flame, Heart, User, Calendar } from "lucide-react"

type PlayerDetailsProps = {
  playerName: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

type ClassSummary = {
  class: string
  type: string
  highestValue: number
  averageValue: number
  count: number
  records: {
    id: string
    value: number
    date: string
  }[]
}

type PlayerData = {
  player: {
    id: string
    name: string
  }
  classSummary: ClassSummary[]
  allRecords: any[]
}

export function PlayerDetailsDialog({ playerName, open, onOpenChange }: PlayerDetailsProps) {
  const [playerData, setPlayerData] = useState<PlayerData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (open && playerName) {
      fetchPlayerDetails()
    }
  }, [open, playerName])

  const fetchPlayerDetails = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/players/${encodeURIComponent(playerName)}`)

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Erro ao buscar detalhes do jogador")
      }

      const data = await response.json()
      setPlayerData(data)
    } catch (error) {
      console.error("Erro:", error)
      setError(error instanceof Error ? error.message : "Erro ao carregar detalhes")
    } finally {
      setLoading(false)
    }
  }

  // Função para determinar a cor da classe
  const getClassColor = (className: string) => {
    const colors: Record<string, string> = {
      FULGURANTE: "bg-red-500",
      "FURA-BRUMA": "bg-purple-500",
      ÁGUIA: "bg-blue-500",
      "CHAMA SOMBRA": "bg-orange-500",
      ADAGAS: "bg-green-500",
      FROST: "bg-cyan-500",
      ENDEMONIADO: "bg-pink-500",
      "QUEBRA REINO": "bg-yellow-500",
      "QUEDA SANTA": "bg-green-600",
      REPETIDOR: "bg-indigo-500", // Nova classe com cor índigo
    }
    return colors[className] || "bg-gray-500"
  }

  // Formatar data
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl bg-black border-blue-900/50 text-[#00c8ff]">
        <DialogHeader>
          <DialogTitle className="text-2xl flex items-center gap-2">
            <User className="h-6 w-6" />
            {loading ? "Carregando..." : playerData?.player.name}
          </DialogTitle>
          <DialogDescription>Histórico detalhado de desempenho do jogador</DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="space-y-4">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-64 w-full" />
          </div>
        ) : error ? (
          <div className="p-4 text-red-400 border border-red-900/50 rounded-md">{error}</div>
        ) : playerData ? (
          <Tabs defaultValue="summary" className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-black border border-blue-900/50">
              <TabsTrigger value="summary" className="data-[state=active]:bg-[#00c8ff] data-[state=active]:text-black">
                Resumo por Classe
              </TabsTrigger>
              <TabsTrigger value="history" className="data-[state=active]:bg-[#00c8ff] data-[state=active]:text-black">
                Histórico Completo
              </TabsTrigger>
            </TabsList>

            <TabsContent value="summary">
              <div className="rounded-md border border-blue-900/50 overflow-hidden">
                <Table>
                  <TableHeader className="bg-black">
                    <TableRow className="hover:bg-transparent border-blue-900/50">
                      <TableHead>Classe</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead className="text-right">Melhor Valor</TableHead>
                      <TableHead className="text-right">Média</TableHead>
                      <TableHead className="text-right">Caçadas</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {playerData.classSummary.map((summary, index) => (
                      <TableRow key={index} className="hover:bg-blue-950/10 border-blue-900/30">
                        <TableCell>
                          <Badge className={`${getClassColor(summary.class)} text-white`}>{summary.class}</Badge>
                        </TableCell>
                        <TableCell>
                          {summary.type === "dps" ? (
                            <span className="flex items-center gap-1">
                              <Flame className="h-4 w-4 text-[#00c8ff]" />
                              DPS
                            </span>
                          ) : (
                            <span className="flex items-center gap-1">
                              <Heart className="h-4 w-4 text-[#00c8ff]" />
                              HPS
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="text-right font-bold">{summary.highestValue.toLocaleString()}</TableCell>
                        <TableCell className="text-right">{summary.averageValue.toLocaleString()}</TableCell>
                        <TableCell className="text-right">{summary.count}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>

            <TabsContent value="history">
              <div className="rounded-md border border-blue-900/50 overflow-hidden">
                <Table>
                  <TableHeader className="bg-black">
                    <TableRow className="hover:bg-transparent border-blue-900/50">
                      <TableHead>Data</TableHead>
                      <TableHead>Classe</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead className="text-right">Valor</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {playerData.allRecords.map((record) => (
                      <TableRow key={record.id} className="hover:bg-blue-950/10 border-blue-900/30">
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4 text-[#00c8ff]/70" />
                            {formatDate(record.date)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={`${getClassColor(record.class)} text-white`}>{record.class}</Badge>
                        </TableCell>
                        <TableCell>
                          {record.type === "dps" ? (
                            <span className="flex items-center gap-1">
                              <Flame className="h-4 w-4 text-[#00c8ff]" />
                              DPS
                            </span>
                          ) : (
                            <span className="flex items-center gap-1">
                              <Heart className="h-4 w-4 text-[#00c8ff]" />
                              HPS
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="text-right font-bold">{record.value.toLocaleString()}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>
          </Tabs>
        ) : null}
      </DialogContent>
    </Dialog>
  )
}

