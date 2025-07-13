"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { CheckCircle, XCircle, AlertCircle, RefreshCw } from "lucide-react"
import type { Integration } from "@/lib/integrations-context"

interface IntegrationStatusCardProps {
  integration: Integration
  onConnect: () => void
  onRefresh: () => void
  isLoading: boolean
}

export function IntegrationStatusCard({ integration, onConnect, onRefresh, isLoading }: IntegrationStatusCardProps) {
  const getStatusIcon = () => {
    switch (integration.status) {
      case "connected":
        return <CheckCircle className="h-5 w-5 text-green-600" />
      case "error":
        return <AlertCircle className="h-5 w-5 text-red-600" />
      default:
        return <XCircle className="h-5 w-5 text-gray-400" />
    }
  }

  const getStatusBadge = () => {
    switch (integration.status) {
      case "connected":
        return (
          <Badge variant="default" className="bg-green-50 text-green-700 border-green-200">
            Conectado
          </Badge>
        )
      case "error":
        return (
          <Badge variant="destructive" className="bg-red-50 text-red-700 border-red-200">
            Error
          </Badge>
        )
      default:
        return (
          <Badge variant="outline" className="bg-gray-50 text-gray-600">
            Desconectado
          </Badge>
        )
    }
  }

  const formatLastSync = (lastSync?: string) => {
    if (!lastSync) return "Nunca"

    const date = new Date(lastSync)
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

  const getPlatformName = () => {
    return integration.platform === "shopify" ? "Shopify" : "WooCommerce"
  }

  const getPlatformLogo = () => {
    return integration.platform === "shopify" ? "🛍️" : "🛒"
  }

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <div className="flex items-center space-x-3">
          <div className="text-2xl">{getPlatformLogo()}</div>
          <div>
            <CardTitle className="text-lg">{getPlatformName()}</CardTitle>
            {integration.store_url && (
              <p className="text-sm text-gray-600 mt-1">
                Tienda: <span className="font-medium">{integration.store_url}</span>
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {getStatusIcon()}
          {getStatusBadge()}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Información de estado */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Última sincronización:</span>
              <span className="font-medium">{formatLastSync(integration.last_sync_at)}</span>
            </div>
          </div>

          {/* Mensaje de error si existe */}
          {integration.status === "error" && integration.error_message && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md">
              <div className="flex items-start space-x-2">
                <AlertCircle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-red-800">Error de sincronización</p>
                  <p className="text-sm text-red-700 mt-1">{integration.error_message}</p>
                </div>
              </div>
            </div>
          )}

          {/* Acciones */}
          <div className="flex space-x-2">
            {integration.status === "connected" ? (
              <Button
                onClick={onRefresh}
                disabled={isLoading}
                variant="outline"
                size="sm"
                className="flex-1 bg-transparent"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
                {isLoading ? "Sincronizando..." : "Sincronizar"}
              </Button>
            ) : (
              <Button onClick={onConnect} disabled={isLoading} size="sm" className="flex-1">
                {isLoading ? "Conectando..." : `Conectar ${getPlatformName()}`}
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
