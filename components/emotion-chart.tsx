"use client"

import { useMemo } from "react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts"
import { format } from "date-fns"

interface Emotion {
  id: string
  name: string
  color_primary: string
  emoji: string
}

interface CheckIn {
  id: string
  emotion_id: string
  intensity: number
  created_at: string
  emotions: Emotion
}

export default function EmotionChart({ checkIns, emotions }: { checkIns: CheckIn[]; emotions: Emotion[] }) {
  const chartData = useMemo(() => {
    // Group check-ins by date
    const dataByDate: Record<string, any> = {}

    checkIns.forEach((checkIn) => {
      const date = format(new Date(checkIn.created_at), "MMM dd")
      if (!dataByDate[date]) {
        dataByDate[date] = { date }
      }
      const emotionName = checkIn.emotions.name
      dataByDate[date][emotionName] = checkIn.intensity
    })

    return Object.values(dataByDate)
  }, [checkIns])

  // Get unique emotions from check-ins
  const uniqueEmotions = useMemo(() => {
    const emotionIds = new Set(checkIns.map((c) => c.emotion_id))
    return emotions.filter((e) => emotionIds.has(e.id))
  }, [checkIns, emotions])

  if (checkIns.length === 0) {
    return (
      <div className="flex h-80 items-center justify-center text-muted-foreground">
        No data available for the selected period
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={400}>
      <LineChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
        <XAxis dataKey="date" className="text-xs" />
        <YAxis domain={[0, 5]} className="text-xs" />
        <Tooltip
          contentStyle={{
            backgroundColor: "hsl(var(--background))",
            border: "1px solid hsl(var(--border))",
            borderRadius: "8px",
          }}
        />
        <Legend />
        {uniqueEmotions.map((emotion) => (
          <Line
            key={emotion.id}
            type="monotone"
            dataKey={emotion.name}
            stroke={emotion.color_primary}
            strokeWidth={2}
            dot={{ r: 4 }}
            activeDot={{ r: 6 }}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  )
}
