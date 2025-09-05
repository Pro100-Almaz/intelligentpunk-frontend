<template>
  <div class="flex flex-col md:flex-row gap-6">
    <!-- Main Usage Overview Card -->
    <UCard class="flex-1">
      <h2 class="text-xl font-medium mb-6">Usage Overview</h2>
      
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <!-- 1/3 Text Content -->
        <div class="md:col-span-1 flex flex-col justify-between">
          <!-- Icon, Name and Description -->
          <div class="mb-6">
            <div class="flex items-center mb-4">
              <UAvatar :src="usage.tool.icon" :alt="`${usage.tool.name} logo`" size="md" class="mr-3" />
              <div>
                <h3 class="font-bold text-lg">{{ usage.tool.name }}</h3>
                <p class="text-sm text-gray-400">{{ usage.tool.description }}</p>
              </div>
            </div>
            
            <!-- Points Used -->
            <div class="mb-6">
              <div class="text-gray-500 text-sm">Points used</div>
              <div class="text-3xl font-bold">{{ usage.pointsUsed.toLocaleString() }}</div>
            </div>
          </div>
          
          <!-- Bottom Stats -->
          <div class="space-y-3">
            <div>
              <div class="text-sm text-gray-500">Total Used:</div>
              <div class="font-bold">{{ usage.totalUsed }} pts</div>
            </div>
            <div>
              <div class="text-sm text-gray-500">Tools Used:</div>
              <div class="font-bold">{{ usage.toolsUsed }}</div>
            </div>
          </div>
        </div>
        
        <!-- 2/3 Graph Content -->
        <div class="md:col-span-2 relative">
          <div class="h-64 relative">
            <svg class="w-full h-full" viewBox="0 0 600 250">
              <!-- Y-axis labels -->
              <g class="text-xs text-gray-400">
                <text x="25" y="245" text-anchor="end">0</text>
                <text x="25" y="195" text-anchor="end">50</text>
                <text x="25" y="145" text-anchor="end">100</text>
                <text x="25" y="95" text-anchor="end">150</text>
                <text x="25" y="45" text-anchor="end">200</text>
                <text x="25" y="25" text-anchor="end">250</text>
              </g>
              
              <!-- X-axis labels -->
              <g class="text-xs text-gray-400">
                <text x="60" y="265" text-anchor="middle">5</text>
                <text x="150" y="265" text-anchor="middle">10</text>
                <text x="240" y="265" text-anchor="middle">15</text>
                <text x="330" y="265" text-anchor="middle">20</text>
                <text x="420" y="265" text-anchor="middle">25</text>
                <text x="510" y="265" text-anchor="middle">30</text>
              </g>
              
              <!-- Grid lines -->
              <g stroke="#f3f4f6" stroke-width="1">
                <!-- Horizontal grid lines -->
                <line x1="40" y1="240" x2="580" y2="240" />
                <line x1="40" y1="190" x2="580" y2="190" />
                <line x1="40" y1="140" x2="580" y2="140" />
                <line x1="40" y1="90" x2="580" y2="90" />
                <line x1="40" y1="40" x2="580" y2="40" />
                
                <!-- Vertical grid lines -->
                <line x1="60" y1="240" x2="60" y2="20" />
                <line x1="150" y1="240" x2="150" y2="20" />
                <line x1="240" y1="240" x2="240" y2="20" />
                <line x1="330" y1="240" x2="330" y2="20" />
                <line x1="420" y1="240" x2="420" y2="20" />
                <line x1="510" y1="240" x2="510" y2="20" />
              </g>
              
              <!-- Chart area -->
              <path
                :d="generateSmoothChartAreaPath(usage.chartData)"
                fill="rgba(249, 115, 22, 0.1)"
              />
              
              <!-- Chart line -->
              <path
                :d="generateSmoothChartPath(usage.chartData)"
                fill="none"
                stroke="#f97316"
                stroke-width="3"
              />
              
              <!-- Data points -->
              <g v-for="(value, index) in usage.chartData" :key="index">
                <circle 
                  :cx="getSmoothX(index, usage.chartData.length)" 
                  :cy="getSmoothY(value, usage.chartData)" 
                  r="4" 
                  fill="white" 
                  stroke="#f97316" 
                  stroke-width="2" 
                />
              </g>
              
              <!-- Dynamic highlight point with orange background -->
              <g v-if="getMaxPointData(usage.chartData)" :key="JSON.stringify(usage.chartData)">
                <circle 
                  :cx="getMaxPointData(usage.chartData)?.x || 0" 
                  :cy="getMaxPointData(usage.chartData)?.y || 0" 
                  r="6" 
                  fill="white" 
                  stroke="#f97316" 
                  stroke-width="3" 
                />
                <rect 
                  :x="(getMaxPointData(usage.chartData)?.x || 0) - 30" 
                  :y="(getMaxPointData(usage.chartData)?.y || 0) - 30" 
                  width="60" 
                  height="24" 
                  rx="12" 
                  fill="#f97316" 
                />
                <text 
                  :x="getMaxPointData(usage.chartData)?.x || 0" 
                  :y="(getMaxPointData(usage.chartData)?.y || 0) - 14" 
                  text-anchor="middle" 
                  fill="white" 
                  font-size="12" 
                  font-weight="bold"
                >
                  {{ getMaxPointData(usage.chartData)?.value || 0 }}PTS
                </text>
              </g>
            </svg>
          </div>
        </div>
      </div>
    </UCard>

    <!-- Tools Card List -->
    <UCard class="w-full md:w-80">
      <div class="space-y-4">
        <div v-for="tool in tools" :key="tool.id" class="bg-gray-50 rounded-lg p-4">
          <div class="flex items-center justify-between">
            <div class="flex items-center">
              <UAvatar :src="tool.icon" :alt="`${tool.name} logo`" size="sm" class="mr-3" />
              <div>
                <h3 class="font-bold">{{ tool.name }}</h3>
                <p class="text-xs text-gray-500">{{ tool.description }}</p>
              </div>
            </div>
            <div class="text-right">
              <div class="text-sm font-bold">{{ tool.pointsUsed }}</div>
              <div class="text-xs text-gray-500">pts Used</div>
            </div>
          </div>
        </div>
      </div>
    </UCard>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  usage: {
    tool: {
      icon: string
      name: string
      description: string
    }
    pointsUsed: number
    chartData: number[]
    totalUsed: number
    toolsUsed: number
  }
  tools: Array<{
    id: string | number
    icon: string
    name: string
    description: string
    pointsUsed: number
  }>
}>()

