"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { ProtectedRoute } from "@/components/protected-route"
import { IntegrationsProvider, useIntegrations } from "@/lib/integrations-context"
import { IntegrationStatusCard } from "@/components/integrations/integration-status-card"
import { ShopifyConnectionDialog } from "@/components/integrations/shopify-connection-dialog"
import { WooCommerceConnectionDialog } from "@/components/integrations/woocommerce-connection-dialog"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { RefreshCw, Plus } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"

function IntegrationsContent() {
  const { integrations, isLoading, fetchIntegrationsStatus, handleOAuthCallback } = useIntegrations()
  const [shopifyDialogOpen, setShopifyDialogOpen] = useState(false)
  const [wooCommerceDialogOpen, setWooCommerceDialogOpen] = useState(false)
  const searchParams = useSearchParams()

  // Manejar callback de OAuth al cargar la página
  useEffect(() => {
    if (searchParams.has("success") || searchParams.has("error")) {
      handleOAuthCallback(searchParams)
      // Limpiar los parámetros de la URL
      window.history.replaceState({}, "", window.location.pathname)
    }
  }, [searchParams, handleOAuthCallback])

  // Obtener integración por plataforma
  const getIntegration = (platform: "shopify" | "woocommerce") => {
    return integrations.find((integration) => integration.platform === platform)
  }

  // Manejar conexión de Shopify
  const handleShopifyConnect = () => {
    setShopifyDialogOpen(true)
  }

  // Manejar conexión de WooCommerce
  const handleWooCommerceConnect = () => {
    setWooCommerceDialogOpen(true)
  }

  // Manejar actualización/sincronización
  const handleRefresh = () => {
    fetchIntegrationsStatus()
  }

  if (isLoading && integrations.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-6">
              <div>
                <Skeleton className="h-8 w-64 mb-2" />
                <Skeleton className="h-4 w-96" />
              </div>
              <Skeleton className="h-10 w-24" />
            </div>
          </div>
        </header>
        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <div className="grid md:grid-cols-2 gap-6">
              <Skeleton className="h-64" />
              <Skeleton className="h-64" />
            </div>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Integraciones</h1>
              <p className="text-gray-600">Conecta tu inventario con plataformas de comercio electrónico</p>
            </div>
            <Button
              onClick={handleRefresh}
              disabled={isLoading}
              variant="outline"
              size="sm"
              className="flex items-center space-x-2 bg-transparent"
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
              <span>{isLoading ? "Actualizando..." : "Actualizar"}</span>
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0 space-y-8">
          {/* Información general */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Plus className="h-5 w-5" />
                <span>Conecta tus Plataformas</span>
              </CardTitle>
              <CardDescription>
                Sincroniza automáticamente tu inventario con tus tiendas online. Los cambios se reflejarán en tiempo
                real en todas las plataformas conectadas.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl mb-2">🔄</div>
                  <h3 className="font-medium text-gray-900">Sincronización Automática</h3>
                  <p className="text-sm text-gray-600 mt-1">Inventario actualizado en tiempo real</p>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl mb-2">📊</div>
                  <h3 className="font-medium text-gray-900">Datos Unificados</h3>
                  <p className="text-sm text-gray-600 mt-1">Toda la información en un solo lugar</p>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <div className="text-2xl mb-2">⚡</div>
                  <h3 className="font-medium text-gray-900">Configuración Rápida</h3>
                  <p className="text-sm text-gray-600 mt-1">Conecta en pocos minutos</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Integraciones disponibles */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Shopify */}
            <IntegrationStatusCard
              integration={
                getIntegration("shopify") || {
                  platform: "shopify",
                  status: "disconnected",
                }
              }
              onConnect={handleShopifyConnect}
              onRefresh={handleRefresh}
              isLoading={isLoading}
            />

            {/* WooCommerce */}
            <IntegrationStatusCard
              integration={
                getIntegration("woocommerce") || {
                  platform: "woocommerce",
                  status: "disconnected",
                }
              }
              onConnect={handleWooCommerceConnect}
              onRefresh={handleRefresh}
              isLoading={isLoading}
            />
          </div>

          {/* Próximamente */}
          <Card>
            <CardHeader>
              <CardTitle>Próximamente</CardTitle>
              <CardDescription>Más integraciones en desarrollo</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-4 gap-4">
                {["Magento", "BigCommerce", "PrestaShop", "Amazon"].map((platform) => (
                  <div key={platform} className="text-center p-4 bg-gray-50 rounded-lg opacity-60">
                    <div className="text-2xl mb-2">🔗</div>
                    <h3 className="font-medium text-gray-700">{platform}</h3>
                    <p className="text-xs text-gray-500 mt-1">En desarrollo</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Diálogos de conexión */}
      <ShopifyConnectionDialog open={shopifyDialogOpen} onOpenChange={setShopifyDialogOpen} />
      <WooCommerceConnectionDialog open={wooCommerceDialogOpen} onOpenChange={setWooCommerceDialogOpen} />
    </div>
  )
}

export default function IntegrationsPage() {
  return (
    <ProtectedRoute>
      <IntegrationsProvider>
        <IntegrationsContent />
      </IntegrationsProvider>
    </ProtectedRoute>
  )
}
