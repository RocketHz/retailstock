"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { AlertTriangle, Package, ExternalLink } from "lucide-react"
import { useDashboard } from "@/lib/dashboard-context"
import { Skeleton } from "@/components/ui/skeleton"
import Link from "next/link"

export function LowStockAlerts() {
  const { lowStockAlerts, isLoading } = useDashboard()

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-24" />
                </div>
                <Skeleton className="h-8 w-20" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center space-y-0 pb-4">
        <div className="flex items-center space-x-2">
          <div className="p-2 bg-orange-50 rounded-full">
            <AlertTriangle className="h-4 w-4 text-orange-600" />
          </div>
          <CardTitle className="text-lg">Alertas de Bajo Stock</CardTitle>
        </div>
        <Badge variant="secondary" className="ml-auto bg-orange-50 text-orange-700">
          {lowStockAlerts.length}
        </Badge>
      </CardHeader>
      <CardContent>
        {lowStockAlerts.length === 0 ? (
          <div className="text-center py-8">
            <div className="p-3 bg-green-50 rounded-full w-fit mx-auto mb-3">
              <Package className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="font-medium text-green-800 mb-1">¡Todo en orden!</h3>
            <p className="text-sm text-green-600">No hay productos en bajo stock</p>
          </div>
        ) : (
          <div className="space-y-4">
            {lowStockAlerts.map((alert) => (
              <div
                key={alert.id}
                className="flex items-center justify-between p-4 border border-orange-200 bg-orange-50 rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  <AlertTriangle className="h-5 w-5 text-orange-600 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-gray-900">{alert.name}</p>
                    <p className="text-sm text-gray-600">SKU: {alert.sku}</p>
                    <p className="text-sm text-gray-600">
                      Stock actual: <span className="font-medium text-orange-600">{alert.current_stock}</span> / Mínimo:{" "}
                      <span className="font-medium">{alert.min_stock_threshold}</span>
                    </p>
                    <p className="text-xs text-gray-500">Ubicación: {alert.location_name}</p>
                  </div>
                </div>
                <div className="flex flex-col space-y-2">
                  <Button size="sm" variant="outline" asChild>
                    <Link href={`/inventory?search=${alert.sku}`}>
                      <ExternalLink className="h-3 w-3 mr-1" />
                      Ver Producto
                    </Link>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
