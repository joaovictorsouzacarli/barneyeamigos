"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, CheckCircle, AlertTriangle, XCircle, Database, Plus, Copy, ExternalLink } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function DiagnosticoSupabasePage() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [testeResult, setTesteResult] = useState<any>(null)
  const [envVars, setEnvVars] = useState<any>(null)

  useEffect(() => {
    verificarVariaveisAmbiente()
  }, [])

  const verificarVariaveisAmbiente = async () => {
    try {
      const response = await fetch("/api/verificar-env")
      const data = await response.json()
      setEnvVars(data)
    } catch (err) {
      console.error("Erro ao verificar variáveis:", err)
    }
  }

  const verificarConexao = async () => {
    setLoading(true)
    setError(null)
    setResult(null)
    setTesteResult(null)

    try {
      const baseUrl = window.location.origin
      const response = await fetch(`${baseUrl}/api/test-connection`)

      const data = await response.json()
      setTesteResult(data)

      if (!data.success) {
        setError(data.error || "Erro na conexão")
      }
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
    setResult(null)

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

      setResult(data)

      // Atualizar diagnóstico
      await verificarConexao()
    } catch (err) {
      console.error("Erro:", err)
      setError(err instanceof Error ? err.message : "Erro desconhecido")
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  const sqlCreateTables = `-- Criar tabela de jogadores
CREATE TABLE IF NOT EXISTS players (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar tabela de registros
CREATE TABLE IF NOT EXISTS records (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  player_id UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  class TEXT NOT NULL,
  value INTEGER NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('dps', 'hps')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_records_player_id ON records(player_id);
CREATE INDEX IF NOT EXISTS idx_records_type ON records(type);
CREATE INDEX IF NOT EXISTS idx_records_class ON records(class);
CREATE INDEX IF NOT EXISTS idx_records_value ON records(value);
CREATE INDEX IF NOT EXISTS idx_records_created_at ON records(created_at);

-- Habilitar RLS (Row Level Security)
ALTER TABLE players ENABLE ROW LEVEL SECURITY;
ALTER TABLE records ENABLE ROW LEVEL SECURITY;

-- Criar políticas para permitir todas as operações
CREATE POLICY "Allow all operations on players" ON players
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations on records" ON records
  FOR ALL USING (true) WITH CHECK (true);`

  return (
    <div className="min-h-screen bg-black text-[#00c8ff]">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Diagnóstico do Supabase</h1>

        <div className="grid gap-6 mb-6">
          {/* Variáveis de Ambiente */}
          <Card className="border-blue-900/50 bg-black/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle>Variáveis de Ambiente</CardTitle>
              <CardDescription>Verificação das configurações necessárias</CardDescription>
            </CardHeader>
            <CardContent>
              {envVars ? (
                <div className="space-y-3">
                  {Object.entries(envVars).map(([key, value]) => (
                    <div
                      key={key}
                      className="flex items-center justify-between p-3 border border-blue-900/30 rounded-md"
                    >
                      <span className="font-mono text-sm">{key}</span>
                      <div className="flex items-center gap-2">
                        {value && value !== "" ? (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        ) : (
                          <XCircle className="h-4 w-4 text-red-500" />
                        )}
                        <span className="text-sm">{value && value !== "" ? "Configurado" : "Não configurado"}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4">Carregando...</div>
              )}

              <Alert className="mt-4 bg-blue-900/20 border-blue-900/50">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <div className="space-y-2">
                    <div className="font-bold">Como configurar no Vercel:</div>
                    <ol className="list-decimal list-inside space-y-1 text-sm">
                      <li>Acesse o painel do Vercel</li>
                      <li>Vá em Settings → Environment Variables</li>
                      <li>Adicione as 3 variáveis do Supabase</li>
                      <li>Reimplante o projeto</li>
                    </ol>
                    <Button
                      size="sm"
                      onClick={() => window.open("https://vercel.com/dashboard", "_blank")}
                      className="bg-blue-600 text-white hover:bg-blue-700"
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Abrir Vercel
                    </Button>
                  </div>
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>

          {/* Teste de Conexão */}
          <Card className="border-blue-900/50 bg-black/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle>Teste de Conexão</CardTitle>
              <CardDescription>Verificar se a aplicação consegue se conectar ao Supabase</CardDescription>
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
                        Testar Conexão
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
                        Adicionar Teste
                      </>
                    )}
                  </Button>
                </div>

                {error && (
                  <Alert variant="destructive" className="bg-red-900/20 border-red-900/50">
                    <XCircle className="h-4 w-4" />
                    <AlertDescription>
                      <div className="font-bold">Erro:</div>
                      <div>{error}</div>
                    </AlertDescription>
                  </Alert>
                )}

                {testeResult && (
                  <div
                    className={`p-4 rounded-md ${
                      testeResult.success
                        ? "bg-green-900/20 border border-green-900/50"
                        : "bg-red-900/20 border border-red-900/50"
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      {testeResult.success ? (
                        <CheckCircle className="h-5 w-5 text-green-400" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-400" />
                      )}
                      <span className="font-bold">
                        {testeResult.success ? "Conexão Estabelecida" : "Falha na Conexão"}
                      </span>
                    </div>

                    {testeResult.tables && (
                      <div className="mt-4">
                        <div className="font-bold mb-2">Status das Tabelas:</div>
                        <div className="grid grid-cols-2 gap-4">
                          {Object.entries(testeResult.tables).map(([tableName, tableInfo]: [string, any]) => (
                            <div key={tableName} className="p-2 bg-black/30 rounded">
                              <div className="flex items-center gap-2">
                                {tableInfo.exists ? (
                                  <CheckCircle className="h-4 w-4 text-green-400" />
                                ) : (
                                  <XCircle className="h-4 w-4 text-red-400" />
                                )}
                                <span className="font-bold">{tableName}</span>
                              </div>
                              <div className="text-sm text-gray-400">
                                {tableInfo.exists ? `${tableInfo.count} registros` : "Não existe"}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {result && (
                  <Alert className="bg-green-900/20 border-green-900/50">
                    <CheckCircle className="h-4 w-4" />
                    <AlertDescription>
                      <div className="font-bold text-green-400">Registro de teste criado!</div>
                      <div className="mt-2">
                        <div>Jogador: {result.player.name}</div>
                        <div>DPS: {result.records.dps.value.toLocaleString()}</div>
                        <div>HPS: {result.records.hps.value.toLocaleString()}</div>
                      </div>
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            </CardContent>
          </Card>

          {/* SQL para criar tabelas */}
          <Card className="border-blue-900/50 bg-black/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle>Criar Tabelas Manualmente</CardTitle>
              <CardDescription>Se as tabelas não existirem, use este SQL no Supabase</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="relative">
                  <pre className="bg-black/50 p-4 rounded text-xs overflow-x-auto border border-blue-900/30">
                    {sqlCreateTables}
                  </pre>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="absolute top-2 right-2"
                    onClick={() => copyToClipboard(sqlCreateTables)}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>

                <Alert className="bg-yellow-900/20 border-yellow-900/50">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    <div className="space-y-2">
                      <div className="font-bold">Instruções:</div>
                      <ol className="list-decimal list-inside space-y-1 text-sm">
                        <li>Copie o SQL acima</li>
                        <li>Acesse o painel do Supabase</li>
                        <li>Vá em SQL Editor</li>
                        <li>Cole e execute o código</li>
                        <li>Volte aqui e teste novamente</li>
                      </ol>
                      <Button
                        size="sm"
                        onClick={() => window.open("https://supabase.com/dashboard", "_blank")}
                        className="bg-green-600 text-white hover:bg-green-700"
                      >
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Abrir Supabase
                      </Button>
                    </div>
                  </AlertDescription>
                </Alert>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
