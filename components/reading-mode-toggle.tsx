"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Sun, Moon } from "lucide-react"

export function ReadingModeToggle() {
  const [isLightMode, setIsLightMode] = useState(false)

  useEffect(() => {
    // Verificar se estamos no cliente antes de acessar localStorage
    if (typeof window !== "undefined") {
      // Carregar preferência do usuário
      const savedMode = localStorage.getItem("light-mode") === "true"
      setIsLightMode(savedMode)

      // Aplicar classe ao documento
      if (savedMode) {
        document.documentElement.classList.add("light-mode")
      }
    }
  }, [])

  const toggleLightMode = () => {
    const newMode = !isLightMode
    setIsLightMode(newMode)

    // Salvar preferência
    localStorage.setItem("light-mode", String(newMode))

    // Aplicar/remover classe
    if (newMode) {
      document.documentElement.classList.add("light-mode")
    } else {
      document.documentElement.classList.remove("light-mode")
    }
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleLightMode}
      className="rounded-full hover:bg-[#00c8ff]/10"
      title={isLightMode ? "Modo escuro" : "Modo leitura"}
    >
      {isLightMode ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
      <span className="sr-only">{isLightMode ? "Modo escuro" : "Modo leitura"}</span>
    </Button>
  )
}
