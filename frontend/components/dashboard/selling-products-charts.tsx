"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, TrendingDown, Package } from "lucide-react"
import { useDashboard } from "@/lib/dashboard-context"
import { Skeleton } from "@/components/ui/skeleton"

export function SellingProductsCharts() {
  const { summary, isLoading } = useDashboard()

  if (isLoading || !summary) {
    return (
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex items-center justify-between">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-6 w-16" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex items-center justify-between">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-6 w-16" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="grid md:grid-cols-2 gap-6">
      {/* Productos Más Vendidos */}
      <Card>
        <CardHeader className="flex flex-row items-center space-y-0 pb-4">
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-green-50 rounded-full">
              <TrendingUp className="h-4 w-4 text-green-600" />
            </div>
            <CardTitle className="text-lg">Productos Más Vendidos</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          {summary.topSellingProducts.length === 0 ? (
            <div className="text-center py-8">
              <Package className="h-8 w-8 mx-auto text-gray-400 mb-2" />
              <p className="text-sm text-gray-500">No hay datos de ventas disponibles</p>
            </div>
          ) : (
            <div className="space-y-4">
              {summary.topSellingProducts.slice(0, 5).map((product, index) => (
                <div key={product.id} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center justify-center w-6 h-6 bg-green-100 text-green-600 rounded-full text-xs font-medium">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{product.name}</p>
                    </div>
                  </div>
                  <Badge variant="secondary" className="bg-green-50 text-green-700">
                    {product.total_quantity_out} vendidos
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Productos Menos Vendidos */}
      <Card>
        <CardHeader className="flex flex-row items-center space-y-0 pb-4">
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-orange-50 rounded-full">
              <TrendingDown className="h-4 w-4 text-orange-600" />
            </div>
            <CardTitle className="text-lg">Productos Menos Vendidos</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          {summary.leastSellingProducts.length === 0 ? (
            <div className="text-center py-8">
              <Package className="h-8 w-8 mx-auto text-gray-400 mb-2" />
              <p className="text-sm text-gray-500">No hay datos de ventas disponibles</p>
            </div>
          ) : (
            <div className="space-y-4">
              {summary.leastSellingProducts.slice(0, 5).map((product, index) => (
                <div key={product.id} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center justify-center w-6 h-6 bg-orange-100 text-orange-600 rounded-full text-xs font-medium">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{product.name}</p>
                    </div>
                  </div>
                  <Badge variant="outline" className="border-orange-200 text-orange-700">
                    {product.total_quantity_out} vendidos
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
