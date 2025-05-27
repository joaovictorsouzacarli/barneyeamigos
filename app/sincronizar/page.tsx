"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, CheckCircle, AlertTriangle, XCircle, RefreshCw, Database } from "lucide-react"

export default function SincronizarPage() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [correcaoResult, setCorrecaoResult] = useState<any>(null)
  const [debugInfo, setDebugInfo] = useState<any>(null)

  const sincronizarDados = async () => {
    setLoading(true)
    setError(null)
    setResult(null)
    setDebugInfo(null)

    try {
      // Usar o caminho absoluto para evitar problemas com a URL base
      const baseUrl = window.location.origin
      const url = `${baseUrl}/api/sincronizar-dados`

      console.log("Fazendo requisição para:", url)

      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      })

      const responseText = await response.text()
      console.log("Resposta bruta:", responseText)

      let data
      try {
        data = JSON.parse(responseText)
      } catch (parseError) {
        console.error("Erro ao analisar resposta JSON:", parseError)
        throw new Error(`Resposta inválida do servidor: ${responseText}`)
      }

      setDebugInfo({
        url,
        status: response.status,
        responseText: responseText.length > 1000 ? responseText.substring(0, 1000) + "..." : responseText,
      })

      if (!response.ok) {
        throw new Error(data.error || "Erro ao sincronizar dados")
      }

      setResult(data)
    } catch (err) {
      console.error("Erro:", err)
      setError(err instanceof Error ? err.message : "Erro desconhecido")
    } finally {
      setLoading(false)
    }
  }

  const testarRankings = async () => {
    setLoading(true)
    setError(null)
    setDebugInfo(null)

    try {
      // Usar o caminho absoluto para evitar problemas com a URL base
      const baseUrl = window.location.origin

      // Testar DPS
      const dpsUrl = `${baseUrl}/api/rankings?type=dps`
      console.log("Testando ranking DPS:", dpsUrl)

      const dpsResponse = await fetch(dpsUrl)
      const dpsResponseText = await dpsResponse.text()

      let dpsData
      try {
        dpsData = JSON.parse(dpsResponseText)
      } catch (parseError) {
        console.error("Erro ao analisar resposta JSON (DPS):", parseError)
        throw new Error(`Resposta inválida do servidor (DPS): ${dpsResponseText}`)
      }

      // Testar HPS
      const hpsUrl = `${baseUrl}/api/rankings?type=hps`
      console.log("Testando ranking HPS:", hpsUrl)

      const hpsResponse = await fetch(hpsUrl)
      const hpsResponseText = await hpsResponse.text()

      let hpsData
      try {
        hpsData = JSON.parse(hpsResponseText)
      } catch (parseError) {
        console.error("Erro ao analisar resposta JSON (HPS):", parseError)
        throw new Error(`Resposta inválida do servidor (HPS): ${hpsResponseText}`)
      }

      setDebugInfo({
        dps: {
          url: dpsUrl,
          status: dpsResponse.status,
          responseText: dpsResponseText.length > 1000 ? dpsResponseText.substring(0, 1000) + "..." : dpsResponseText,
        },
        hps: {
          url: hpsUrl,
          status: hpsResponse.status,
          responseText: hpsResponseText.length > 1000 ? hpsResponseText.substring(0, 1000) + "..." : hpsResponseText,
        },
      })

      setResult((prev: any) => ({
        ...prev,
        rankingTest: {
          dps: {
            status: dpsResponse.ok ? "success" : "error",
            count: Array.isArray(dpsData) ? dpsData.length : 0,
            data: Array.isArray(dpsData) ? dpsData.slice(0, 3) : dpsData,
          },
          hps: {
            status: hpsResponse.ok ? "success" : "error",
            count: Array.isArray(hpsData) ? hpsData.length : 0,
            data: Array.isArray(hpsData) ? hpsData.slice(0, 3) : hpsData,
          },
        },
      }))
    } catch (err) {
      console.error("Erro:", err)
      setError(err instanceof Error ? err.message : "Erro desconhecido")
    } finally {
      setLoading(false)
    }
  }

  const corrigirRelacoes = async () => {
    setLoading(true)
    setError(null)
    setCorrecaoResult(null)
    setDebugInfo(null)

    try {
      // Usar o caminho absoluto para evitar problemas com a URL base
      const baseUrl = window.location.origin
      const url = `${baseUrl}/api/corrigir-relacoes`

      console.log("Fazendo requisição para:", url)

      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      })

      const responseText = await response.text()
      console.log("Resposta bruta:", responseText)

      let data
      try {
        data = JSON.parse(responseText)
      } catch (parseError) {
        console.error("Erro ao analisar resposta JSON:", parseError)
        throw new Error(`Resposta inválida do servidor: ${responseText}`)
      }

      setDebugInfo({
        url,
        status: response.status,
        responseText: responseText.length > 1000 ? responseText.substring(0, 1000) + "..." : responseText,
      })

      if (!response.ok) {
        throw new Error(data.error || "Erro ao corrigir relações")
      }

      setCorrecaoResult(data)
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
        <h1 className="text-3xl font-bold mb-6">Sincronização de Dados</h1>

        <div className="grid gap-6 mb-6">
          <Card className="border-blue-900/50 bg-black/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle>Sincronizar Dados do Supabase</CardTitle>
              <CardDescription>Verifica e sincroniza os dados entre o banco de dados e a aplicação</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-4">
                <div className="flex flex-wrap gap-4">
                  <Button
                    onClick={sincronizarDados}
                    disabled={loading}
                    className="bg-[#00c8ff] text-black hover:bg-[#00c8ff]/80"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Sincronizando...
                      </>
                    ) : (
                      "Sincronizar Dados"
                    )}
                  </Button>

                  <Button
                    onClick={testarRankings}
                    disabled={loading}
                    className="bg-blue-600 text-white hover:bg-blue-700"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Testando...
                      </>
                    ) : (
                      "Testar Rankings"
                    )}
                  </Button>

                  <Button
                    onClick={corrigirRelacoes}
                    disabled={loading}
                    className="bg-green-600 text-white hover:bg-green-700"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Corrigindo...
                      </>
                    ) : (
                      <>
                        <Database className="mr-2 h-4 w-4" />
                        Corrigir Relações
                      </>
                    )}
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

                {debugInfo && (
                  <div className="p-4 bg-gray-900/20 border border-gray-900/50 rounded-md text-xs overflow-auto">
                    <h3 className="font-bold mb-2">Informações de Depuração:</h3>
                    <pre>{JSON.stringify(debugInfo, null, 2)}</pre>
                  </div>
                )}

                {result && (
                  <div className="p-4 bg-blue-900/20 border border-blue-900/50 rounded-md">
                    <h3 className="font-bold text-lg mb-4">Resultado da Sincronização</h3>

                    {result.success && (
                      <div className="flex items-center gap-2 mb-4 text-green-400">
                        <CheckCircle className="h-5 w-5" />
                        <span>Sincronização concluída com sucesso!</span>
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
                            <Button
                              onClick={corrigirRelacoes}
                              className="mt-2 bg-yellow-600 text-white hover:bg-yellow-700"
                              size="sm"
                            >
                              <RefreshCw className="mr-2 h-4 w-4" />
                              Corrigir Relações
                            </Button>
                          </div>
                        )}
                      </div>
                    )}

                    {result.rankingTest && (
                      <div className="mt-4">
                        <h3 className="font-bold text-lg mb-4">Teste de Rankings</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <h4 className="font-bold mb-2">Ranking DPS</h4>
                            <div
                              className={`p-3 rounded-md ${
                                result.rankingTest.dps.status === "success"
                                  ? "bg-green-900/20 border border-green-900/50"
                                  : "bg-red-900/20 border border-red-900/50"
                              }`}
                            >
                              <p>
                                Status:{" "}
                                <span
                                  className={
                                    result.rankingTest.dps.status === "success" ? "text-green-400" : "text-red-400"
                                  }
                                >
                                  {result.rankingTest.dps.status === "success" ? "Sucesso" : "Erro"}
                                </span>
                              </p>
                              <p>
                                Registros encontrados: <span className="font-bold">{result.rankingTest.dps.count}</span>
                              </p>
                              {result.rankingTest.dps.count > 0 && (
                                <div className="mt-2">
                                  <p className="text-sm font-bold">Primeiros registros:</p>
                                  <pre className="text-xs mt-1 overflow-auto max-h-40">
                                    {JSON.stringify(result.rankingTest.dps.data, null, 2)}
                                  </pre>
                                </div>
                              )}
                            </div>
                          </div>

                          <div>
                            <h4 className="font-bold mb-2">Ranking HPS</h4>
                            <div
                              className={`p-3 rounded-md ${
                                result.rankingTest.hps.status === "success"
                                  ? "bg-green-900/20 border border-green-900/50"
                                  : "bg-red-900/20 border border-red-900/50"
                              }`}
                            >
                              <p>
                                Status:{" "}
                                <span
                                  className={
                                    result.rankingTest.hps.status === "success" ? "text-green-400" : "text-red-400"
                                  }
                                >
                                  {result.rankingTest.hps.status === "success" ? "Sucesso" : "Erro"}
                                </span>
                              </p>
                              <p>
                                Registros encontrados: <span className="font-bold">{result.rankingTest.hps.count}</span>
                              </p>
                              {result.rankingTest.hps.count > 0 && (
                                <div className="mt-2">
                                  <p className="text-sm font-bold">Primeiros registros:</p>
                                  <pre className="text-xs mt-1 overflow-auto max-h-40">
                                    {JSON.stringify(result.rankingTest.hps.data, null, 2)}
                                  </pre>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {correcaoResult && (
                  <div className="p-4 bg-green-900/20 border border-green-900/50 rounded-md">
                    <h3 className="font-bold text-lg mb-4">Resultado da Correção de Relações</h3>

                    <div className="flex items-center gap-2 mb-4 text-green-400">
                      <CheckCircle className="h-5 w-5" />
                      <span>Correção concluída!</span>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                      <div className="p-3 bg-blue-900/10 border border-blue-900/30 rounded-md">
                        <div className="text-xl font-bold">{correcaoResult.stats.totalRecords}</div>
                        <div className="text-sm text-[#00c8ff]/70">Registros Totais</div>
                      </div>
                      <div className="p-3 bg-blue-900/10 border border-blue-900/30 rounded-md">
                        <div className="text-xl font-bold">{correcaoResult.stats.orphanedRecords}</div>
                        <div className="text-sm text-[#00c8ff]/70">Registros Órfãos</div>
                      </div>
                      <div className="p-3 bg-green-900/10 border border-green-900/30 rounded-md">
                        <div className="text-xl font-bold">{correcaoResult.stats.corrected}</div>
                        <div className="text-sm text-green-400">Registros Corrigidos</div>
                      </div>
                      {correcaoResult.stats.failed > 0 && (
                        <div className="p-3 bg-red-900/10 border border-red-900/30 rounded-md">
                          <div className="text-xl font-bold">{correcaoResult.stats.failed}</div>
                          <div className="text-sm text-red-400">Falhas</div>
                        </div>
                      )}
                    </div>

                    <Button
                      onClick={sincronizarDados}
                      className="bg-[#00c8ff] text-black hover:bg-[#00c8ff]/80"
                      size="sm"
                    >
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Atualizar Diagnóstico
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
