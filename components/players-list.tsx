"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Edit, Trash2, Loader2, RefreshCw, AlertTriangle, Save, X } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { toast } from "@/components/ui/use-toast"
import { Toaster } from "@/components/ui/toaster"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"

export function PlayersList() {
  const [players, setPlayers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [refreshing, setRefreshing] = useState(false)
  const [editingPlayer, setEditingPlayer] = useState(null)
  const [editedName, setEditedName] = useState("")
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    fetchPlayers()
  }, [])

  const fetchPlayers = async () => {
    setLoading(true)
    setError(null)

    try {
      console.log("Buscando jogadores do Supabase...")

      const { data, error } = await supabase.from("players").select("*").order("name")

      if (error) {
        throw error
      }

      console.log(`Encontrados ${data.length} jogadores`)
      setPlayers(data)
    } catch (err) {
      console.error("Erro ao buscar jogadores:", err)
      setError(err.message || "Erro ao buscar jogadores")
    } finally {
      setLoading(false)
    }
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    await fetchPlayers()
    setRefreshing(false)
  }

  const handleDeletePlayer = async (id, name) => {
    if (!confirm(`Tem certeza que deseja excluir o jogador "${name}"? Esta ação não pode ser desfeita.`)) {
      return
    }

    try {
      // Primeiro, verificar se o jogador tem registros
      const { data: records, error: recordsError } = await supabase.from("records").select("id").eq("player_id", id)

      if (recordsError) {
        throw recordsError
      }

      if (records.length > 0) {
        // Jogador tem registros, perguntar se deseja excluir também
        if (
          !confirm(
            `O jogador "${name}" possui ${records.length} registros. Deseja excluir o jogador e todos os seus registros?`,
          )
        ) {
          return
        }

        // Excluir registros primeiro
        const { error: deleteRecordsError } = await supabase.from("records").delete().eq("player_id", id)

        if (deleteRecordsError) {
          throw deleteRecordsError
        }
      }

      // Excluir o jogador
      const { error: deletePlayerError } = await supabase.from("players").delete().eq("id", id)

      if (deletePlayerError) {
        throw deletePlayerError
      }

      toast({
        title: "Sucesso",
        description: `Jogador "${name}" excluído com sucesso!`,
      })

      // Atualizar a lista
      fetchPlayers()
    } catch (err) {
      console.error("Erro ao excluir jogador:", err)
      toast({
        title: "Erro",
        description: err.message || "Erro ao excluir jogador",
        variant: "destructive",
      })
    }
  }

  const handleEditPlayer = (id, name) => {
    setEditingPlayer({ id, name })
    setEditedName(name)
    setIsEditDialogOpen(true)
  }

  const handleSaveEdit = async () => {
    if (!editedName.trim()) {
      toast({
        title: "Erro",
        description: "O nome do jogador não pode estar vazio",
        variant: "destructive",
      })
      return
    }

    setIsSaving(true)

    try {
      const { error } = await supabase.from("players").update({ name: editedName }).eq("id", editingPlayer.id)

      if (error) {
        throw error
      }

      toast({
        title: "Sucesso",
        description: `Jogador "${editingPlayer.name}" atualizado para "${editedName}"`,
      })

      // Fechar o diálogo e atualizar a lista
      setIsEditDialogOpen(false)
      fetchPlayers()
    } catch (err) {
      console.error("Erro ao atualizar jogador:", err)
      toast({
        title: "Erro",
        description: err.message || "Erro ao atualizar jogador",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const closeEditDialog = () => {
    setIsEditDialogOpen(false)
    setEditingPlayer(null)
    setEditedName("")
  }

  return (
    <Card className="border-blue-900/50 bg-black/30">
      <CardContent className="pt-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold">Lista de Jogadores</h3>
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

        <Table>
          <TableCaption>Lista de jogadores cadastrados no sistema.</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">ID</TableHead>
              <TableHead>Nome</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={3} className="text-center">
                  <Loader2 className="mr-2 h-4 w-4 animate-spin inline-block" />
                  Carregando jogadores...
                </TableCell>
              </TableRow>
            ) : error ? (
              <TableRow>
                <TableCell colSpan={3} className="text-center text-red-500">
                  {error}
                </TableCell>
              </TableRow>
            ) : players.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} className="text-center">
                  Nenhum jogador cadastrado.
                </TableCell>
              </TableRow>
            ) : (
              players.map((player) => (
                <TableRow key={player.id}>
                  <TableCell className="font-mono text-xs">{player.id.substring(0, 8)}...</TableCell>
                  <TableCell>{player.name}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEditPlayer(player.id, player.name)}
                      className="hover:bg-blue-900/20"
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Editar
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeletePlayer(player.id, player.name)}
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
              <DialogTitle>Editar Jogador</DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <label htmlFor="playerName" className="block text-sm font-medium mb-2">
                Nome do Jogador
              </label>
              <Input
                id="playerName"
                value={editedName}
                onChange={(e) => setEditedName(e.target.value)}
                className="bg-black/50 border-blue-900/50 focus:border-[#00c8ff]"
                placeholder="Digite o novo nome do jogador"
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
