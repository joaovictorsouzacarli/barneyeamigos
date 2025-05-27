"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { LogOut, Home } from "lucide-react"

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [admin, setAdmin] = useState<{ username: string } | null>(null)
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
    const storedAdmin = localStorage.getItem("admin")

    if (storedAdmin) {
      setAdmin(JSON.parse(storedAdmin))
    } else {
      router.push("/admin/login")
    }
  }, [router])

  const handleLogout = () => {
    localStorage.removeItem("admin")
    router.push("/admin/login")
  }

  if (!isClient || !admin) {
    return null
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#1f1f23] text-[#8B5CF6] admin-layout">
      <header className="border-b border-gray-700/50 bg-[#2a2a2e]">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/admin/dashboard" className="flex items-center gap-2">
            <div className="relative w-10 h-10 overflow-hidden">
              <Image src="/logo.png" alt="Barney e Seus Amigos Logo" fill className="object-contain" />
            </div>
            <span className="text-xl font-bold text-[#8B5CF6]">BARNEY E SEUS AMIGOS ADMIN</span>
          </Link>
          <div className="flex items-center gap-4">
            <div className="text-sm">
              Logado como <span className="font-bold">{admin.username}</span>
            </div>
            <Link href="/">
              <Button variant="outline" size="sm" className="border-gray-600/50 hover:bg-gray-700/20">
                <Home className="h-4 w-4 mr-2" />
                Página Inicial
              </Button>
            </Link>
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="border-gray-600/50 hover:bg-gray-700/20"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sair
            </Button>
          </div>
        </div>
      </header>
      <main className="flex-1 bg-gradient-to-b from-[#1f1f23] to-gray-800/30">{children}</main>
      <footer className="border-t border-gray-700/50 bg-[#2a2a2e] py-4">
        <div className="container mx-auto px-4 text-center text-[#8B5CF6]/70">
          <p>© {new Date().getFullYear()} Barney e Seus Amigos - Painel Administrativo</p>
        </div>
      </footer>
    </div>
  )
}
