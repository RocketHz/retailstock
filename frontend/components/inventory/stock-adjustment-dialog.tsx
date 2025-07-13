"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useInventory, type Product } from "@/lib/inventory-context"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface StockAdjustmentDialogProps {
  product: Product
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function StockAdjustmentDialog({ product, open, onOpenChange }: StockAdjustmentDialogProps) {
  const { adjustStock, fetchLocations, locations, isLoading } = useInventory()
  const [formData, setFormData] = useState({
    locationId: "",
    quantity: "0",
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Cargar ubicaciones al abrir el diálogo
  useEffect(() => {
    if (open) {
      fetchLocations()
    }
  }, [open, fetchLocations])

  // Inicializar formulario con la primera ubicación del producto
  useEffect(() => {
    if (product && product.stockLevels.length > 0) {
      const firstStockLevel = product.stockLevels[0]
      setFormData({
        locationId: firstStockLevel.locationId,
        quantity: firstStockLevel.quantity.toString(),
      })
    } else if (locations.length > 0) {
      setFormData({
        locationId: locations[0].id,
        quantity: "0",
      })
    }
  }, [product, locations])

  // Actualizar cantidad cuando cambia la ubicación seleccionada
  useEffect(() => {
    if (product && formData.locationId) {
      const stockLevel = product.stockLevels.find((level) => level.locationId === formData.locationId)
      if (stockLevel) {
        setFormData((prev) => ({ ...prev, quantity: stockLevel.quantity.toString() }))
      } else {
        setFormData((prev) => ({ ...prev, quantity: "0" }))
      }
    }
  }, [formData.locationId, product])

  // Manejar cambio en input de cantidad
  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target
    setFormData((prev) => ({ ...prev, quantity: value }))

    if (errors.quantity) {
      setErrors((prev) => ({ ...prev, quantity: "" }))
    }
  }

  // Manejar cambio en select de ubicación
  const handleLocationChange = (value: string) => {
    setFormData((prev) => ({ ...prev, locationId: value }))

    if (errors.locationId) {
      setErrors((prev) => ({ ...prev, locationId: "" }))
    }
  }

  // Validar formulario
  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.locationId) {
      newErrors.locationId = "La ubicación es obligatoria"
    }

    if (!formData.quantity.trim()) {
      newErrors.quantity = "La cantidad es obligatoria"
    } else if (isNaN(Number.parseInt(formData.quantity)) || Number.parseInt(formData.quantity) < 0) {
      newErrors.quantity = "La cantidad debe ser un número no negativo"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Manejar envío del formulario
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    const success = await adjustStock(product.i, formData.locationId, Number.parseInt(formData.quantity))

    if (success) {
      onOpenChange(false)
    }
  }

  // Obtener el stock actual para la ubicación seleccionada
  const getCurrentStock = () => {
    if (!formData.locationId) return 0
    const stockLevel = product.stockLevels.find((level) => level.locationId === formData.locationId)
    return stockLevel ? stockLevel.quantity : 0
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>Ajustar Stock - {product.name}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="locationId">Ubicación</Label>
            <Select value={formData.locationId} onValueChange={handleLocationChange}>
              <SelectTrigger className={errors.locationId ? "border-red-500" : ""}>
                <SelectValue placeholder="Seleccionar ubicación" />
              </SelectTrigger>
              <SelectContent>
                {locations.map((location) => (
                  <SelectItem key={location.id} value={location.id}>
                    {location.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.locationId && <p className="text-sm text-red-500">{errors.locationId}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="quantity">Nueva Cantidad</Label>
            <Input
              id="quantity"
              name="quantity"
              type="number"
              min="0"
              value={formData.quantity}
              onChange={handleQuantityChange}
              placeholder="0"
              className={errors.quantity ? "border-red-500" : ""}
            />
            {errors.quantity && <p className="text-sm text-red-500">{errors.quantity}</p>}
            <p className="text-sm text-gray-500">Stock actual: {getCurrentStock()} unidades</p>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Ajustando..." : "Ajustar Stock"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
