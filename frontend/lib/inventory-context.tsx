"use client"

import { createContext, useContext, useState, useCallback, type ReactNode } from "react"
import apiClient from "@/lib/api-client";
import { toast } from "@/components/ui/use-toast"

// Tipos para el inventario
export interface StockLevel {
  locationId: string
  locationName: string
  quantity: number
}

export interface Product {
  id: string
  name: string
  sku: string
  description?: string
  price: number
  minStockThreshold?: number
  stockLevels: StockLevel[]
  totalStock: number
  createdAt: string
  updatedAt: string
}

export interface Location {
  id: string
  name: string
  address?: string
}

export interface StockMovement {
  id: string
  productId: string
  locationId: string
  type: "in" | "out"
  quantity: number
  notes?: string
  createdAt: string
}

// Parámetros para filtrado y ordenamiento
export interface ProductsQueryParams {
  name?: string
  sku?: string
  sort_by?: string
  sort_order?: "asc" | "desc"
}

// Contexto para el inventario
interface InventoryContextType {
  // Estado
  products: Product[]
  locations: Location[]
  isLoading: boolean

  // Acciones para productos
  fetchProducts: (params?: ProductsQueryParams) => Promise<void>
  addProduct: (
    productData: Omit<Product, "id" | "stockLevels" | "totalStock" | "createdAt" | "updatedAt"> & {
      locationId: string
      initialQuantity: number
    },
  ) => Promise<boolean>
  updateProduct: (id: string, productData: Partial<Product>) => Promise<boolean>

  // Acciones para stock
  adjustStock: (productId: string, locationId: string, quantity: number) => Promise<boolean>
  registerStockMovement: (movement: Omit<StockMovement, "id" | "createdAt">) => Promise<boolean>

  // Acciones para ubicaciones
  fetchLocations: () => Promise<void>
}

const InventoryContext = createContext<InventoryContextType | undefined>(undefined)

