"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useIntegrations } from "@/lib/integrations-context"

interface ShopifyConnectionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ShopifyConnectionDialog({ open, onOpenChange }: ShopifyConnectionDialogProps) {
  const { connectShopify, isLoading } = useIntegrations()
  const [formData, setFormData] = useState({
    store_url: "",
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Manejar cambios en el formulario
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))

    // Limpiar error del campo
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }))
    }
  }

  // Validar formulario
  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.store_url.trim()) {
      newErrors.store_url = "La URL de la tienda es obligatoria"
    } else if (!formData.store_url.includes(".myshopify.com")) {
      newErrors.store_url = "Debe ser una URL válida de Shopify (ej: mi-tienda.myshopify.com)"
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

    const result = await connectShopify(formData)

    if (result.success && result.authUrl) {
      // Redirigir a la URL de autorización de Shopify
      window.location.href = result.authUrl
    }
  }

  // Resetear formulario al cerrar
  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      setFormData({ store_url: "" })
      setErrors({})
    }
    onOpenChange(newOpen)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <span className="text-2xl">🛍️</span>
            <span>Conectar con Shopify</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-md">
            <h4 className="font-medium text-blue-900 mb-2">¿Cómo conectar tu tienda Shopify?</h4>
            <ol className="text-sm text-blue-800 space-y-1">
              <li>1. Ingresa la URL de tu tienda Shopify</li>
              <li>2. Serás redirigido a Shopify para autorizar la conexión</li>
              <li>3. Una vez autorizado, volverás automáticamente a RetailStock</li>
            </ol>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="store_url">URL de la Tienda Shopify</Label>
              <Input
                id="store_url"
                name="store_url"
                value={formData.store_url}
                onChange={handleChange}
                placeholder="mi-tienda.myshopify.com"
                className={errors.store_url ? "border-red-500" : ""}
              />
              {errors.store_url && <p className="text-sm text-red-500">{errors.store_url}</p>}
              <p className="text-xs text-gray-500">
                Ingresa solo el nombre de tu tienda, sin "https://" (ej: mi-tienda.myshopify.com)
              </p>
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Conectando..." : "Conectar con Shopify"}
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  )
}
