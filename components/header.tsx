import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export function Header() {
  return (
    <header className="bg-[#1e293b] border-b border-[#334155] px-6 py-4">
      <div className="flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3">
          <Image src="/logo.png" alt="Barney e Seus Amigos" width={50} height={50} className="rounded-full" />
          <h1 className="text-2xl font-bold text-[#8B5CF6]">BARNEY E SEUS AMIGOS</h1>
        </Link>
        <nav className="flex items-center gap-4">
          <Link href="/admin/login">
            <Button variant="outline" className="border-[#8B5CF6] text-[#8B5CF6] hover:bg-[#8B5CF6]/10 bg-transparent">
              Área Administrativa
            </Button>
          </Link>
        </nav>
      </div>
    </header>
  )
}
