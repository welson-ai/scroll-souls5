interface EmotionChartData {
  name: string
  value: number
  color: string
}

interface EmotionBarChartProps {
  data: EmotionChartData[]
  showMobile?: boolean
}

export default function EmotionBarChart({ data, showMobile = false }: EmotionBarChartProps) {
  if (data.length === 0) {
    return (
      <div className="py-8 text-center">
        <p className="text-sm text-gray-600 sm:text-base">Check in to see the global emotion distribution!</p>
      </div>
    )
  }

  const maxValue = Math.max(...data.map((d) => d.value))
  const total = data.reduce((sum, d) => sum + d.value, 0)

  return (
    <div className="space-y-4">
      {data.map((emotion, index) => {
        const percentage = ((emotion.value / total) * 100).toFixed(1)
        const width = (emotion.value / maxValue) * 100

        return (
          <div key={index} className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium text-gray-700">{emotion.name}</span>
              <span className="text-gray-600">
                {emotion.value} ({percentage}%)
              </span>
            </div>
            <div className="h-8 w-full overflow-hidden rounded-full bg-gray-100">
              <div
                className="h-full rounded-full transition-all duration-500 ease-out"
                style={{
                  width: `${width}%`,
                  backgroundColor: emotion.color,
                }}
              />
            </div>
          </div>
        )
      })}
    </div>
  )
}
