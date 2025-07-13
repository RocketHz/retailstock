"use client"

import { Button } from "@/components/ui/button"
import { RefreshCw } from "lucide-react"
import { useDashboard } from "@/lib/dashboard-context"
import { useAuth } from "@/lib/auth-context"

export function DashboardHeader() {
  const { refreshAllData, isLoading, lastUpdated } = useDashboard()
  const { user } = useAuth()

  const formatLastUpdated = (date: Date | null) => {
    if (!date) return "Nunca"

    const now = new Date()
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))

    if (diffInMinutes < 1) return "Hace menos de 1 minuto"
    if (diffInMinutes === 1) return "Hace 1 minuto"
    if (diffInMinutes < 60) return `Hace ${diffInMinutes} minutos`

    const diffInHours = Math.floor(diffInMinutes / 60)
    if (diffInHours === 1) return "Hace 1 hora"
    if (diffInHours < 24) return `Hace ${diffInHours} horas`

    return date.toLocaleDateString("es-ES", {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  return (
    <div className="flex justify-between items-center">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard RetailStock</h1>
        <p className="text-gray-600">Resumen de inventario para {user?.email}</p>
        <p className="text-sm text-gray-500 mt-1">Última actualización: {formatLastUpdated(lastUpdated)}</p>
      </div>
      <Button
        onClick={refreshAllData}
        disabled={isLoading}
        variant="outline"
        size="sm"
        className="flex items-center space-x-2 bg-transparent"
      >
        <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
        <span>{isLoading ? "Actualizando..." : "Actualizar"}</span>
      </Button>
    </div>
  )
}
