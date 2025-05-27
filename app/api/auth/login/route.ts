import { NextResponse } from "next/server"

// Credenciais fixas dos administradores
const ADMIN_USERS = [
  {
    username: "TioBarney",
    password: "javalol",
    role: "admin",
  },
  {
    username: "delimb",
    password: "admin123",
    role: "admin",
  },
  {
    username: "Bacon",
    password: "admin123",
    role: "admin",
  },
]

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { username, password } = body

    console.log("Tentativa de login:", { username })

    // Verificar se as credenciais correspondem a algum dos usuários administradores
    const adminUser = ADMIN_USERS.find((user) => user.username === username && user.password === password)

    if (adminUser) {
      console.log("Login bem-sucedido para:", username)

      // Retornar informações do usuário (sem senha)
      return NextResponse.json({
        username: adminUser.username,
        role: adminUser.role,
      })
    }

    // Credenciais inválidas
    console.log("Credenciais inválidas para:", username)
    return NextResponse.json({ error: "Credenciais inválidas" }, { status: 401 })
  } catch (error) {
    console.error("Erro no login:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
