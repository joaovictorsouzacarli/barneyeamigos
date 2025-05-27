"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "@/components/ui/use-toast"
import { Toaster } from "@/components/ui/toaster"
import { Check, Loader2 } from "lucide-react"

// Classes de DPS disponíveis
const DPS_CLASSES = [
  "FULGURANTE",
  "FURA-BRUMA",
  "ÁGUIA",
  "CHAMA SOMBRA",
  "ADAGAS",
  "FROST",
  "ENDEMONIADO",
  "QUEBRA REINO",
  "REPETIDOR", // Nova classe adicionada
]

// Classe de HPS disponível
const HPS_CLASSES = ["QUEDA SANTA"]

export function PlayerForm() {
  const [formData, setFormData] = useState({
    playerName: "",
    type: "dps", // dps ou hps
    class: DPS_CLASSES[0],
    value: "",
  })
  const [loading, setLoading] = useState(false)
  const [debugInfo, setDebugInfo] = useState<any>(null)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleTypeChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      type: value,
      class: value === "dps" ? DPS_CLASSES[0] : HPS_CLASSES[0],
    }))
  }

  const handleClassChange = (value: string) => {
    setFormData((prev) => ({ ...prev, class: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setDebugInfo(null)

    // Validação básica
    if (!formData.playerName || !formData.class || !formData.value) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos",
        variant: "destructive",
      })
      setLoading(false)
      return
    }

    // Validação do valor numérico
    const valueNum = Number(formData.value)
    if (isNaN(valueNum) || valueNum <= 0) {
      toast({
        title: "Erro",
        description: "O valor deve ser um número positivo",
        variant: "destructive",
      })
      setLoading(false)
      return
    }

    try {
      const requestData = {
        playerName: formData.playerName,
        class: formData.class,
        value: formData.value,
        type: formData.type,
      }

      console.log("Enviando dados:", requestData)

      const baseUrl = window.location.origin
      const response = await fetch(`${baseUrl}/api/records`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestData),
      })

      const responseText = await response.text()
      console.log("Resposta bruta do servidor:", responseText)

      let data
      try {
        data = JSON.parse(responseText)
      } catch (parseError) {
        console.error("Erro ao analisar resposta JSON:", parseError)
        throw new Error(`Resposta inválida do servidor: ${responseText}`)
      }

      console.log("Resposta do servidor:", data)
      setDebugInfo({
        request: requestData,
        response: data,
        status: response.status,
        responseText: responseText.length > 1000 ? responseText.substring(0, 1000) + "..." : responseText,
      })

      if (!response.ok) {
        throw new Error(data.error || "Erro ao adicionar registro")
      }

      toast({
        title: "Sucesso",
        description: "Registro adicionado com sucesso",
      })

      // Resetar formulário
      setFormData({
        playerName: "",
        type: "dps",
        class: DPS_CLASSES[0],
        value: "",
      })
    } catch (error) {
      console.error("Erro:", error)
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Erro ao adicionar registro",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="border-blue-900/50 bg-black/30">
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="playerName">Nome do Jogador</Label>
            <Input
              id="playerName"
              name="playerName"
              value={formData.playerName}
              onChange={handleChange}
              placeholder="Digite o nome do jogador"
              className="bg-black/50 border-blue-900/50"
            />
          </div>

          <div className="space-y-2">
            <Label>Tipo de Registro</Label>
            <RadioGroup value={formData.type} onValueChange={handleTypeChange} className="flex space-x-4">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="dps" id="dps" className="border-[#00c8ff] text-[#00c8ff]" />
                <Label htmlFor="dps">DPS (Dano)</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="hps" id="hps" className="border-[#00c8ff] text-[#00c8ff]" />
                <Label htmlFor="hps">HPS (Cura)</Label>
              </div>
            </RadioGroup>
          </div>

          <div className="space-y-2">
            <Label htmlFor="class">Classe</Label>
            <Select value={formData.class} onValueChange={handleClassChange}>
              <SelectTrigger className="bg-black/50 border-blue-900/50">
                <SelectValue placeholder="Selecione a classe" />
              </SelectTrigger>
              <SelectContent className="bg-black border-blue-900/50">
                {formData.type === "dps"
                  ? DPS_CLASSES.map((dpsClass) => (
                      <SelectItem key={dpsClass} value={dpsClass}>
                        {dpsClass}
                      </SelectItem>
                    ))
                  : HPS_CLASSES.map((hpsClass) => (
                      <SelectItem key={hpsClass} value={hpsClass}>
                        {hpsClass}
                      </SelectItem>
                    ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="value">{formData.type === "dps" ? "Valor de DPS" : "Valor de HPS"}</Label>
            <Input
              id="value"
              name="value"
              value={formData.value}
              onChange={handleChange}
              placeholder="Digite o valor"
              type="number"
              min="1"
              className="bg-black/50 border-blue-900/50"
            />
          </div>

          <Button type="submit" className="w-full bg-[#00c8ff] text-black hover:bg-[#00c8ff]/80" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Salvando...
              </>
            ) : (
              <>
                Salvar Registro
                <Check className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </form>

        {debugInfo && (
          <div className="mt-4 p-4 border border-blue-900/50 rounded-md bg-black/50 text-xs overflow-auto">
            <h3 className="font-bold mb-2">Informações de Depuração:</h3>
            <pre>{JSON.stringify(debugInfo, null, 2)}</pre>
          </div>
        )}

        <Toaster />
      </CardContent>
    </Card>
  )
}
