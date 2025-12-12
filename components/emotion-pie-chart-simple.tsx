export interface EmotionData {
  name: string
  value: number
  color: string
}

interface EmotionPieChartProps {
  data: EmotionData[]
}

export default function EmotionPieChartSimple({ data }: EmotionPieChartProps) {
  const total = data.reduce((sum, item) => sum + item.value, 0)

  if (total === 0 || data.length === 0) {
    return <div className="flex h-64 items-center justify-center text-muted-foreground">No emotion data available</div>
  }

  // Calculate percentages and cumulative angles for pie slices
  let cumulativePercent = 0
  const slices = data.map((item) => {
    const percent = (item.value / total) * 100
    const startPercent = cumulativePercent
    cumulativePercent += percent
    return {
      ...item,
      percent,
      startPercent,
      endPercent: cumulativePercent,
    }
  })

  // Generate SVG path for each slice using conic gradient approach
  const radius = 100
  const centerX = 120
  const centerY = 120

  return (
    <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-center">
      {/* Pie Chart */}
      <div className="flex justify-center">
        <div className="relative h-64 w-64">
          <svg viewBox="0 0 240 240" className="h-full w-full -rotate-90">
            {slices.map((slice, index) => {
              const startAngle = (slice.startPercent / 100) * 360
              const endAngle = (slice.endPercent / 100) * 360
              const largeArcFlag = endAngle - startAngle > 180 ? 1 : 0

              const startX = centerX + radius * Math.cos((startAngle * Math.PI) / 180)
              const startY = centerY + radius * Math.sin((startAngle * Math.PI) / 180)
              const endX = centerX + radius * Math.cos((endAngle * Math.PI) / 180)
              const endY = centerY + radius * Math.sin((endAngle * Math.PI) / 180)

              const pathData = [
                `M ${centerX} ${centerY}`,
                `L ${startX} ${startY}`,
                `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${endX} ${endY}`,
                "Z",
              ].join(" ")

              return (
                <path
                  key={index}
                  d={pathData}
                  fill={slice.color}
                  stroke="white"
                  strokeWidth="2"
                  className="transition-opacity hover:opacity-80"
                />
              )
            })}
            {/* Center circle for donut effect */}
            <circle cx={centerX} cy={centerY} r={radius * 0.5} fill="white" />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <p className="text-3xl font-bold text-gray-900">{total}</p>
            <p className="text-xs text-muted-foreground">Check-ins</p>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="grid grid-cols-2 gap-2 sm:gap-3 lg:grid-cols-1">
        {slices.map((slice, index) => (
          <div key={index} className="flex items-center gap-2">
            <div className="h-3 w-3 flex-shrink-0 rounded-full" style={{ backgroundColor: slice.color }} />
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-medium text-gray-900 sm:text-sm">{slice.name}</p>
              <p className="text-xs text-muted-foreground">{slice.percent.toFixed(1)}%</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
