"use client"

import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react"
import apiClient from "@/lib/api-client"
import { toast } from "@/components/ui/use-toast"

// Tipos para las integraciones
export interface Integration {
  platform: "shopify" | "woocommerce"
  status: "connected" | "disconnected" | "error"
  store_url?: string
  last_sync_at?: string
  error_message?: string
}

export interface ShopifyConnectionData {
  store_url: string
}

export interface WooCommerceConnectionData {
  store_url: string
  api_key_public: string
  api_key_secret: string
}

// Contexto para las integraciones
interface IntegrationsContextType {
  // Estado
  integrations: Integration[]
  isLoading: boolean
  lastUpdated: Date | null

  // Acciones
  fetchIntegrationsStatus: () => Promise<void>
  connectShopify: (data: ShopifyConnectionData) => Promise<{ success: boolean; authUrl?: string; error?: string }>
  connectWooCommerce: (data: WooCommerceConnectionData) => Promise<{ success: boolean; error?: string }>
  handleOAuthCallback: (searchParams: URLSearchParams) => void
}

const IntegrationsContext = createContext<IntegrationsContextType | undefined>(undefined)

export function IntegrationsProvider({ children }: { children: ReactNode }) {
  const [integrations, setIntegrations] = useState<Integration[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  // Obtener estado de las integraciones
  const fetchIntegrationsStatus = useCallback(async () => {
    setIsLoading(true)
    try {
      const response = await apiClient.get("/api/integrations/status")
      setIntegrations(response.data)
      setLastUpdated(new Date())
    } catch (error: any) {
      console.error("Error al obtener estado de integraciones:", error)
      if (error.response?.status !== 401) {
        toast({
          title: "Error",
          description: "No se pudo cargar el estado de las integraciones",
          variant: "destructive",
        })
      }
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Conectar con Shopify
  const connectShopify = useCallback(async (data: ShopifyConnectionData) => {
    setIsLoading(true)
    try {
      const response = await apiClient.post("/api/integrations/shopify/connect", data)

      if (response.status === 200) {
        return {
          success: true,
          authUrl: response.data.authUrl,
        }
      }

      return { success: false, error: "Error inesperado" }
    } catch (error: any) {
      console.error("Error al conectar con Shopify:", error)

      let errorMessage = "Error al conectar con Shopify"
      if (error.response?.status === 400) {
        errorMessage = error.response.data.error || "La URL de la tienda es obligatoria"
      } else if (error.response?.status === 401) {
        errorMessage = "No autorizado"
      }

      toast({
        title: "Error de conexión",
        description: errorMessage,
        variant: "destructive",
      })

      return { success: false, error: errorMessage }
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Conectar con WooCommerce
  const connectWooCommerce = useCallback(
    async (data: WooCommerceConnectionData) => {
      setIsLoading(true)
      try {
        const response = await apiClient.post("/api/integrations/woocommerce/connect", data)

        if (response.status === 200) {
          toast({
            title: "Conexión exitosa",
            description: "Integración con WooCommerce conectada exitosamente",
          })

          // Actualizar el estado de las integraciones
          await fetchIntegrationsStatus()

          return { success: true }
        }

        return { success: false, error: "Error inesperado" }
      } catch (error: any) {
        console.error("Error al conectar con WooCommerce:", error)

        let errorMessage = "Error al conectar con WooCommerce"
        if (error.response?.status === 400) {
          errorMessage = error.response.data.error || "Todos los campos son obligatorios"
        } else if (error.response?.status === 401) {
          errorMessage = "Credenciales de WooCommerce inválidas o la tienda no está accesible"
        }

        toast({
          title: "Error de conexión",
          description: errorMessage,
          variant: "destructive",
        })

        return { success: false, error: errorMessage }
      } finally {
        setIsLoading(false)
      }
    },
    [fetchIntegrationsStatus],
  )

  // Manejar callback de OAuth (Shopify)
  const handleOAuthCallback = useCallback(
    (searchParams: URLSearchParams) => {
      const success = searchParams.get("success")
      const error = searchParams.get("error")

      if (success === "shopify_connected") {
        toast({
          title: "¡Conexión exitosa!",
          description: "Shopify se ha conectado correctamente",
        })
        // Actualizar el estado de las integraciones
        fetchIntegrationsStatus()
      } else if (error) {
        toast({
          title: "Error de conexión",
          description: "Falló la conexión con Shopify. Por favor, inténtalo de nuevo.",
          variant: "destructive",
        })
      }
    },
    [fetchIntegrationsStatus],
  )

  // Cargar datos iniciales
  useEffect(() => {
    fetchIntegrationsStatus()
  }, [fetchIntegrationsStatus])

  const value = {
    integrations,
    isLoading,
    lastUpdated,
    fetchIntegrationsStatus,
    connectShopify,
    connectWooCommerce,
    handleOAuthCallback,
  }

  return <IntegrationsContext.Provider value={value}>{children}</IntegrationsContext.Provider>
}

export function useIntegrations() {
  const context = useContext(IntegrationsContext)
  if (context === undefined) {
    throw new Error("useIntegrations debe ser usado dentro de un IntegrationsProvider")
  }
  return context
}
