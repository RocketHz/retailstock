"use client"

import { ProtectedRoute } from "@/components/protected-route"
import { DashboardProvider } from "@/lib/dashboard-context"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { MetricsCards } from "@/components/dashboard/metrics-cards"
import { SellingProductsCharts } from "@/components/dashboard/selling-products-charts"
import { LowStockAlerts } from "@/components/dashboard/low-stock-alerts"
import { OutOfStockAlerts } from "@/components/dashboard/out-of-stock-alerts"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/lib/auth-context"
import Link from "next/link"

function DashboardContent() {
  const { logout } = useAuth()

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <DashboardHeader />
            <div className="flex items-center space-x-4">
              <Badge variant="outline">Plan Básico</Badge>
              <Button onClick={logout} variant="outline">
                Cerrar Sesión
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0 space-y-8">
          {/* Métricas principales */}
          <MetricsCards />

          {/* Productos más y menos vendidos */}
          <SellingProductsCharts />

          {/* Alertas */}
          <div className="grid lg:grid-cols-2 gap-6">
            <LowStockAlerts />
            <OutOfStockAlerts />
          </div>

          {/* Acciones rápidas */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Acciones Rápidas</h2>
            <div className="grid md:grid-cols-3 gap-4">
              <Button asChild className="h-auto p-4 flex flex-col items-center space-y-2">
                <Link href="/inventory">
                  <div className="text-lg">📦</div>
                  <span>Gestionar Inventario</span>
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                className="h-auto p-4 flex flex-col items-center space-y-2 bg-transparent"
              >
                <Link href="/integrations">
                  <div className="text-lg">🔗</div>
                  <span>Ver Integraciones</span>
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                className="h-auto p-4 flex flex-col items-center space-y-2 bg-transparent"
              >
                <Link href="/pricing">
                  <div className="text-lg">⭐</div>
                  <span>Actualizar Plan</span>
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardProvider>
        <DashboardContent />
      </DashboardProvider>
    </ProtectedRoute>
  )
}
