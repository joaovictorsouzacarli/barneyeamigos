import Image from "next/image"

export function Header() {
  return (
    <header className="bg-[#1e293b] border-b border-[#334155] px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Image src="/logo.png" alt="Barney e Seus Amigos" width={50} height={50} className="rounded-full" />
          <h1 className="text-2xl font-bold text-[#8B5CF6]">BARNEY E SEUS AMIGOS</h1>
        </div>
      </div>
    </header>
  )
}
