"use client"

import { useState, useEffect } from "react"
import { useInventory, type Product, type ProductsQueryParams } from "@/lib/inventory-context"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Edit, ArrowUpDown, Package, MoreHorizontal } from "lucide-react"
import { useDebounce } from "@/hooks/use-debounce"
import { ProductFormDialog } from "@/components/inventory/product-form-dialog"
import { StockAdjustmentDialog } from "@/components/inventory/stock-adjustment-dialog"
import { StockMovementDialog } from "@/components/inventory/stock-movement-dialog"
import { useSearchParams } from "next/navigation"

export function ProductTable() {
  const { products, fetchProducts, isLoading } = useInventory()
  const [searchTerm, setSearchTerm] = useState("")
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: "asc" | "desc" }>({
    key: "name",
    direction: "asc",
  })
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [stockProduct, setStockProduct] = useState<Product | null>(null)
  const [movementProduct, setMovementProduct] = useState<Product | null>(null)

  const searchParams = useSearchParams()

  const debouncedSearchTerm = useDebounce(searchTerm, 500)

  // Efecto para cargar productos al montar el componente y cuando cambian los filtros
  useEffect(() => {
    // Leer parámetro de búsqueda de la URL
    const searchFromUrl = searchParams.get("search")
    if (searchFromUrl) {
      setSearchTerm(searchFromUrl)
    }
  }, [searchParams])

  useEffect(() => {
    const params: ProductsQueryParams = {}

    if (debouncedSearchTerm) {
      // Determinar si el término de búsqueda parece un SKU o un nombre
      if (/^[A-Za-z0-9-]+$/.test(debouncedSearchTerm) && debouncedSearchTerm.length <= 20) {
        params.sku = debouncedSearchTerm
      } else {
        params.name = debouncedSearchTerm
      }
    }

    params.sort_by = sortConfig.key
    params.sort_order = sortConfig.direction

    fetchProducts(params)
  }, [debouncedSearchTerm, sortConfig, fetchProducts])

  // Función para cambiar el ordenamiento
  const handleSort = (key: string) => {
    setSortConfig((prevConfig) => ({
      key,
      direction: prevConfig.key === key && prevConfig.direction === "asc" ? "desc" : "asc",
    }))
  }

  // Formatear precio para mostrar
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("es-ES", {
      style: "currency",
      currency: "EUR",
    }).format(price)
  }

  return (
    <div className="space-y-4">
      {/* Barra de búsqueda */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Input
            placeholder="Buscar por nombre o SKU..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-[300px]"
          />
        </div>
        <ProductFormDialog />
      </div>

      {/* Tabla de productos */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[300px]">
                <div className="flex items-center cursor-pointer" onClick={() => handleSort("name")}>
                  Nombre
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </div>
              </TableHead>
              <TableHead>
                <div className="flex items-center cursor-pointer" onClick={() => handleSort("sku")}>
                  SKU
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </div>
              </TableHead>
              <TableHead>
                <div className="flex items-center cursor-pointer" onClick={() => handleSort("price")}>
                  Precio
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </div>
              </TableHead>
              <TableHead>Stock Total</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8">
                  <div className="flex justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                  </div>
                  <div className="mt-2 text-sm text-gray-500">Cargando productos...</div>
                </TableCell>
              </TableRow>
            ) : products.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8">
                  <Package className="h-8 w-8 mx-auto text-gray-400" />
                  <div className="mt-2 text-sm text-gray-500">No se encontraron productos</div>
                </TableCell>
              </TableRow>
            ) : (
              products.map((product) => (
                <TableRow key={product.id}>
                  <TableCell className="font-medium">{product.name}</TableCell>
                  <TableCell>{product.sku}</TableCell>
                  <TableCell>{formatPrice(product.price)}</TableCell>
                  <TableCell>{product.totalStock}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" size="sm" onClick={() => setEditingProduct(product)}>
                        <Edit className="h-4 w-4 mr-1" />
                        Editar
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => setStockProduct(product)}>
                        Ajustar Stock
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => setMovementProduct(product)}>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Diálogos para editar producto */}
      {editingProduct && (
        <ProductFormDialog
          product={editingProduct}
          open={!!editingProduct}
          onOpenChange={() => setEditingProduct(null)}
        />
      )}

      {/* Diálogo para ajustar stock */}
      {stockProduct && (
        <StockAdjustmentDialog
          product={stockProduct}
          open={!!stockProduct}
          onOpenChange={() => setStockProduct(null)}
        />
      )}

      {/* Diálogo para registrar movimiento */}
      {movementProduct && (
        <StockMovementDialog
          product={movementProduct}
          open={!!movementProduct}
          onOpenChange={() => setMovementProduct(null)}
        />
      )}
    </div>
  )
}
