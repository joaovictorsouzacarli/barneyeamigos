import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ReadingModeToggle } from "@/components/reading-mode-toggle"

export function Header() {
  return (
    <header className="border-b border-gray-700/50 bg-[#2a2a2e]">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link href="/" className="flex items-center gap-2">
          <div className="relative w-16 h-16 overflow-hidden">
            <Image src="/logo.png" alt="Barney e Seus Amigos Logo" fill className="object-contain" />
          </div>
          <span className="text-2xl font-bold text-[#8B5CF6]">BARNEY E SEUS AMIGOS</span>
        </Link>
        <nav className="flex items-center gap-4">
          <ReadingModeToggle />
          <Link href="/admin/login">
            <Button variant="outline" className="border-[#8B5CF6] text-[#8B5CF6] hover:bg-[#8B5CF6]/10">
              Área Administrativa
            </Button>
          </Link>
        </nav>
      </div>
    </header>
  )
}
