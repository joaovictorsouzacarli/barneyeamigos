import { RankingTabs } from "@/components/ranking-tabs"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"

export default function Home() {
  return (
    <main className="min-h-screen bg-[#1f1f23] text-[#8B5CF6]">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-center mb-8">Ranking de Caçadas</h1>
        <RankingTabs />
      </div>
      <Footer />
    </main>
  )
}
