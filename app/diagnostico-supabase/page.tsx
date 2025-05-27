"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, CheckCircle, AlertTriangle, XCircle, Database, Plus } from "lucide-react"

export default function DiagnosticoSupabasePage() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [testeResult, setTesteResult] = useState<any>(null)

  const verificarConexao = async () => {
    setLoading(true)
    setError(null)
    setResult(null)
    setTesteResult(null)

    try {
      const baseUrl = window.location.origin
      const response = await fetch(`${baseUrl}/api/sincronizar-dados`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Erro ao verificar conexão")
      }

      setResult(data)
    } catch (err) {
      console.error("Erro:", err)
      setError(err instanceof Error ? err.message : "Erro desconhecido")
    } finally {
      setLoading(false)
    }
  }

  const adicionarRegistroTeste = async () => {
    setLoading(true)
    setError(null)
    setTesteResult(null)

    try {
      const baseUrl = window.location.origin
      const response = await fetch(`${baseUrl}/api/adicionar-registro-teste`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Erro ao adicionar registro de teste")
      }

      setTesteResult(data)

      // Atualizar diagnóstico
      await verificarConexao()
    } catch (err) {
      console.error("Erro:", err)
      setError(err instanceof Error ? err.message : "Erro desconhecido")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-black text-[#00c8ff]">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Diagnóstico do Supabase</h1>

        <div className="grid gap-6 mb-6">
          <Card className="border-blue-900/50 bg-black/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle>Verificar Conexão com o Supabase</CardTitle>
              <CardDescription>Verifica se a aplicação consegue se conectar ao banco de dados Supabase</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-4">
                <div className="flex flex-wrap gap-4">
                  <Button
                    onClick={verificarConexao}
                    disabled={loading}
                    className="bg-[#00c8ff] text-black hover:bg-[#00c8ff]/80"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Verificando...
                      </>
                    ) : (
                      <>
                        <Database className="mr-2 h-4 w-4" />
                        Verificar Conexão
                      </>
                    )}
                  </Button>

                  <Button
                    onClick={adicionarRegistroTeste}
                    disabled={loading}
                    className="bg-green-600 text-white hover:bg-green-700"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Adicionando...
                      </>
                    ) : (
                      <>
                        <Plus className="mr-2 h-4 w-4" />
                        Adicionar Registro de Teste
                      </>
                    )}
                  </Button>

                  <Button
                    onClick={() => (window.location.href = "/verificar-env")}
                    className="bg-blue-600 text-white hover:bg-blue-700"
                  >
                    Verificar Variáveis de Ambiente
                  </Button>
                </div>

                {error && (
                  <div className="p-4 bg-red-900/20 border border-red-900/50 rounded-md text-red-400">
                    <div className="flex items-center gap-2 mb-2">
                      <XCircle className="h-5 w-5" />
                      <span className="font-bold">Erro</span>
                    </div>
                    {error}
                  </div>
                )}

                {testeResult && (
                  <div className="p-4 bg-green-900/20 border border-green-900/50 rounded-md">
                    <div className="flex items-center gap-2 mb-2 text-green-400">
                      <CheckCircle className="h-5 w-5" />
                      <span className="font-bold">Registro de teste adicionado com sucesso!</span>
                    </div>
                    <div className="mt-2">
                      <p>
                        <strong>Jogador:</strong> {testeResult.player.name}
                      </p>
                      <p>
                        <strong>DPS:</strong> {testeResult.records.dps.value.toLocaleString()}
                      </p>
                      <p>
                        <strong>HPS:</strong> {testeResult.records.hps.value.toLocaleString()}
                      </p>
                    </div>
                  </div>
                )}

                {result && (
                  <div className="p-4 bg-blue-900/20 border border-blue-900/50 rounded-md">
                    <h3 className="font-bold text-lg mb-4">Resultado da Verificação</h3>

                    {result.success && (
                      <div className="flex items-center gap-2 mb-4 text-green-400">
                        <CheckCircle className="h-5 w-5" />
                        <span>Conexão com o Supabase estabelecida com sucesso!</span>
                      </div>
                    )}

                    {result.stats && (
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                          <div className="p-3 bg-blue-900/10 border border-blue-900/30 rounded-md">
                            <div className="text-xl font-bold">{result.stats.players}</div>
                            <div className="text-sm text-[#00c8ff]/70">Jogadores</div>
                          </div>
                          <div className="p-3 bg-blue-900/10 border border-blue-900/30 rounded-md">
                            <div className="text-xl font-bold">{result.stats.records}</div>
                            <div className="text-sm text-[#00c8ff]/70">Registros Totais</div>
                          </div>
                          <div className="p-3 bg-blue-900/10 border border-blue-900/30 rounded-md">
                            <div className="text-xl font-bold">{result.stats.dpsRecords}</div>
                            <div className="text-sm text-[#00c8ff]/70">Registros DPS</div>
                          </div>
                          <div className="p-3 bg-blue-900/10 border border-blue-900/30 rounded-md">
                            <div className="text-xl font-bold">{result.stats.hpsRecords}</div>
                            <div className="text-sm text-[#00c8ff]/70">Registros HPS</div>
                          </div>
                        </div>

                        {result.stats.orphanedRecords > 0 && (
                          <div className="p-3 bg-yellow-900/20 border border-yellow-900/50 rounded-md">
                            <div className="flex items-center gap-2 mb-2 text-yellow-400">
                              <AlertTriangle className="h-5 w-5" />
                              <span className="font-bold">Atenção</span>
                            </div>
                            <p>
                              Encontrados {result.stats.orphanedRecords} registros sem jogador associado. Isso pode
                              causar problemas na exibição do ranking.
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                <div className="p-4 bg-blue-900/20 border border-blue-900/50 rounded-md">
                  <h3 className="font-bold text-lg mb-4">Instruções para Resolver Problemas</h3>

                  <ol className="list-decimal list-inside space-y-2">
                    <li>Verifique se as variáveis de ambiente do Supabase estão configuradas corretamente</li>
                    <li>
                      Certifique-se de que a chave de serviço (service role key) está configurada para operações
                      administrativas
                    </li>
                    <li>Verifique se as tabelas "players" e "records" existem no banco de dados</li>
                    <li>Verifique se a relação entre as tabelas está configurada corretamente</li>
                    <li>Use o botão "Adicionar Registro de Teste" para criar dados de teste</li>
                    <li>Acesse a página de sincronização para corrigir relações entre jogadores e registros</li>
                  </ol>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
