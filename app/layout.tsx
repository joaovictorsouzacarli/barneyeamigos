import type React from "react"
import type { Metadata } from "next"
import "./globals.css"

export const metadata: Metadata = {
  title: "Barney e Seus Amigos - Ranking de Caçadas",
  description: "Sistema de ranking para caçadas de Albion Online da guilda Barney e Seus Amigos",
  keywords: ["Albion Online", "Ranking", "DPS", "HPS", "Caçadas", "Barney e Seus Amigos"],
  authors: [{ name: "Barney e Seus Amigos" }],
  openGraph: {
    title: "Barney e Seus Amigos - Ranking de Caçadas",
    description: "Sistema de ranking para caçadas de Albion Online da guilda Barney e Seus Amigos",
    type: "website",
    locale: "pt_BR",
  },
  twitter: {
    card: "summary_large_image",
    title: "Barney e Seus Amigos - Ranking de Caçadas",
    description: "Sistema de ranking para caçadas de Albion Online da guilda Barney e Seus Amigos",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
