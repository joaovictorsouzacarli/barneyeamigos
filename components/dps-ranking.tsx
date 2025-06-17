import type React from "react"

interface DPSRankingProps {
  dpsData: {
    class: string
    dps: number
  }[]
}

const DPSRanking: React.FC<DPSRankingProps> = ({ dpsData }) => {
  const classColors: { [key: string]: string } = {
    PALADINO: "#ef4444",
    ARCANISTA: "#3b82f6",
    CACADOR: "#14b8a6",
    BARDO: "#a855f7",
    FEITICEIRO: "#10b981", // Renomeado de "QUEBRA REINO"
    GUERREIRO: "#dc2626",
    LADINO: "#eab308",
    MONGE: "#9ca3af",
    NECROMANTE: "#c084fc",
    SACERDOTE: "#f472b6",
  }

  const sortedDPSData = [...dpsData].sort((a, b) => b.dps - a.dps)

  return (
    <div>
      <h2>DPS Ranking</h2>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th style={{ border: "1px solid #ddd", padding: "8px", textAlign: "left" }}>Class</th>
            <th style={{ border: "1px solid #ddd", padding: "8px", textAlign: "left" }}>DPS</th>
          </tr>
        </thead>
        <tbody>
          {sortedDPSData.map((item, index) => (
            <tr key={index}>
              <td style={{ border: "1px solid #ddd", padding: "8px", color: classColors[item.class] || "black" }}>
                {item.class}
              </td>
              <td style={{ border: "1px solid #ddd", padding: "8px" }}>{item.dps}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default DPSRanking
