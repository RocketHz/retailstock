"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useInventory, type Product } from "@/lib/inventory-context"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface StockMovementDialogProps {
  product: Product
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function StockMovementDialog({ product, open, onOpenChange }: StockMovementDialogProps) {
  const { registerStockMovement, fetchLocations, locations, isLoading } = useInventory()
  const [formData, setFormData] = useState({
    locationId: "",
    type: "in" as "in" | "out",
    quantity: "",
    notes: "",
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Cargar ubicaciones al abrir el diálogo
  useEffect(() => {
    if (open) {
      fetchLocations()
    }
  }, [open, fetchLocations])

  // Inicializar formulario
  useEffect(() => {
    if (product && product.stockLevels.length > 0) {
      setFormData((prev) => ({
        ...prev,
        locationId: product.stockLevels[0].locationId,
      }))
    } else if (locations.length > 0) {
      setFormData((prev) => ({
        ...prev,
        locationId: locations[0].id,
      }))
    }
  }, [product, locations])

  // Manejar cambios en los campos del formulario
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }))
    }
  }

  // Manejar cambio en selects
  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }))
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
    } else if (isNaN(Number.parseInt(formData.quantity)) || Number.parseInt(formData.quantity) <= 0) {
      newErrors.quantity = "La cantidad debe ser un número positivo"
    }

    // Validar que hay suficiente stock para movimientos de salida
    if (formData.type === "out" && formData.locationId && formData.quantity) {
      const stockLevel = product.stockLevels.find((level) => level.locationId === formData.locationId)
      const currentStock = stockLevel ? stockLevel.quantity : 0
      const requestedQuantity = Number.parseInt(formData.quantity)

      if (requestedQuantity > currentStock) {
        newErrors.quantity = `Stock insuficiente. Disponible: ${currentStock} unidades`
      }
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

    const success = await registerStockMovement({
      productId: product.id,
      locationId: formData.locationId,
      type: formData.type,
      quantity: Number.parseInt(formData.quantity),
      notes: formData.notes || undefined,
    })

    if (success) {
      onOpenChange(false)
      // Resetear formulario
      setFormData({
        locationId: formData.locationId,
        type: "in",
        quantity: "",
        notes: "",
      })
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
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Registrar Movimiento - {product.name}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="locationId">Ubicación</Label>
            <Select value={formData.locationId} onValueChange={(value) => handleSelectChange("locationId", value)}>
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
            <p className="text-sm text-gray-500">Stock actual: {getCurrentStock()} unidades</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="type">Tipo de Movimiento</Label>
            <Select value={formData.type} onValueChange={(value) => handleSelectChange("type", value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="in">Entrada (Añadir stock)</SelectItem>
                <SelectItem value="out">Salida (Reducir stock)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="quantity">Cantidad</Label>
            <Input
              id="quantity"
              name="quantity"
              type="number"
              min="1"
              value={formData.quantity}
              onChange={handleChange}
              placeholder="0"
              className={errors.quantity ? "border-red-500" : ""}
            />
            {errors.quantity && <p className="text-sm text-red-500">{errors.quantity}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notas (opcional)</Label>
            <Textarea
              id="notes"
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              placeholder="Motivo del movimiento, proveedor, etc."
              rows={3}
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Registrando..." : "Registrar Movimiento"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
