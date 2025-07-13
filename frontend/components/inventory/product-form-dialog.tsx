"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useInventory, type Product } from "@/lib/inventory-context"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus } from "lucide-react"

interface ProductFormDialogProps {
  product?: Product
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

export function ProductFormDialog({ product, open, onOpenChange }: ProductFormDialogProps) {
  const { addProduct, updateProduct, fetchLocations, locations, isLoading } = useInventory()
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    sku: "",
    description: "",
    price: "",
    locationId: "",
    initialQuantity: "0",
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Manejar apertura/cierre del diálogo
  const handleOpenChange = (newOpen: boolean) => {
    setIsDialogOpen(newOpen)
    if (onOpenChange) onOpenChange(newOpen)
  }

  // Cargar ubicaciones al abrir el diálogo
  useEffect(() => {
    if (isDialogOpen || open) {
      fetchLocations()
    }
  }, [isDialogOpen, open, fetchLocations])

  // Inicializar formulario con datos del producto si se está editando
  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name,
        sku: product.sku,
        description: product.description || "",
        price: product.price.toString(),
        locationId: product.stockLevels[0]?.locationId || "",
        initialQuantity: "0", // No relevante para edición
      })
    } else {
      // Resetear formulario para nuevo producto
      setFormData({
        name: "",
        sku: "",
        description: "",
        price: "",
        locationId: locations[0]?.id || "",
        initialQuantity: "0",
      })
    }
  }, [product, locations])

  // Manejar cambios en los campos del formulario
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))

    // Limpiar error del campo
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }))
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

    if (!formData.name.trim()) {
      newErrors.name = "El nombre es obligatorio"
    }

    if (!formData.sku.trim()) {
      newErrors.sku = "El SKU es obligatorio"
    }

    if (!formData.price.trim()) {
      newErrors.price = "El precio es obligatorio"
    } else if (isNaN(Number.parseFloat(formData.price)) || Number.parseFloat(formData.price) < 0) {
      newErrors.price = "El precio debe ser un número positivo"
    }

    if (!product) {
      // Solo validar estos campos para nuevos productos
      if (!formData.locationId) {
        newErrors.locationId = "La ubicación es obligatoria"
      }

      if (isNaN(Number.parseInt(formData.initialQuantity)) || Number.parseInt(formData.initialQuantity) < 0) {
        newErrors.initialQuantity = "La cantidad inicial debe ser un número no negativo"
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

    const productData = {
      name: formData.name,
      sku: formData.sku,
      description: formData.description,
      price: Number.parseFloat(formData.price),
      locationId: formData.locationId,
      initialQuantity: Number.parseInt(formData.initialQuantity),
    }

    let success = false

    if (product) {
      // Actualizar producto existente
      success = await updateProduct(product.id, {
        name: productData.name,
        sku: productData.sku,
        description: productData.description,
        price: productData.price,
      })
    } else {
      // Añadir nuevo producto
      success = await addProduct(productData)
    }

    if (success) {
      handleOpenChange(false)
    }
  }

  return (
    <Dialog open={open !== undefined ? open : isDialogOpen} onOpenChange={handleOpenChange}>
      {!product && (
        <DialogTrigger asChild>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Añadir Producto
          </Button>
        </DialogTrigger>
      )}
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{product ? "Editar Producto" : "Añadir Nuevo Producto"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nombre del Producto</Label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Nombre del producto"
              className={errors.name ? "border-red-500" : ""}
            />
            {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="sku">SKU</Label>
            <Input
              id="sku"
              name="sku"
              value={formData.sku}
              onChange={handleChange}
              placeholder="SKU único del producto"
              className={errors.sku ? "border-red-500" : ""}
            />
            {errors.sku && <p className="text-sm text-red-500">{errors.sku}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descripción (opcional)</Label>
            <Textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Descripción del producto"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="price">Precio</Label>
            <Input
              id="price"
              name="price"
              value={formData.price}
              onChange={handleChange}
              placeholder="0.00"
              className={errors.price ? "border-red-500" : ""}
            />
            {errors.price && <p className="text-sm text-red-500">{errors.price}</p>}
          </div>

          {!product && (
            <>
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
                <Label htmlFor="initialQuantity">Cantidad Inicial</Label>
                <Input
                  id="initialQuantity"
                  name="initialQuantity"
                  type="number"
                  min="0"
                  value={formData.initialQuantity}
                  onChange={handleChange}
                  placeholder="0"
                  className={errors.initialQuantity ? "border-red-500" : ""}
                />
                {errors.initialQuantity && <p className="text-sm text-red-500">{errors.initialQuantity}</p>}
              </div>
            </>
          )}

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Guardando..." : product ? "Actualizar" : "Guardar"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
