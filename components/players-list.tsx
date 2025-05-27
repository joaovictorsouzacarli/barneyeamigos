"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Edit,
  Trash2,
  Loader2,
  RefreshCw,
  AlertTriangle,
  Save,
  X,
  Settings,
  Database,
  ExternalLink,
} from "lucide-react"
import { supabase } from "@/lib/supabase"
import { toast } from "@/components/ui/use-toast"
import { Toaster } from "@/components/ui/toaster"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"

export function PlayersList() {
  const [players, setPlayers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [refreshing, setRefreshing] = useState(false)
  const [editingPlayer, setEditingPlayer] = useState(null)
  const [editedName, setEditedName] = useState("")
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState(null)
  const [debugInfo, setDebugInfo] = useState(null)

  useEffect(() => {
    fetchPlayers()
  }, [])

  const testConnection = async () => {
    try {
      console.log("🔍 Testando conexão com Supabase...")

      const response = await fetch("/api/test-connection", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      })

      console.log("📡 Status da resposta:", response.status)

      // Verificar se a resposta é JSON válido
      const contentType = response.headers.get("content-type")
      console.log("📄 Content-Type:", contentType)

      if (!contentType || !contentType.includes("application/json")) {
        const textResponse = await response.text()
        console.error("❌ Resposta não é JSON:", textResponse.substring(0, 500))
        throw new Error(`Servidor retornou ${response.status}: ${textResponse.substring(0, 100)}...`)
      }

      const data = await response.json()
      console.log("📊 Dados da conexão:", data)

      setConnectionStatus(data)
      setDebugInfo({
        url: "/api/test-connection",
        status: response.status,
        contentType,
        timestamp: new Date().toISOString(),
      })

      return data.success
    } catch (err) {
      console.error("💥 Erro ao testar conexão:", err)
      const errorData = {
        success: false,
        error: err.message,
        type: err.name,
        timestamp: new Date().toISOString(),
      }
      setConnectionStatus(errorData)
      setDebugInfo({
        error: err.message,
        stack: err.stack,
        timestamp: new Date().toISOString(),
      })
      return false
    }
  }

  const fetchPlayers = async () => {
    setLoading(true)
    setError(null)

    try {
      console.log("👥 Buscando jogadores do Supabase...")

      // Primeiro, testar a conexão
      const connectionOk = await testConnection()
      if (!connectionOk) {
        throw new Error("Falha na conexão com o banco de dados")
      }

      const { data, error } = await supabase.from("players").select("*").order("name")

      if (error) {
        console.error("❌ Erro do Supabase:", error)
        throw new Error(`Erro do Supabase: ${error.message}`)
      }

      console.log(`✅ Encontrados ${data?.length || 0} jogadores`)
      setPlayers(data || [])
    } catch (err) {
      console.error("💥 Erro ao buscar jogadores:", err)
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

  const clearAllData = async () => {
    if (
      !confirm(
        "ATENÇÃO: Esta ação irá excluir TODOS os jogadores e registros do banco de dados. Esta ação NÃO PODE ser desfeita. Tem certeza que deseja continuar?",
      )
    ) {
      return
    }

    try {
      const response = await fetch("/api/limpar-dados", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Erro ao limpar dados")
      }

      toast({
        title: "Sucesso",
        description: "Todos os dados foram limpos com sucesso!",
      })

      // Atualizar a lista
      fetchPlayers()
    } catch (err) {
      console.error("Erro ao limpar dados:", err)
      toast({
        title: "Erro",
        description: err.message || "Erro ao limpar dados",
        variant: "destructive",
      })
    }
  }

  const getErrorType = () => {
    if (!connectionStatus || connectionStatus.success) return null

    if (connectionStatus.needsConfiguration) {
      return "config"
    }
    if (connectionStatus.needsSetup) {
      return "setup"
    }
    if (connectionStatus.supabaseError) {
      return "supabase"
    }
    return "unknown"
  }

  const renderErrorSolution = () => {
    const errorType = getErrorType()

    switch (errorType) {
      case "config":
        return (
          <div className="space-y-3">
            <div className="font-bold text-red-400">❌ Variáveis de ambiente não configuradas</div>
            <div className="text-sm">Variáveis faltando: {connectionStatus.missingVars?.join(", ")}</div>
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={() => window.open("https://vercel.com/dashboard", "_blank")}
                className="bg-blue-600 text-white hover:bg-blue-700"
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Configurar no Vercel
              </Button>
              <Button
                size="sm"
                onClick={() => window.open("/verificar-env", "_blank")}
                className="bg-yellow-600 text-white hover:bg-yellow-700"
              >
                Verificar Variáveis
              </Button>
            </div>
          </div>
        )

      case "setup":
        return (
          <div className="space-y-3">
            <div className="font-bold text-yellow-400">⚠️ Tabelas não existem</div>
            <div className="text-sm">As tabelas do banco de dados precisam ser criadas no Supabase.</div>
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={() => window.open("https://supabase.com/dashboard", "_blank")}
                className="bg-green-600 text-white hover:bg-green-700"
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Abrir Supabase
              </Button>
              <Button
                size="sm"
                onClick={() => window.open("/diagnostico-supabase", "_blank")}
                className="bg-yellow-600 text-white hover:bg-yellow-700"
              >
                Ver SQL
              </Button>
            </div>
          </div>
        )

      case "supabase":
        return (
          <div className="space-y-3">
            <div className="font-bold text-red-400">❌ Erro do Supabase</div>
            <div className="text-sm">
              Código: {connectionStatus.code} - {connectionStatus.error}
            </div>
            {connectionStatus.hint && <div className="text-xs text-gray-400">Dica: {connectionStatus.hint}</div>}
          </div>
        )

      default:
        return (
          <div className="space-y-3">
            <div className="font-bold text-red-400">❌ Erro desconhecido</div>
            <div className="text-sm">{error}</div>
          </div>
        )
    }
  }

  return (
    <Card className="border-blue-900/50 bg-black/30">
      <CardContent className="pt-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold">Lista de Jogadores</h3>
          <div className="flex gap-2">
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
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open("/diagnostico-supabase", "_blank")}
              className="border-yellow-600/50 hover:bg-yellow-900/20 text-yellow-400"
            >
              <Settings className="h-4 w-4 mr-2" />
              Diagnóstico
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={clearAllData}
              className="border-red-600/50 hover:bg-red-900/20 text-red-400"
            >
              <Database className="h-4 w-4 mr-2" />
              Limpar Dados
            </Button>
          </div>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-4 bg-red-900/20 border-red-900/50">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <div className="space-y-4">
                {renderErrorSolution()}

                {debugInfo && (
                  <details className="mt-4">
                    <summary className="cursor-pointer text-xs font-bold">Detalhes técnicos</summary>
                    <pre className="mt-2 p-2 bg-black/30 rounded text-xs overflow-auto">
                      {JSON.stringify({ connectionStatus, debugInfo }, null, 2)}
                    </pre>
                  </details>
                )}
              </div>
            </AlertDescription>
          </Alert>
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
                  Falha na conexão com o banco de dados
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
