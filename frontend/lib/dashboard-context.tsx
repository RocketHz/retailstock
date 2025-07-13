"use client"

import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react"
import apiClient from "@/lib/api-client";
import { toast } from "@/components/ui/use-toast"

// Tipos para el dashboard
export interface DashboardSummary {
  totalSkus: number
  lowStockProducts: number
  outOfStockProducts: number
  topSellingProducts: TopSellingProduct[]
  leastSellingProducts: LeastSellingProduct[]
}

export interface TopSellingProduct {
  id: string
  name: string
  total_quantity_out: string // Viene como string del backend
}

export interface LeastSellingProduct {
  id: string
  name: string
  total_quantity_out: string // Viene como string del backend
}

export interface LowStockAlert {
  id: string
  name: string
  sku: string
  min_stock_threshold: number
  current_stock: number
  location_name: string
}

export interface OutOfStockAlert {
  id: string
  name: string
  sku: string
  current_stock: number
  location_name: string
}

// Contexto para el dashboard
interface DashboardContextType {
  // Estado
  summary: DashboardSummary | null
  lowStockAlerts: LowStockAlert[]
  outOfStockAlerts: OutOfStockAlert[]
  isLoading: boolean
  lastUpdated: Date | null

  // Acciones
  fetchDashboardSummary: () => Promise<void>
  fetchLowStockAlerts: () => Promise<void>
  fetchOutOfStockAlerts: () => Promise<void>
  refreshAllData: () => Promise<void>
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined)

export function DashboardProvider({ children }: { children: ReactNode }) {
  const [summary, setSummary] = useState<DashboardSummary | null>(null)
  const [lowStockAlerts, setLowStockAlerts] = useState<LowStockAlert[]>([])
  const [outOfStockAlerts, setOutOfStockAlerts] = useState<OutOfStockAlert[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  // Obtener resumen del dashboard
  const fetchDashboardSummary = useCallback(async () => {
    try {
      const response = await apiClient.get("/api/dashboard/dashboard-summary")
      
      const data = await response.data

      // Procesar los datos para convertir total_quantity_out a números
      const processedSummary: DashboardSummary = {
        ...data,
        topSellingProducts: data.topSellingProducts.map((product: TopSellingProduct) => ({
          ...product,
          total_quantity_out: product.total_quantity_out, // Mantener como string para mostrar
        })),
        leastSellingProducts: data.leastSellingProducts.map((product: LeastSellingProduct) => ({
          ...product,
          total_quantity_out: product.total_quantity_out, // Mantener como string para mostrar
        })),
      }

      setSummary(processedSummary)
      setLastUpdated(new Date())
    } catch (error: any) {
      console.error("Error al obtener resumen del dashboard:", error)
      // El apiClient ya maneja los toasts y redirecciones para 401/403
      if (error.message && !error.message.includes("401") && !error.message.includes("403")) {
        toast({
          title: "Error",
          description: "No se pudo cargar el resumen del dashboard",
          variant: "destructive",
        })
      }
    }
  }, [])

  // Obtener alertas de bajo stock
  const fetchLowStockAlerts = useCallback(async () => {
    try {
      const response = await apiClient.get("/api/alerts/low-stock")
      const data = response.data
      setLowStockAlerts(data)
    } catch (error: any) {
      console.error("Error al obtener alertas de bajo stock:", error)
      if (error.message && !error.message.includes("401") && !error.message.includes("403")) {
        toast({
          title: "Error",
          description: "No se pudieron cargar las alertas de bajo stock",
          variant: "destructive",
        })
      }
    }
  }, [])

  // Obtener alertas de productos desabastecidos
  const fetchOutOfStockAlerts = useCallback(async () => {
    try {
      const response = await apiClient.get("/api/alerts/out-of-stock")
      const data = response.data
      setOutOfStockAlerts(data)
    } catch (error: any) {
      console.error("Error al obtener alertas de desabastecimiento:", error)
      if (error.message && !error.message.includes("401") && !error.message.includes("403")) {
        toast({
          title: "Error",
          description: "No se pudieron cargar las alertas de desabastecimiento",
          variant: "destructive",
        })
      }
    }
  }, [])

  // Refrescar todos los datos
  const refreshAllData = useCallback(async () => {
    setIsLoading(true)
    try {
      await Promise.all([fetchDashboardSummary(), fetchLowStockAlerts(), fetchOutOfStockAlerts()])
    } finally {
      setIsLoading(false)
    }
  }, [fetchDashboardSummary, fetchLowStockAlerts, fetchOutOfStockAlerts])

  // Actualización periódica cada 5 minutos
  useEffect(() => {
    // Cargar datos iniciales
    refreshAllData()

    // Configurar actualización periódica
    const interval = setInterval(
      () => {
        refreshAllData()
      },
      5 * 60 * 1000,
    ) // 5 minutos

    return () => clearInterval(interval)
  }, [refreshAllData])

  const value = {
    summary,
    lowStockAlerts,
    outOfStockAlerts,
    isLoading,
    lastUpdated,
    fetchDashboardSummary,
    fetchLowStockAlerts,
    fetchOutOfStockAlerts,
    refreshAllData,
  }

  return <DashboardContext.Provider value={value}>{children}</DashboardContext.Provider>
}

export function useDashboard() {
  const context = useContext(DashboardContext)
  if (context === undefined) {
    throw new Error("useDashboard debe ser usado dentro de un DashboardProvider")
  }
  return context
}
