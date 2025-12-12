"use client"

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts"

interface EmotionChartData {
  name: string
  value: number
  color: string
}

interface EmotionPieChartProps {
  data: EmotionChartData[]
  height?: number
  outerRadius?: number
  showLabel?: boolean
  showMobile?: boolean
}

export default function EmotionPieChart({
  data,
  height = 450,
  outerRadius = 140,
  showLabel = true,
  showMobile = false,
}: EmotionPieChartProps) {
  if (data.length === 0) {
    return (
      <div className="py-8 text-center">
        <p className="text-sm text-gray-600 sm:text-base">Check in to see the global emotion distribution!</p>
      </div>
    )
  }

  return (
    <>
      {showMobile && (
        <ResponsiveContainer width="100%" height={300} className="sm:hidden">
          <PieChart>
            <Pie data={data} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={false}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip />
            <Legend wrapperStyle={{ fontSize: "12px" }} />
          </PieChart>
        </ResponsiveContainer>
      )}
      <ResponsiveContainer width="100%" height={height} className={showMobile ? "hidden sm:block" : undefined}>
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            outerRadius={outerRadius}
            label={showLabel ? (entry) => `${entry.name}: ${entry.value}` : showLabel}
            labelLine={showLabel ? { stroke: "#666", strokeWidth: 1 } : false}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip />
          <Legend wrapperStyle={showLabel ? { paddingTop: "20px" } : undefined} />
        </PieChart>
      </ResponsiveContainer>
    </>
  )
}