export function InventoryProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<Product[]>([])
  const [locations, setLocations] = useState<Location[]>([])
  const [isLoading, setIsLoading] = useState(false)

  // Obtener productos con filtros y ordenamiento
  const fetchProducts = useCallback(async (params?: ProductsQueryParams) => {
    setIsLoading(true)
    try {
      const response = await apiClient.get("/api/products", { params })

      // Procesar los productos para calcular el stock total
      const processedProducts = response.data.map((product: any) => {
        // CORRECCIÓN: Cambiado 'product.stock_levels' a 'product.stockLevels'
        const stockLevels = (product.stockLevels || []).map((sl: any) => ({
          locationId: sl.locationId, // Asumiendo que el backend ya devuelve esto como camelCase
          locationName: sl.locationName, // Asumiendo que el backend ya devuelve esto como camelCase
          quantity: sl.quantity,
        }));
        return {
          ...product,
          price: Number.parseFloat(product.price),
          minStockThreshold: product.min_stock_threshold,
          stockLevels: stockLevels,
          totalStock: stockLevels.reduce((sum: number, level: StockLevel) => sum + level.quantity, 0),
          // Asegurarse de que otras propiedades snake_case del backend también se mapeen si es necesario
          createdAt: product.created_at,
          updatedAt: product.updated_at,
        };
      })

      setProducts(processedProducts)
    } catch (error) {
      console.error("Error al obtener productos:", error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Añadir un nuevo producto
  const addProduct = useCallback(
    async (productData) => {
      setIsLoading(true)
      try {
        const transformedProductData: any = {
          ...productData,
          location_id: productData.locationId,
          initial_quantity: productData.initialQuantity,
        };
        if (productData.minStockThreshold !== undefined) {
          transformedProductData.min_stock_threshold = productData.minStockThreshold;
        }
        delete transformedProductData.locationId;
        delete transformedProductData.initialQuantity;
        await apiClient.post("/api/products", transformedProductData)
        toast({
          title: "Producto añadido",
          description: "El producto ha sido añadido exitosamente.",
        })
        // Refrescar la lista de productos
        await fetchProducts()
        return true
      } catch (error: any) {
        const errorMessage = error.response?.data?.error || "Error al añadir el producto"
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        })
        return false
      } finally {
        setIsLoading(false)
      }
    },
    [fetchProducts],
  )

  // Actualizar un producto existente
  const updateProduct = useCallback(
    async (id: string, productData: Partial<Product>) => {
      setIsLoading(true)
      try {
        // Mapear campos de camelCase a snake_case para el backend si es necesario
        const transformedProductData: any = { ...productData };
        if (productData.minStockThreshold !== undefined) {
          transformedProductData.min_stock_threshold = productData.minStockThreshold;
          delete transformedProductData.minStockThreshold;
        }
        // Asegurarse de que `price` sea un número
        if (typeof transformedProductData.price === 'string') {
          transformedProductData.price = Number.parseFloat(transformedProductData.price);
        }

        await apiClient.put(`/api/products/${id}`, transformedProductData)
        toast({
          title: "Producto actualizado",
          description: "El producto ha sido actualizado exitosamente.",
        })
        await fetchProducts() // Refrescar la lista de productos
        return true
      } catch (error: any) {
        const errorMessage = error.response?.data?.error || "Error al actualizar el producto"
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        })
        return false
      } finally {
        setIsLoading(false)
      }
    },
    [fetchProducts],
  )

  // Ajustar el stock de un producto en una ubicación específica
  const adjustStock = useCallback(
    async (productId: string, locationId: string, quantity: number) => {
      setIsLoading(true)
      try {
        await apiClient.post("/api/stock/adjust", { productId, locationId, quantity })
        toast({
          title: "Stock ajustado",
          description: "El stock ha sido ajustado exitosamente.",
        })
        await fetchProducts() // Refrescar la lista de productos
        return true
      } catch (error: any) {
        const errorMessage = error.response?.data?.error || "Error al ajustar el stock"
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        })
        return false
      } finally {
        setIsLoading(false)
      }
    },
    [fetchProducts],
  )

  // Registrar un movimiento de stock (entrada o salida)
  const registerStockMovement = useCallback(
    async (movement: Omit<StockMovement, "id" | "createdAt">) => {
      setIsLoading(true)
      try {
        // Mapear de camelCase a snake_case para el backend
        const transformedMovement = {
          productId: movement.productId,
          locationId: movement.locationId,
          type: movement.type,
          quantity: movement.quantity,
          notes: movement.notes,
        };
        await apiClient.post("/api/stock/movements", transformedMovement)
        toast({
          title: "Movimiento de stock registrado",
          description: "El movimiento de stock ha sido registrado exitosamente.",
        })

        // Refrescar la lista de productos
        await fetchProducts()
        return true
      } catch (error: any) {
        const errorMessage = error.response?.data?.error || "Error al registrar el movimiento"
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        })
        return false
      } finally {
        setIsLoading(false)
      }
    },
    [fetchProducts],
  )

  // Obtener ubicaciones
  const fetchLocations = useCallback(async () => {
    setIsLoading(true)
    try {
      const response = await apiClient.get("/api/locations")
      setLocations(response.data)
    } catch (error) {
      console.error("Error al obtener ubicaciones:", error)
      toast({
        title: "Error",
        description: "No se pudieron cargar las ubicaciones",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }, [])

  const value = {
    products,
    locations,
    isLoading,
    fetchProducts,
    addProduct,
    updateProduct,
    adjustStock,
    registerStockMovement,
    fetchLocations,
  }

  return <InventoryContext.Provider value={value}>{children}</InventoryContext.Provider>
}

export function useInventory() {
  const context = useContext(InventoryContext)
  if (context === undefined) {
    throw new Error("useInventory debe ser usado dentro de un InventoryProvider")
  }
  return context
}
