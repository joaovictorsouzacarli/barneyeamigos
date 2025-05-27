"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Edit, Trash2, Loader2, RefreshCw, AlertTriangle, Save, X, Search, Filter } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { toast } from "@/components/ui/use-toast"
import { Toaster } from "@/components/ui/toaster"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"

export function RecordsManagement() {
  const [records, setRecords] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [refreshing, setRefreshing] = useState(false)
  const [editingRecord, setEditingRecord] = useState(null)
  const [editedValue, setEditedValue] = useState("")
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [typeFilter, setTypeFilter] = useState("")
  const [classFilter, setClassFilter] = useState("")
  const [players, setPlayers] = useState([])

  // Lista de classes DPS disponíveis
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

  // Classe de HPS disponível
  const HPS_CLASSES = ["QUEDA SANTA"]

  useEffect(() => {
    fetchRecords()
    fetchPlayers()
  }, [])

  const fetchPlayers = async () => {
    try {
      const { data, error } = await supabase.from("players").select("*").order("name")

      if (error) {
        throw error
      }

      setPlayers(data)
    } catch (err) {
      console.error("Erro ao buscar jogadores:", err)
    }
  }

  const fetchRecords = async () => {
    setLoading(true)
    setError(null)

    try {
      console.log("Buscando registros do Supabase...")

      const { data, error } = await supabase
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

      if (error) {
        throw error
      }

      console.log(`Encontrados ${data.length} registros`)
      setRecords(data)
    } catch (err) {
      console.error("Erro ao buscar registros:", err)
      setError(err.message || "Erro ao buscar registros")
    } finally {
      setLoading(false)
    }
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    await fetchRecords()
    setRefreshing(false)
  }

  const handleDeleteRecord = async (id, playerName, value, type) => {
    if (
      !confirm(
        `Tem certeza que deseja excluir o registro de ${type.toUpperCase()} (${value}) do jogador "${playerName}"? Esta ação não pode ser desfeita.`,
      )
    ) {
      return
    }

    try {
      const { error } = await supabase.from("records").delete().eq("id", id)

      if (error) {
        throw error
      }

      toast({
        title: "Sucesso",
        description: `Registro excluído com sucesso!`,
      })

      // Atualizar a lista
      fetchRecords()
    } catch (err) {
      console.error("Erro ao excluir registro:", err)
      toast({
        title: "Erro",
        description: err.message || "Erro ao excluir registro",
        variant: "destructive",
      })
    }
  }

  const handleEditRecord = (record) => {
    setEditingRecord(record)
    setEditedValue(record.value.toString())
    setIsEditDialogOpen(true)
  }

  const handleSaveEdit = async () => {
    if (!editedValue.trim() || isNaN(Number(editedValue)) || Number(editedValue) <= 0) {
      toast({
        title: "Erro",
        description: "O valor deve ser um número positivo",
        variant: "destructive",
      })
      return
    }

    setIsSaving(true)

    try {
      const { error } = await supabase
        .from("records")
        .update({ value: Number(editedValue) })
        .eq("id", editingRecord.id)

      if (error) {
        throw error
      }

      toast({
        title: "Sucesso",
        description: `Valor atualizado com sucesso!`,
      })

      // Fechar o diálogo e atualizar a lista
      setIsEditDialogOpen(false)
      fetchRecords()
    } catch (err) {
      console.error("Erro ao atualizar registro:", err)
      toast({
        title: "Erro",
        description: err.message || "Erro ao atualizar registro",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const closeEditDialog = () => {
    setIsEditDialogOpen(false)
    setEditingRecord(null)
    setEditedValue("")
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
      "QUEDA SANTA": "bg-green-600",
      REPETIDOR: "bg-indigo-500",
    }
    return colors[className] || "bg-gray-500"
  }

  // Formatar data
  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  // Filtrar registros
  const filteredRecords = records.filter((record) => {
    const playerName = record.players?.name || "Desconhecido"
    const matchesSearch = searchTerm === "" || playerName.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = typeFilter === "" || record.type === typeFilter
    const matchesClass = classFilter === "" || record.class === classFilter
    return matchesSearch && matchesType && matchesClass
  })

  return (
    <Card className="border-blue-900/50 bg-black/30">
      <CardContent className="pt-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold">Gerenciar Registros de DPS/HPS</h3>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={refreshing}
            className="border-blue-900/50 hover:bg-blue-900/20"
          >
            {refreshing ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
            <span className="ml-2">Atualizar</span>
          </Button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-900/20 border border-red-900/50 rounded-md text-red-400 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            <span>{error}</span>
          </div>
        )}

        {/* Filtros */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#00c8ff]/50" />
            <Input
              placeholder="Buscar por jogador..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-black/50 border-blue-900/50 focus:border-[#00c8ff]"
            />
          </div>

          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="bg-black/50 border-blue-900/50">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-[#00c8ff]/50" />
                <SelectValue placeholder="Filtrar por tipo" />
              </div>
            </SelectTrigger>
            <SelectContent className="bg-black border-blue-900/50">
              <SelectItem value="all">Todos os tipos</SelectItem>
              <SelectItem value="dps">DPS</SelectItem>
              <SelectItem value="hps">HPS</SelectItem>
            </SelectContent>
          </Select>

          <Select value={classFilter} onValueChange={setClassFilter}>
            <SelectTrigger className="bg-black/50 border-blue-900/50">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-[#00c8ff]/50" />
                <SelectValue placeholder="Filtrar por classe" />
              </div>
            </SelectTrigger>
            <SelectContent className="bg-black border-blue-900/50">
              <SelectItem value="all">Todas as classes</SelectItem>
              {DPS_CLASSES.map((className) => (
                <SelectItem key={className} value={className}>
                  <div className="flex items-center gap-2">
                    <span className={`w-3 h-3 rounded-full ${getClassColor(className)}`}></span>
                    {className}
                  </div>
                </SelectItem>
              ))}
              {HPS_CLASSES.map((className) => (
                <SelectItem key={className} value={className}>
                  <div className="flex items-center gap-2">
                    <span className={`w-3 h-3 rounded-full ${getClassColor(className)}`}></span>
                    {className}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Table>
          <TableCaption>Lista de registros de DPS/HPS cadastrados no sistema.</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>Jogador</TableHead>
              <TableHead>Classe</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead className="text-right">Valor</TableHead>
              <TableHead>Data</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center">
                  <Loader2 className="mr-2 h-4 w-4 animate-spin inline-block" />
                  Carregando registros...
                </TableCell>
              </TableRow>
            ) : error ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-red-500">
                  {error}
                </TableCell>
              </TableRow>
            ) : filteredRecords.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center">
                  Nenhum registro encontrado.
                </TableCell>
              </TableRow>
            ) : (
              filteredRecords.map((record) => (
                <TableRow key={record.id}>
                  <TableCell>{record.players?.name || "Desconhecido"}</TableCell>
                  <TableCell>
                    <Badge className={`${getClassColor(record.class)} text-white`}>{record.class}</Badge>
                  </TableCell>
                  <TableCell className="uppercase">{record.type}</TableCell>
                  <TableCell className="text-right font-bold">{record.value.toLocaleString()}</TableCell>
                  <TableCell>{formatDate(record.created_at)}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEditRecord(record)}
                      className="hover:bg-blue-900/20"
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Editar
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteRecord(record.id, record.players?.name, record.value, record.type)}
                      className="hover:bg-red-900/20 text-red-400"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Excluir
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        {/* Diálogo de Edição */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="bg-black border-blue-900/50 text-[#00c8ff]">
            <DialogHeader>
              <DialogTitle>Editar Valor de {editingRecord?.type?.toUpperCase()}</DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <div className="mb-4">
                <p>
                  <strong>Jogador:</strong> {editingRecord?.players?.name}
                </p>
                <p>
                  <strong>Classe:</strong> {editingRecord?.class}
                </p>
                <p>
                  <strong>Tipo:</strong> {editingRecord?.type?.toUpperCase()}
                </p>
                <p>
                  <strong>Data:</strong> {editingRecord ? formatDate(editingRecord.created_at) : ""}
                </p>
              </div>
              <label htmlFor="recordValue" className="block text-sm font-medium mb-2">
                Novo Valor
              </label>
              <Input
                id="recordValue"
                type="number"
                value={editedValue}
                onChange={(e) => setEditedValue(e.target.value)}
                className="bg-black/50 border-blue-900/50 focus:border-[#00c8ff]"
                placeholder="Digite o novo valor"
                autoFocus
              />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={closeEditDialog} className="border-blue-900/50 hover:bg-blue-900/20">
                <X className="h-4 w-4 mr-2" />
                Cancelar
              </Button>
              <Button
                onClick={handleSaveEdit}
                disabled={isSaving}
                className="bg-[#00c8ff] text-black hover:bg-[#00c8ff]/80"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Salvar
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Toaster />
      </CardContent>
    </Card>
  )
}
