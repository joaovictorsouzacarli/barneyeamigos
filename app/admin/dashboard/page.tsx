"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { AdminLayout } from "@/components/admin-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PlayerForm } from "@/components/player-form"
import { PlayersList } from "@/components/players-list"
import { RecordsManagement } from "@/components/records-management"
import { Users } from "lucide-react"

export default function DashboardPage() {
  const router = useRouter()
  const [isClient, setIsClient] = useState(false)
  const [admin, setAdmin] = useState<{ username: string } | null>(null)

  useEffect(() => {
    setIsClient(true)
    const storedAdmin = localStorage.getItem("admin")

    if (storedAdmin) {
      setAdmin(JSON.parse(storedAdmin))
    } else {
      router.push("/admin/login")
    }
  }, [router])

  if (!isClient || !admin) {
    return null
  }

  return (
    <AdminLayout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Painel Administrativo</h1>

        <div className="grid gap-6">
          <Card className="border-blue-900/50 bg-black/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-2">
                <Users className="h-5 w-5" />
                Gerenciar Jogadores e Rankings
              </CardTitle>
              <CardDescription>Adicione, edite ou remova jogadores e seus valores de DPS/HPS</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="list" className="w-full">
                <TabsList className="grid w-full grid-cols-3 bg-black border border-blue-900/50 mb-6">
                  <TabsTrigger value="list" className="data-[state=active]:bg-[#00c8ff] data-[state=active]:text-black">
                    Lista de Jogadores
                  </TabsTrigger>
                  <TabsTrigger value="add" className="data-[state=active]:bg-[#00c8ff] data-[state=active]:text-black">
                    Adicionar Registro
                  </TabsTrigger>
                  <TabsTrigger
                    value="records"
                    className="data-[state=active]:bg-[#00c8ff] data-[state=active]:text-black"
                  >
                    Gerenciar Registros
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="list">
                  <PlayersList />
                </TabsContent>
                <TabsContent value="add">
                  <PlayerForm />
                </TabsContent>
                <TabsContent value="records">
                  <RecordsManagement />
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  )
}
