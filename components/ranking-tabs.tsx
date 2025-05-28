"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DpsRanking } from "@/components/dps-ranking"
import { HpsRanking } from "@/components/hps-ranking"
import { ParticipacaoRanking } from "@/components/participacao-ranking"
import { Flame, Heart, Users } from "lucide-react"

export function RankingTabs() {
  return (
    <Tabs defaultValue="dps" className="w-full">
      <TabsList className="grid w-full grid-cols-3 bg-black border border-blue-900/50">
        <TabsTrigger value="dps" className="data-[state=active]:bg-[#00c8ff] data-[state=active]:text-white">
          <Flame className="h-4 w-4 mr-2" />
          TOP DPS
        </TabsTrigger>
        <TabsTrigger value="hps" className="data-[state=active]:bg-[#00c8ff] data-[state=active]:text-white">
          <Heart className="h-4 w-4 mr-2" />
          TOP HPS
        </TabsTrigger>
        <TabsTrigger value="participacao" className="data-[state=active]:bg-[#00c8ff] data-[state=active]:text-white">
          <Users className="h-4 w-4 mr-2" />
          PARTICIPAÇÃO
        </TabsTrigger>
      </TabsList>
      <TabsContent value="dps">
        <DpsRanking />
      </TabsContent>
      <TabsContent value="hps">
        <HpsRanking />
      </TabsContent>
      <TabsContent value="participacao">
        <ParticipacaoRanking />
      </TabsContent>
    </Tabs>
  )
}