function getSmoothX(index: number, dataLength: number) {
  const width = 540 // 580 - 40 (margins)
  const xStep = width / (dataLength - 1)
  return 40 + (index * xStep)
}

function getSmoothY(value: number, data: number[]) {
  const height = 220 // 240 - 20 (margins)
  const maxValue = Math.max(...data) * 1.1
  return 240 - (value / maxValue) * height
}

function generateSmoothChartPath(data: number[]) {
  if (!data || data.length === 0) return ''
  
  const points = data.map((value, index) => ({
    x: getSmoothX(index, data.length),
    y: getSmoothY(value, data)
  }))
  
  if (points.length < 2 || !points[0]) return points[0] ? `M${points[0].x},${points[0].y}` : ''
  
  let path = `M${points[0].x},${points[0].y}`
  
  for (let i = 1; i < points.length; i++) {
    const prev = points[i - 1]
    const current = points[i]
    const next = points[i + 1]
    
    if (!prev || !current) continue
    
    if (i === 1) {
      // First curve
      const cp1x = prev.x + (current.x - prev.x) * 0.5
      const cp1y = prev.y
      const cp2x = current.x - (current.x - prev.x) * 0.25
      const cp2y = current.y
      path += ` C${cp1x},${cp1y} ${cp2x},${cp2y} ${current.x},${current.y}`
    } else if (i === points.length - 1) {
      // Last curve
      const cp1x = prev.x + (current.x - prev.x) * 0.25
      const cp1y = prev.y
      const cp2x = current.x - (current.x - prev.x) * 0.5
      const cp2y = current.y
      path += ` C${cp1x},${cp1y} ${cp2x},${cp2y} ${current.x},${current.y}`
    } else if (next) {
      // Middle curves
      const cp1x = prev.x + (current.x - prev.x) * 0.3
      const cp1y = prev.y + (current.y - prev.y) * 0.3
      const cp2x = current.x - (next.x - current.x) * 0.3
      const cp2y = current.y - (next.y - current.y) * 0.3
      path += ` C${cp1x},${cp1y} ${cp2x},${cp2y} ${current.x},${current.y}`
    } else {
      // Fallback for missing next point
      path += ` L${current.x},${current.y}`
    }
  }
  
  return path
}

function generateSmoothChartAreaPath(data: number[]) {
  if (!data || data.length === 0) return ''
  
  const linePath = generateSmoothChartPath(data)
  const lastValue = data[data.length - 1]
  const firstValue = data[0]
  
  if (lastValue === undefined || firstValue === undefined) return ''
  
  const lastPoint = {
    x: getSmoothX(data.length - 1, data.length),
    y: getSmoothY(lastValue, data)
  }
  const firstPoint = {
    x: getSmoothX(0, data.length),
    y: getSmoothY(firstValue, data)
  }
  
  return `${linePath} L${lastPoint.x},240 L${firstPoint.x},240 Z`
}

function getMaxPointData(data: number[]) {
  if (!data || data.length === 0) return null
  
  const maxValue = Math.max(...data)
  const maxIndex = data.indexOf(maxValue)
  
  return {
    x: getSmoothX(maxIndex, data.length),
    y: getSmoothY(maxValue, data),
    value: maxValue
  }
}
</script>
