"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Package, TrendingDown, AlertTriangle, BarChart3 } from "lucide-react"
import { useDashboard } from "@/lib/dashboard-context"
import { Skeleton } from "@/components/ui/skeleton"

export function MetricsCards() {
  const { summary, isLoading } = useDashboard()

  if (isLoading || !summary) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-16 mb-2" />
              <Skeleton className="h-3 w-20" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  const metrics = [
    {
      title: "Total SKUs",
      value: summary.totalSkus,
      description: "Productos activos",
      icon: Package,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      title: "Bajo Stock",
      value: summary.lowStockProducts,
      description: "Productos con stock bajo",
      icon: TrendingDown,
      color: summary.lowStockProducts > 0 ? "text-orange-600" : "text-green-600",
      bgColor: summary.lowStockProducts > 0 ? "bg-orange-50" : "bg-green-50",
    },
    {
      title: "Desabastecidos",
      value: summary.outOfStockProducts,
      description: "Productos agotados",
      icon: AlertTriangle,
      color: summary.outOfStockProducts > 0 ? "text-red-600" : "text-green-600",
      bgColor: summary.outOfStockProducts > 0 ? "bg-red-50" : "bg-green-50",
    },
    {
      title: "Productos Vendidos",
      value: summary.topSellingProducts.length,
      description: "Con movimientos de salida",
      icon: BarChart3,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      {metrics.map((metric, index) => {
        const Icon = metric.icon
        return (
          <Card key={index} className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">{metric.title}</CardTitle>
              <div className={`p-2 rounded-full ${metric.bgColor}`}>
                <Icon className={`h-4 w-4 ${metric.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className={`text-3xl font-bold ${metric.color}`}>{metric.value}</div>
              <p className="text-xs text-gray-500 mt-1">{metric.description}</p>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
